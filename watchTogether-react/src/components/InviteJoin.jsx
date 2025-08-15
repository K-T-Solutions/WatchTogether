import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLazyQuery, useMutation } from '@apollo/client';
import { VALIDATE_INVITATION } from '../graphql/queries';
import { JOIN_TO_ROOM_BY_INVITE } from '../graphql/mutations';
import { getUserFromToken, isTokenExpired } from '../utils/jwt';

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

const getCategoryColor = (category) => {
  const colors = {
    MOVIES: 'from-red-500 to-pink-500',
    SERIES: 'from-purple-500 to-pink-500',
    ANIME: 'from-pink-500 to-purple-500',
    MUSIC: 'from-green-500 to-blue-500',
    GAMING: 'from-blue-500 to-indigo-500',
    EDUCATION: 'from-green-500 to-teal-500',
    SPORTS: 'from-orange-500 to-red-500',
    STAND_UP: 'from-yellow-500 to-orange-500',
    KIDS: 'from-pink-500 to-purple-500',
    ART: 'from-purple-500 to-indigo-500',
    TRAVEL: 'from-blue-500 to-cyan-500',
    COOKING: 'from-orange-500 to-yellow-500',
    FASHION: 'from-pink-500 to-rose-500',
    LIVE: 'from-red-500 to-orange-500',
    SOCIAL: 'from-indigo-500 to-purple-500',
    OTHER: 'from-gray-500 to-gray-600'
  };
  return colors[category] || 'from-gray-500 to-gray-600';
};

const getCategoryIcon = (category) => {
  const icons = {
    MOVIES: '🎥',
    SERIES: '📺',
    ANIME: '🌸',
    MUSIC: '🎵',
    GAMING: '🎮',
    EDUCATION: '📚',
    SPORTS: '⚽',
    STAND_UP: '😂',
    KIDS: '👶',
    ART: '🎨',
    TRAVEL: '✈️',
    COOKING: '👨‍🍳',
    FASHION: '👗',
    LIVE: '🔴',
    SOCIAL: '👥',
    OTHER: '🌟'
  };
  return icons[category] || '🎬';
};

