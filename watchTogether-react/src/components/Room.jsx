import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import Header from './Header';
import { JOIN_TO_ROOM, REMOVE_PARTICIPANT_FROM_ROOM } from '../graphql/mutations';
import { GET_ROOM_BY_ID } from '../graphql/queries';

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default function Room({ currentUser, onClose, onLogout }) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'John', message: 'Привет всем! 👋', timestamp: '14:30' },
    { id: 2, user: 'Alice', message: 'Привет! Готовы смотреть?', timestamp: '14:31' },
    { id: 3, user: 'Bob', message: 'Да, давайте начнем!', timestamp: '14:32' },
    { id: 4, user: 'John', message: 'Отличный фильм выбрали', timestamp: '14:33' },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [room, setRoom] = useState(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  
  const [joinRoomMutation] = useMutation(JOIN_TO_ROOM);
  const [removeParticipant] = useMutation(REMOVE_PARTICIPANT_FROM_ROOM);
  const joinCalledRef = useRef(false);

  const { data: roomData, loading: roomLoading, error: roomError, refetch: refetchRoom } = useQuery(
    GET_ROOM_BY_ID,
    {
      variables: { roomId },
      skip: !roomId,
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        console.log('GET_ROOM_BY_ID completed:', data);
      },
      onError: (error) => {
        console.error('GET_ROOM_BY_ID error:', error);
      }
    }
  );

  // Реальные участники придут из joinToRoom -> room.roomParticipants

  // ===== ФУНКЦИИ НАВИГАЦИИ (должны быть объявлены до useEffect) =====
  
  // Функция для безопасной навигации из комнаты
  const safeNavigate = (path) => {
    setPendingNavigation(path);
    setShowExitConfirmation(true);
  };

  // Функция для отмены выхода
  const cancelExit = () => {
    setShowExitConfirmation(false);
    setPendingNavigation(null);
  };

  // Функция для выхода из комнаты
  const handleLeaveRoom = async () => {
    try {
      if (roomId && currentUser?.id) {
        await removeParticipant({
          variables: { roomId: String(roomId), participantId: String(currentUser.id) },
        });
      }
    } catch (e) {
      console.warn('Leave room error:', e);
    } finally {
      if (onClose) {
        onClose();
      } else {
        navigate('/rooms');
      }
    }
  };

  // ===== useEffect ХУКИ =====

  // Обработка навигации браузера (кнопки назад/вперед)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (room && currentUser?.id) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the room?';
        return 'Are you sure you want to leave the room?';
      }
    };

    const handlePopState = (e) => {
      if (room && currentUser?.id) {
        // Предотвращаем навигацию назад/вперед без подтверждения
        e.preventDefault();
        safeNavigate(location.pathname);
        // Восстанавливаем текущий URL
        window.history.pushState(null, '', location.pathname);
      }
    };

    if (room && currentUser?.id) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [room, currentUser?.id, safeNavigate, location.pathname]);

  // Отслеживаем изменения в roomData и устанавливаем room state
  useEffect(() => {
    if (roomData?.getRoomById) {
      console.log('Setting room from roomData:', roomData.getRoomById);
      console.log('Current room state before update:', room);
      console.log('Room participants from roomData:', roomData.getRoomById.roomParticipants);
      console.log('Setting room state to:', roomData.getRoomById);
      setRoom(roomData.getRoomById);
    }
  }, [roomData]);

  // При заходе в комнату — присоединяемся, затем грузим реальные данные
  useEffect(() => {
    if (!roomId || !currentUser?.id) {
      console.log('Missing required data for join:', { roomId, currentUserId: currentUser?.id });
      return;
    }

    console.log('Room useEffect triggered:', { roomId, currentUserId: currentUser.id });

    // If navigation came from invite, respect state flag and set guard
    let navigatedJoined = false;
    try {
      const historyState = window.history.state;
      console.log('Full history state:', historyState);
      // Проверяем оба варианта: state.usr.joined и state.joined
      navigatedJoined = Boolean(
        (historyState && historyState.usr && historyState.usr.joined) ||
        (historyState && historyState.joined)
      );
      console.log('Navigation state check:', { 
        historyState, 
        usr: historyState?.usr, 
        usrJoined: historyState?.usr?.joined,
        directJoined: historyState?.joined,
        navigatedJoined 
      });
    } catch (_) {
      navigatedJoined = false;
    }

    const dedupeKey = `room_join:${roomId}:${currentUser.id}`;
    let alreadyJoined = sessionStorage.getItem(dedupeKey) === 'done';
    console.log('Join status:', { dedupeKey, alreadyJoined, navigatedJoined });
    console.log('SessionStorage content:', {
      [dedupeKey]: sessionStorage.getItem(dedupeKey),
      allKeys: Object.keys(sessionStorage)
    });

    // ВАЖНО: Проверяем, действительно ли пользователь является участником комнаты
    // Просто флаг в sessionStorage не гарантирует, что пользователь в БД
    const isActuallyParticipant = roomData?.getRoomById?.roomParticipants?.some(
      p => p.userId === currentUser.id
    );
    console.log('Actual participant check:', { 
      roomData: roomData?.getRoomById, 
      roomParticipants: roomData?.getRoomById?.roomParticipants,
      currentUserId: currentUser.id,
      isActuallyParticipant,
      roomDataExists: !!roomData,
      getRoomByIdExists: !!roomData?.getRoomById,
      participantsArrayExists: !!roomData?.getRoomById?.roomParticipants
    });

    // Если пользователь уже присоединился И является реальным участником
    if ((alreadyJoined || navigatedJoined) && isActuallyParticipant) {
      sessionStorage.setItem(dedupeKey, 'done');
      joinCalledRef.current = true;
      console.log('Already joined AND is actual participant, just fetching room info');
      // still fetch latest room info
      refetchRoom();
      return;
    }

    // Если флаг есть, но пользователь не участник - очищаем флаг
    if (alreadyJoined && !isActuallyParticipant) {
      console.log('Flag exists but user is not participant, clearing flag and joining');
      sessionStorage.removeItem(dedupeKey);
      alreadyJoined = false;
    }

    if (joinCalledRef.current) {
      console.log('Join already called, skipping');
      return;
    }
    
    console.log('Starting join process - user will be added to room');
    console.log('This means joinToRoom mutation WILL be called');
    sessionStorage.setItem(dedupeKey, 'done');
    joinCalledRef.current = true;

    const join = async () => {
      try {
        console.log('Calling joinToRoom mutation with data:', {
          roomId: String(roomId),
          participantId: String(currentUser.id),
          participantDisplayName: currentUser.displayName || currentUser.username || currentUser.login || 'User',
        });
        
        const { data } = await joinRoomMutation({
          variables: {
            request: {
              roomId: String(roomId),
              participantId: String(currentUser.id),
              participantDisplayName: currentUser.displayName || currentUser.username || currentUser.login || 'User',
              password: "",
            },
          },
        });

        console.log('Join mutation result:', data);
        const payload = data?.joinToRoom;
        if (!payload || !payload.success) {
          console.warn('Join failed:', payload?.message);
          // Убираем флаг из sessionStorage если join не удался
          sessionStorage.removeItem(dedupeKey);
          navigate('/rooms');
          return;
        }

        console.log('Join successful! User is now in room');
        
        // Если сервер возвращает всю комнату — можно сразу положить в state
        if (payload.roomId && payload.roomName) {
          console.log('Setting room from join response');
          const newRoomData = {
            roomId: payload.roomId,
            roomName: payload.roomName,
            roomDescription: payload.roomDescription,
            roomType: payload.roomType,
            roomCategory: payload.roomCategory,
            maxParticipants: payload.maxParticipants,
            participantsNumber: payload.participantsNumber,
            createdAt: payload.createdAt,
            roomParticipants: payload.roomParticipants || [],
          };
          console.log('New room data from join response:', newRoomData);
          setRoom(newRoomData);
        }

        // Подтянуть актуальные данные по ID (например, creator)
        console.log('Refetching room data after successful join');
        const refreshed = await refetchRoom();
        const updated = refreshed?.data?.getRoomById || null;
        console.log('Refreshed room data:', updated);
        setRoom(prev => (updated ? { ...updated, roomParticipants: prev?.roomParticipants || [] } : prev));
      } catch (e) {
        console.error('Join error:', e);
        // Убираем флаг из sessionStorage если произошла ошибка
        sessionStorage.removeItem(dedupeKey);
        try {
          console.log('Trying to fetch room data after join error');
          const refreshed = await refetchRoom();
          const maybeRoom = refreshed?.data?.getRoomById || null;
          if (maybeRoom) {
            console.log('Setting room from fallback fetch');
            setRoom(maybeRoom);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
        navigate('/rooms');
      }
    };

    join();
  }, [roomId, currentUser?.id, joinRoomMutation, refetchRoom, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        user: currentUser?.displayName || currentUser?.username || 'You',
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenSettings = () => {
    console.log('Settings clicked');
  };

  // Функция для подтверждения выхода из комнаты
  const confirmExit = async () => {
    setShowExitConfirmation(false);
    if (pendingNavigation) {
      await handleLeaveRoom();
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Если комната еще загружается
  if (!room || roomLoading) {
    console.log('Room loading state:', { room, roomLoading, roomId });
    console.log('Room data available:', { roomData: !!roomData, roomDataContent: roomData });
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading room... (ID: {roomId})</div>
          <div className="text-gray-400 text-sm mt-2">
            Room: {room ? 'Loaded' : 'Not loaded'} | Loading: {roomLoading ? 'Yes' : 'No'}
          </div>
          {room && (
            <div className="text-gray-400 text-xs mt-2">
              Room data: {room.roomName} | Participants: {room.roomParticipants ? room.roomParticipants.length : 0}
            </div>
          )}
          {roomData && (
            <div className="text-gray-400 text-xs mt-2">
              GraphQL data: {roomData.getRoomById ? 'Available' : 'Not available'} | 
              Participants in GraphQL: {roomData.getRoomById?.roomParticipants ? roomData.getRoomById.roomParticipants.length : 0}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070710] flex flex-col">
      {/* Отладочная информация */}
      <div className="fixed top-0 left-0 z-50 bg-green-500 text-white p-2 text-xs">
        Room loaded: {room?.roomName} (ID: {roomId})
        <br />
        Participants: {room?.roomParticipants ? room.roomParticipants.length : 0}
        <br />
        Room state: {room ? 'Loaded' : 'Not loaded'}
        <br />
        Room data: {roomData ? 'Available' : 'Not available'}
        <br />
        Join called: {joinCalledRef.current ? 'Yes' : 'No'}
      </div>
      
      <Header 
        onLogin={() => {}} 
        onRegister={() => {}} 
        onProfile={() => {}}
        isAuthenticated={true}
        currentUser={currentUser}
        onLogout={onLogout}
        safeNavigate={safeNavigate}
        isInRoom={true}
      />
      
      <div className="flex-1 flex pt-20">
        {/* Левая часть - Видеоплеер */}
        <div className="flex-1 p-6">
          <div className="bg-[#181828] rounded-2xl p-6 h-full">
            {/* Заголовок комнаты */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-2xl font-bold">{room.roomName}</h1>
                <p className="text-gray-400">{room.roomDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenSettings}
                  title="Settings (coming soon)"
                  className="px-4 py-2 bg-[#2a2a4a] hover:bg-[#35356a] text-white rounded-lg transition-colors cursor-pointer"
                >
                  Settings
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Leave Room
                </button>
              </div>
            </div>

            {/* Видеоплеер */}
            <div className="bg-black rounded-xl overflow-hidden mb-6">
              <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                {/* Заглушка для видео */}
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-xl mb-2">Video Player</p>
                  <p className="text-gray-300">Video content will appear here</p>
                </div>
                
                {/* Кнопка Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors cursor-pointer"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    {isPlaying ? (
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </div>
                </button>

                {/* Элементы управления поверх видео */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                    <div className="w-20 h-1 bg-white/30 rounded-full cursor-pointer">
                      <div className="w-16 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h2v-5zm3.2 0H9.8L9 15.1V14H7v7h2v-2.5l1.8 2.5H12L9.3 14.5 12 14zm7-5h-4v8h2v-3h2c1.1 0 2-.9 2-2s-.9-2-2-2zm0 3h-2V9h2v3z"/>
                      </svg>
                    </button>
                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h2v-5zm3.2 0H9.8L9 15.1V14H7v7h2v-2.5l1.8 2.5H12L9.3 14.5 12 14zm7-5h-4v8h2v-3h2c1.1 0 2-.9 2-2s-.9-2-2-2zm0 3h-2V9h2v3z"/>
                      </svg>
                    </button>
                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h2v-5zm3.2 0H9.8L9 15.1V14H7v7h2v-2.5l1.8 2.5H12L9.3 14.5 12 14zm7-5h-4v8h2v-3h2c1.1 0 2-.9 2-2s-.9-2-2-2zm0 3h-2V9h2v3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Прогресс-бар */}
              <div className="p-4">
                <div 
                  className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  ></div>
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-pointer"
                    style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-white text-sm mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Информация о видео */}
            <div className="bg-[#232346] rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold mb-2">Current Video</h3>
              <p className="text-gray-300 text-sm">No video selected. Host can add a video link.</p>
            </div>

            {/* Настройки видео */}
            <div className="bg-[#232346] rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Video Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Quality</label>
                  <select className="w-full p-2 bg-[#181828] text-white rounded-lg border border-[#35356a] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Speed</label>
                  <select className="w-full p-2 bg-[#181828] text-white rounded-lg border border-[#35356a] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer text-sm">
                  Add Video Link
                </button>
                <button className="px-4 py-2 bg-[#181828] hover:bg-[#2a2a4a] text-white rounded-lg transition-colors cursor-pointer text-sm">
                  Sync with Host
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть - Панель */}
        <div className="w-80 bg-[#181828] border-l border-[#232346] flex flex-col">
          {/* Информация о комнате */}
              <div className="p-6 border-b border-[#232346]">
            <h3 className="text-white font-semibold mb-4">Room Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status:</span>
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Participants:</span>
                    <span className="text-white">{room.participantsNumber}/{room.maxParticipants}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Type:</span>
                <span className="text-white">{room.roomType === 'PRIVATE' ? '🔒 Private' : '🌐 Public'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Category:</span>
                <span className="text-white">{room.roomCategory}</span>
              </div>
            </div>
          </div>

          {/* Quick Reactions removed by request */}

          {/* Список участников */}
              <div className="p-6 border-b border-[#232346] flex-1">
            <h3 className="text-white font-semibold mb-4">Participants</h3>
            <div className="space-y-3">
                  {(room.roomParticipants || []).map(p => (
                    <div key={p.userId} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(p.displayName)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{p.displayName || 'User'}</span>
                          {p.userId === room.roomCreator?.userId && (
                            <span className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full">Host</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Joined</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Чат */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-white font-semibold mb-4">Chat</h3>
            
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-64">
              {chatMessages.map(msg => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-indigo-400 text-sm font-medium">{msg.user}</span>
                    <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                  </div>
                  <p className="text-white text-sm bg-[#232346] rounded-lg px-3 py-2">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Форма отправки сообщения */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-[#232346] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Модальное окно подтверждения выхода из комнаты */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#181828] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#2a2a3a]">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-white text-xl font-bold mb-2">Leave Room?</h3>
              <p className="text-gray-400">
                Are you sure you want to leave "{room?.roomName}"? You will be disconnected from the room.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-3 bg-[#2a2a3a] hover:bg-[#35356a] text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
