import { useState } from "react";
import Header from "./Header";

export default function UserProfile({ user, currentUser, onClose, onLogout }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Здесь будет логика подписки/отписки
  };

  const handleAddFriend = () => {
    // Здесь будет логика добавления в друзья
    alert(`Friend request sent to ${user.displayName || user.username}!`);
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
            <h1 className="text-white text-4xl font-bold mb-4">{user.displayName || user.username}'s Profile</h1>
            <p className="text-gray-400 text-lg">View user's profile and activity</p>
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
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-40 h-40 rounded-full border-4 border-indigo-500"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Member since</p>
                    <p className="text-white font-medium">
                      {new Date(user.id || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Социальные счетчики */}
                  <div className="flex gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{user.friends?.length || 0}</p>
                      <p className="text-gray-400 text-xs">Friends</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{user.followers || 0}</p>
                      <p className="text-gray-400 text-xs">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{user.following || 0}</p>
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
                    <p className="text-white text-xl font-medium">{user.displayName || user.username}</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Username
                    </label>
                    <p className="text-white text-lg">@{user.username}</p>
                  </div>

                  {/* Email (если публичный) */}
                  {user.publicEmail && (
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Email
                      </label>
                      <p className="text-white text-lg">{user.email}</p>
                    </div>
                  )}

                  {/* Bio */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Bio
                    </label>
                    <p className="text-white text-lg">{user.bio || "No bio yet..."}</p>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-3 rounded-lg font-medium transition cursor-pointer ${
                        isFollowing 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-gradient-to-tr from-indigo-500 to-pink-500 text-white hover:opacity-90'
                      }`}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button
                      onClick={handleAddFriend}
                      className="px-6 py-3 bg-[#232346] text-white font-medium rounded-lg hover:bg-[#2a2a4a] transition cursor-pointer"
                    >
                      Add Friend
                    </button>
                    <button className="px-6 py-3 bg-[#232346] text-white font-medium rounded-lg hover:bg-[#2a2a4a] transition cursor-pointer">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-[#232346] px-8 py-6">
              <h3 className="text-white text-lg font-semibold mb-4">Activity</h3>
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

            {/* Список друзей (если публичный) */}
            {user.publicFriends && (
              <div className="p-8 border-t border-[#232346]">
                <h3 className="text-white text-lg font-semibold mb-4">Friends</h3>
                <div className="flex flex-wrap gap-6">
                  {(user.friends && user.friends.length > 0) ? (
                    user.friends.map((friend, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-[#232346] rounded-lg p-4 w-32">
                        <img src={friend.avatar} alt={friend.username} className="w-14 h-14 rounded-full mb-2 border-2 border-indigo-400" />
                        <span className="text-white font-medium text-sm">{friend.username}</span>
                        <button className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer">View</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No friends yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Кнопка закрытия */}
            <div className="p-8 border-t border-[#232346]">
              <button
                onClick={onClose}
                className="w-full bg-[#232346] text-white font-medium py-4 rounded-lg hover:bg-[#2a2a4a] transition text-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 