export default function InviteJoin({ currentUser, isAuthenticated }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const calledRef = useRef(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  const [validateInvitation, { data: validationData, loading: validationLoading, error: validationError }] = useLazyQuery(VALIDATE_INVITATION, {
    fetchPolicy: 'network-only',
  });

  const [joinByInvite, { data: joinData, loading: joinLoading, error: joinError }] = useMutation(JOIN_TO_ROOM_BY_INVITE);

  // Шаг 1: Валидация инвайта при загрузке
  useEffect(() => {
    if (!code || calledRef.current) return;

    console.log('Starting invitation validation for code:', code);

    let userId;
    if (isAuthenticated && currentUser?.id) {
      userId = String(currentUser.id);
    } else {
      const token = localStorage.getItem('authToken');
      if (token && !isTokenExpired(token)) {
        const user = getUserFromToken(token);
        if (user?.id) {
          userId = String(user.id);
        }
      }
    }

    if (!userId) {
      console.log('No userId found, redirecting to login');
      window.location.hash = 'login';
      return;
    }

    console.log('Validating invitation with userId:', userId);
    calledRef.current = true;
    validateInvitation({ variables: { inviteCode: code, userId } });
  }, [code, isAuthenticated, currentUser, validateInvitation]);

  // Обработка результата валидации
  useEffect(() => {
    if (!validationData) return;
    
    console.log('Validation data received:', validationData);
    const payload = validationData.validateInvitation;
    if (payload?.success && payload?.room) {
      console.log('Validation successful, setting room info:', payload.room);
      setRoomInfo(payload.room);
    } else {
      console.log('Validation failed:', payload);
    }
  }, [validationData]);

  // Обработка результата входа в комнату
  useEffect(() => {
    if (!joinData) return;
    
    const payload = joinData.joinToRoomByInvite;
    if (payload?.success && payload?.roomId) {
      // Mark that this user already joined this room in this tab to avoid double-join in Room.jsx
      let userId;
      if (currentUser?.id) {
        userId = String(currentUser.id);
      } else {
        const token = localStorage.getItem('authToken');
        const user = token && !isTokenExpired(token) ? getUserFromToken(token) : null;
        if (user?.id) userId = String(user.id);
      }
      if (userId) {
        const dedupeKey = `room_join:${payload.roomId}:${userId}`;
        sessionStorage.setItem(dedupeKey, 'done');
        console.log('Set sessionStorage key:', dedupeKey);
      }
      if (window.location.hash) window.location.hash = '';
      console.log('Navigating to room:', payload.roomId);
      console.log('Setting navigation state:', { joined: true });
      navigate(`/room/${payload.roomId}`, { state: { joined: true } });
    }
  }, [joinData, navigate, currentUser]);

  // Функция для входа в комнату
  const handleJoinRoom = async () => {
    if (!roomInfo || !code) return;

    console.log('Starting join room process:', { roomInfo, code });

    let userId;
    let userName;
    
    if (isAuthenticated && currentUser?.id) {
      userId = String(currentUser.id);
      userName = currentUser?.displayName || currentUser?.username || currentUser?.login || 'User';
    } else {
      const token = localStorage.getItem('authToken');
      if (token && !isTokenExpired(token)) {
        const user = getUserFromToken(token);
        if (user?.id) {
          userId = String(user.id);
          userName = user.username || 'User';
        }
      }
    }

    if (!userId) {
      console.log('No userId found in handleJoinRoom, redirecting to login');
      window.location.hash = 'login';
      return;
    }

    console.log('Joining room with:', { userId, userName, roomId: roomInfo.roomId });
    setIsJoining(true);
    try {
      const result = await joinByInvite({
        variables: {
          input: {
            inviteCode: code,
            participantInfo: {
              roomId: roomInfo.roomId,
              participantId: userId,
              participantDisplayName: userName,
              password: "",
            },
          },
        },
      });
      console.log('Join mutation completed:', result);
    } catch (error) {
      console.error('Join error:', error);
      setIsJoining(false);
    }
  };

  // Если еще валидируем инвайт
  if (validationLoading) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Validating invitation...</div>
        </div>
      </div>
    );
  }

  // Если ошибка валидации
  if (validationError || (validationData && !validationData.validateInvitation?.success)) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Invalid invitation</div>
          <button onClick={() => navigate('/rooms')} className="text-indigo-400 underline cursor-pointer">Back to rooms</button>
        </div>
      </div>
    );
  }

  // Если показываем информацию о комнате
  if (roomInfo && !isJoining) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Room Card - точно такой же стиль как в Rooms */}
          <div className="bg-[#181828] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 border border-[#2a2a3a] group">
            {/* Room Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-white text-6xl opacity-80">
                  {getCategoryIcon(roomInfo.roomCategory)}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Live Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                ACTIVE
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(roomInfo.roomCategory)}`}>
                  {getCategoryIcon(roomInfo.roomCategory)} {roomInfo.roomCategory}
                </div>
              </div>

              {/* Users Count */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                👥 {roomInfo.participantsNumber}/{roomInfo.maxParticipants}
              </div>
            </div>

            {/* Room Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">
                  {roomInfo.roomName}
                </h3>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {roomInfo.roomDescription || 'No description available'}
              </p>

              {/* Host Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {getInitials(roomInfo.roomCreator?.displayName)}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white text-sm font-medium">{roomInfo.roomCreator?.displayName || 'Unknown'}</span>
                  <span className="text-gray-400 text-xs">Host</span>
                </div>
              </div>

              {/* Room Type Badge */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-[#2a2a3a] text-gray-300 text-xs rounded-full">
                  {roomInfo.roomType === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                </span>
                {roomInfo.needPassword && (
                  <span className="px-2 py-1 bg-[#2a2a3a] text-gray-300 text-xs rounded-full">
                    🔑 Password Required
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/rooms')}
                  className="flex-1 bg-[#2a2a3a] hover:bg-[#35356a] text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={joinLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joinLoading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если в процессе входа в комнату
  if (isJoining || joinLoading) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Joining room...</div>
        </div>
      </div>
    );
  }

  return null;
}


