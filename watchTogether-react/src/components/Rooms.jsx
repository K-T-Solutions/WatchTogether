import { useState, useEffect } from 'react';
import Header from './Header';
import FlyingShips from './FlyingShips';

export default function Rooms({ onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate }) {
  const [rooms, setRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Моковые данные для демонстрации
  useEffect(() => {
    const mockRooms = [
      {
        id: 1,
        name: "Marvel Movie Night",
        category: "movies",
        currentUsers: 3,
        maxUsers: 8,
        host: "Alex",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        description: "Watching the latest Marvel blockbuster together!",
        tags: ["action", "superhero", "english"],
        isLive: true,
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 2,
        name: "Anime Club",
        category: "anime",
        currentUsers: 5,
        maxUsers: 6,
        host: "Sakura",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sakura",
        description: "Weekly anime watching session. This week: Attack on Titan",
        tags: ["anime", "action", "drama"],
        isLive: true,
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        id: 3,
        name: "Comedy Central",
        category: "comedy",
        currentUsers: 2,
        maxUsers: 10,
        host: "Mike",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        description: "Stand-up comedy night! Let's laugh together",
        tags: ["comedy", "stand-up", "english"],
        isLive: false,
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: 4,
        name: "Documentary Hour",
        category: "documentary",
        currentUsers: 1,
        maxUsers: 5,
        host: "Emma",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        description: "Exploring the depths of the ocean with David Attenborough",
        tags: ["documentary", "nature", "educational"],
        isLive: true,
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        id: 5,
        name: "Gaming Stream",
        category: "gaming",
        currentUsers: 7,
        maxUsers: 12,
        host: "GamerPro",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro",
        description: "Playing Cyberpunk 2077 with chat reactions!",
        tags: ["gaming", "rpg", "cyberpunk"],
        isLive: true,
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        id: 6,
        name: "Classic Cinema",
        category: "movies",
        currentUsers: 4,
        maxUsers: 8,
        host: "Cinephile",
        hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cinephile",
        description: "Watching Casablanca - the greatest love story ever told",
        tags: ["classic", "romance", "black&white"],
        isLive: false,
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=225&fit=crop",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      }
    ];

    // Имитация загрузки
    setTimeout(() => {
      setRooms(mockRooms);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', name: 'All', icon: '🎬' },
    { id: 'movies', name: 'Movies', icon: '🎥' },
    { id: 'anime', name: 'Anime', icon: '🌸' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'documentary', name: 'Documentary', icon: '📚' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.host.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      movies: 'from-red-500 to-pink-500',
      anime: 'from-pink-500 to-purple-500',
      comedy: 'from-yellow-500 to-orange-500',
      documentary: 'from-green-500 to-teal-500',
      gaming: 'from-blue-500 to-indigo-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

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
          <div className="text-white text-xl">Loading rooms...</div>
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
                      placeholder="Search rooms, hosts, or descriptions..."
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
                  className="gradient-border"
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
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
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
                  key={room.id}
                  className="bg-[#181828] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 border border-[#2a2a3a] group"
                >
                  {/* Room Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.thumbnail}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Live Badge */}
                    {room.isLive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(room.category)}`}>
                        {categories.find(c => c.id === room.category)?.icon} {categories.find(c => c.id === room.category)?.name}
                      </div>
                    </div>

                    {/* Users Count */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                      👥 {room.currentUsers}/{room.maxUsers}
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">
                        {room.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Host Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={room.hostAvatar}
                        alt={room.host}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">Hosted by {room.host}</p>
                        <p className="text-gray-400 text-xs">{getTimeAgo(room.createdAt)}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#2a2a3a] text-gray-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Join Button */}
                    <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
                      Join Room
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-white text-xl font-semibold mb-2">No rooms found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or create a new room!
                </p>
                <button 
                  onClick={onRoomCreate}
                  className="gradient-border"
                >
                  <span className="gradient-btn">Create First Room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 