import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

export default function Profile({ currentUser, onClose, onLogout, onViewUser }) {
  // Если currentUser равен null, показываем сообщение о загрузке или перенаправляем
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading profile...</div>
          <div className="text-gray-400">Please wait while we load your profile data.</div>
        </div>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isActivityVisible, setIsActivityVisible] = useState(true);
  const [formData, setFormData] = useState({
    username: currentUser.username,
    displayName: currentUser.displayName || currentUser.username,
    email: currentUser.email,
    bio: currentUser.bio || "No bio yet...",
    avatar: currentUser.avatar
  });

  const handleSave = () => {
    // Здесь будет логика сохранения изменений
    setIsEditing(false);
    // Можно добавить уведомление об успешном сохранении
  };

  const handleCancel = () => {
    setFormData({
      username: currentUser.username,
      displayName: currentUser.displayName || currentUser.username,
      email: currentUser.email,
      bio: currentUser.bio || "No bio yet...",
      avatar: currentUser.avatar
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#070710]">
      {/* Главное меню */}
      <Header 
        onLogin={() => {}} 
        onRegister={() => {}} 
        onProfile={() => {}}
        isAuthenticated={true}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Основной контент */}
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок страницы */}
          <div className="text-center mb-12">
            <h1 className="text-white text-4xl font-bold mb-4">Your Profile</h1>
            <p className="text-gray-400 text-lg">Manage your account settings and social connections</p>
          </div>

          {/* Карточка профиля */}
          <div className="bg-[#181828] rounded-2xl shadow-lg border border-[#232346] overflow-hidden">
            {/* Основная информация */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Аватар */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <img 
                      src={formData.avatar} 
                      alt="Avatar" 
                      className="w-40 h-40 rounded-full border-4 border-indigo-500"
                    />
                    {isEditing && (
                      <button className="absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full transition-colors shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Member since</p>
                    <p className="text-white font-medium">
                      {new Date(currentUser.id).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Социальные счетчики */}
                  <div className="flex gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{currentUser.friends?.length || 0}</p>
                      <p className="text-gray-400 text-xs">Friends</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{currentUser.followers || 0}</p>
                      <p className="text-gray-400 text-xs">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{currentUser.following || 0}</p>
                      <p className="text-gray-400 text-xs">Following</p>
                    </div>
                  </div>
                </div>

                {/* Информация профиля */}
                <div className="flex-1 space-y-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                        placeholder="Enter your display name..."
                      />
                    ) : (
                      <p className="text-white text-xl font-medium">{currentUser.displayName || currentUser.username}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                        disabled
                      />
                    ) : (
                      <p className="text-white text-lg">@{currentUser.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                      />
                    ) : (
                      <p className="text-white text-lg">{currentUser.email}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-lg"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-white text-lg">{currentUser.bio || "No bio yet..."}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-[#232346] px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-semibold">Your Activity</h3>
                <button
                  onClick={() => setIsActivityVisible(!isActivityVisible)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${isActivityVisible ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isActivityVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-[#181828] rounded-lg">
                    <p className="text-3xl font-bold text-indigo-400">0</p>
                    <p className="text-gray-400 text-sm">Rooms Created</p>
                  </div>
                  <div className="text-center p-4 bg-[#181828] rounded-lg">
                    <p className="text-3xl font-bold text-indigo-400">0</p>
                    <p className="text-gray-400 text-sm">Sessions Joined</p>
                  </div>
                  <div className="text-center p-4 bg-[#181828] rounded-lg">
                    <p className="text-3xl font-bold text-indigo-400">0</p>
                    <p className="text-gray-400 text-sm">Hours Watched</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Список друзей */}
            <div className="p-8 border-t border-[#232346]">
              <h3 className="text-white text-lg font-semibold mb-4">Friends</h3>
              <div className="flex flex-wrap gap-6">
                {(currentUser.friends && currentUser.friends.length > 0) ? (
                  currentUser.friends.map((friend, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-[#232346] rounded-lg p-4 w-32">
                      <img src={friend.avatar} alt={friend.displayName || friend.username} className="w-14 h-14 rounded-full mb-2 border-2 border-indigo-400" />
                      <span className="text-white font-medium text-sm">{friend.displayName || friend.username}</span>
                      <span className="text-gray-400 text-xs">@{friend.username}</span>
                      <button 
                        onClick={() => onViewUser(friend)}
                        className="mt-2 text-xs text-indigo-400 hover:underline hover:text-indigo-300 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No friends yet.</p>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="p-8 border-t border-[#232346]">
              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:opacity-90 transition text-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-8 py-4 bg-[#232346] text-white font-medium rounded-lg hover:bg-[#2a2a4a] transition text-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:opacity-90 transition text-lg"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-8 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-lg"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 