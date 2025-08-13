import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ALL_PUBLIC_ROOMS } from '../graphql/queries';
import Header from './Header';
import FlyingShips from './FlyingShips';

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';

  let seconds;
  if (typeof timestamp === 'string') {
    const secondsMatch = timestamp.match(/seconds:\s*(\d+)/);
    if (secondsMatch) {
      seconds = parseInt(secondsMatch[1]);
    }
  } else if (timestamp && timestamp.seconds !== undefined) {
    seconds = parseInt(timestamp.seconds);
  } else if (typeof timestamp === 'number') {
    seconds = timestamp;
  }

  if (!seconds || isNaN(seconds)) return 'Invalid timestamp';

  const date = new Date(seconds * 1000);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

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

export default function Rooms({ onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Получаем реальные данные через GraphQL
  const { loading, error, data } = useQuery(GET_ALL_PUBLIC_ROOMS);

  // Получаем комнаты из данных или пустой массив
  // Добавляем моковые данные для демонстрации
  const mockRooms = [
    {
      roomId: '1',
      roomName: 'Friday Movie Night',
      roomDescription: 'Watch the latest blockbusters together!',
      roomType: 'PUBLIC',
      roomCategory: 'MOVIES',
      maxParticipants: 8,
      participantsNumber: 4,
      createdAt: '2024-01-15T14:30:00Z'
    },
    {
      roomId: '2',
      roomName: 'Anime Club',
      roomDescription: 'Best anime series and movies',
      roomType: 'PUBLIC',
      roomCategory: 'ANIME',
      maxParticipants: 12,
      participantsNumber: 6,
      createdAt: '2024-01-15T15:00:00Z'
    },
    {
      roomId: '3',
      roomName: 'Gaming Streams',
      roomDescription: 'Watch gaming content together',
      roomType: 'PRIVATE',
      roomCategory: 'GAMING',
      maxParticipants: 15,
      participantsNumber: 3,
      createdAt: '2024-01-15T16:00:00Z'
    }
  ];

  console.log('Available mock rooms:', mockRooms);

  // Используем моковые данные, если GraphQL не вернул данные
  const rooms = data?.getAllPublicRooms?.length > 0 ? data.getAllPublicRooms : mockRooms;

  const handleJoinRoom = (room) => {
    console.log('Joining room:', room);
    console.log('Room ID:', room.roomId);
    console.log('Navigating to:', `/room/${room.roomId}`);
    navigate(`/room/${room.roomId}`);
  };

  const handleJoinRoomClick = (e, room) => {
    console.log('handleJoinRoomClick called with room:', room);
    e.preventDefault();
    e.stopPropagation();
    handleJoinRoom(room);
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🎬' },
    { id: 'MOVIES', name: 'Movies', icon: '🎥' },
    { id: 'SERIES', name: 'Series', icon: '📺' },
    { id: 'ANIME', name: 'Anime', icon: '🌸' },
    { id: 'MUSIC', name: 'Music', icon: '🎵' },
    { id: 'GAMING', name: 'Gaming', icon: '🎮' },
    { id: 'EDUCATION', name: 'Education', icon: '📚' },
    { id: 'SPORTS', name: 'Sports', icon: '⚽' },
    { id: 'STAND_UP', name: 'Stand-up', icon: '😂' },
    { id: 'KIDS', name: 'Kids', icon: '👶' },
    { id: 'ART', name: 'Art', icon: '🎨' },
    { id: 'TRAVEL', name: 'Travel', icon: '✈️' },
    { id: 'COOKING', name: 'Cooking', icon: '👨‍🍳' },
    { id: 'FASHION', name: 'Fashion', icon: '👗' },
    { id: 'LIVE', name: 'Live', icon: '🔴' },
    { id: 'SOCIAL', name: 'Social', icon: '👥' },
    { id: 'OTHER', name: 'Other', icon: '🌟' }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = selectedCategory === 'all' || room.roomCategory === selectedCategory;
    const matchesSearch = room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.roomDescription && room.roomDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  

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

  // Обработка ошибок
  if (error) {
    return (
      <div className="min-h-screen bg-[#070710]">
        <FlyingShips />
        <Header 
          onLogin={onLogin} 
          onRegister={onRegister} 
          onProfile={onProfile}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="pt-40 flex items-center justify-center">
          <div className="text-red-400 text-xl">Error loading rooms: {error.message}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070710]">
        <FlyingShips />
        <Header 
          onLogin={onLogin} 
          onRegister={onRegister} 
          onProfile={onProfile}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <div className="pt-40 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <div className="text-white text-xl">Loading rooms...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070710]" id="rooms">
      <FlyingShips />
      <Header 
        onLogin={onLogin} 
        onRegister={onRegister} 
        onProfile={onProfile}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <div className="pt-55 w-full">
        <div className="neon-bg-section" style={{ minHeight: '100vh' }}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Discover Amazing Rooms
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                Join live watching sessions, meet new people, and share your reactions in real-time
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search rooms or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-[#181828] border border-[#2a2a3a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                  </div>
                </div>
                
                {/* Create Room Button */}
                <button 
                  onClick={onRoomCreate}
                  className="gradient-border cursor-pointer"
                >
                  <span className="gradient-btn">Create Room</span>
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-[#181828] text-gray-300 hover:bg-[#232346] hover:text-white'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <div
                  key={room.roomId}
                  className="bg-[#181828] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 border border-[#2a2a3a] group"
                >
                  {/* Room Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-white text-6xl opacity-80">
                        {categories.find(c => c.id === room.roomCategory)?.icon || '🎬'}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Live Badge - показываем для всех активных комнат */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      ACTIVE
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(room.roomCategory)}`}>
                        {categories.find(c => c.id === room.roomCategory)?.icon} {categories.find(c => c.id === room.roomCategory)?.name}
                      </div>
                    </div>

                    {/* Users Count */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                      👥 {room.participantsNumber}/{room.maxParticipants}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">
                        {room.roomName}
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {room.roomDescription}
                    </p>

                    {/* Host Info (replaces Room ID) */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(room.roomCreator?.displayName)}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-white text-sm font-medium">{room.roomCreator?.displayName || 'Unknown'}</span>
                        <span className="text-gray-400 text-xs">{getTimeAgo(room.createdAt)}</span>
                      </div>
                    </div>

                    {/* Room Type Badge */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-[#2a2a3a] text-gray-300 text-xs rounded-full">
                        {room.roomType === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                      </span>
                      {room.needPassword && (
                        <span className="px-2 py-1 bg-[#2a2a3a] text-gray-300 text-xs rounded-full">
                          🔑 Password Required
                        </span>
                      )}
                    </div>

                    {/* Join Button */}
                    <button 
                      onClick={(e) => handleJoinRoomClick(e, room)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredRooms.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-white text-xl font-semibold mb-2">No rooms found</h3>
                <p className="text-gray-400 mb-6">
                  {rooms.length === 0 
                    ? "No rooms available yet. Be the first to create one!"
                    : "Try adjusting your search or create a new room!"
                  }
                </p>
                <button 
                  onClick={onRoomCreate}
                  className="gradient-border cursor-pointer"
                >
                  <span className="gradient-btn">
                    {rooms.length === 0 ? 'Create First Room' : 'Create New Room'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 