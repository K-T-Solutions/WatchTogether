import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "../graphql/queries";
import { getUserFromToken } from "../utils/jwt";
import Header from "./Header";

export default function Profile({ currentUser, onClose, onLogout, onViewUser }) {
  // Все хуки должны быть в начале компонента
  const [isActivityVisible, setIsActivityVisible] = useState(true);
  const navigate = useNavigate();
  
  // Получаем ID пользователя из JWT токена
  const token = localStorage.getItem('authToken');
  const userFromToken = token ? getUserFromToken(token) : null;
  const userId = userFromToken?.id;
  


  // Загружаем данные профиля с сервера
  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  // Объединяем данные из токена с данными с сервера
  const profileData = data?.getUserProfileById;
  
  const mergedUserData = {
    ...currentUser,
    // Обновляем данные из сервера, если они есть
    displayName: profileData?.displayName || currentUser?.displayName || currentUser?.username,
    bio: profileData?.bio || currentUser?.bio || "No bio yet...",
    email: profileData?.displayEmail || currentUser?.email,
    joinDate: profileData?.joinDate || new Date().toISOString(),
    login: profileData?.login || currentUser?.username
  };
  




  // Если currentUser равен null или данные загружаются, показываем сообщение о загрузке
  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl mb-4">Loading profile...</div>
          <div className="text-gray-400">Please wait while we load your profile data.</div>
        </div>
      </div>
    );
  }

  // Если произошла ошибка при загрузке данных
  if (error) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Error loading profile</div>
          <div className="text-gray-400 mb-6">Failed to load profile data. Please try again.</div>
          <button 
            onClick={() => refetch()}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-[#070710]">
      {/* Главное меню */}
             <Header 
         onLogin={() => {}} 
         onRegister={() => {}} 
         onProfile={() => {}}
         isAuthenticated={true}
         currentUser={mergedUserData || currentUser}
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
                      src={mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                      alt="Avatar" 
                      className="w-40 h-40 rounded-full border-4 border-indigo-500"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Member since</p>
                    <p className="text-white font-medium">
                      {(() => {
                        try {
                          return mergedUserData?.joinDate ? new Date(mergedUserData.joinDate).toLocaleDateString() : 'Unknown';
                        } catch (e) {
                          return 'Unknown';
                        }
                      })()}
                    </p>
                  </div>
                  {/* Кнопка Edit Profile */}
                  <button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
                  >
                    Edit Profile
                  </button>
                  {/* Социальные счетчики */}
                  <div className="flex gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{mergedUserData?.friends?.length || 0}</p>
                      <p className="text-gray-400 text-xs">Friends</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{mergedUserData?.followers || 0}</p>
                      <p className="text-gray-400 text-xs">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-indigo-400">{mergedUserData?.following || 0}</p>
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
                    <p className="text-white text-xl font-medium">{mergedUserData?.displayName || mergedUserData?.username || 'Unknown'}</p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Username
                    </label>
                    <p className="text-white text-lg">@{mergedUserData?.username || 'unknown'}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Email
                    </label>
                    <p className="text-white text-lg">{mergedUserData?.email || 'No email'}</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Bio
                    </label>
                    <p className="text-white text-lg">{mergedUserData?.bio || "No bio yet..."}</p>
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
                 {(mergedUserData?.friends && mergedUserData.friends.length > 0) ? (
                   mergedUserData.friends.map((friend, idx) => (
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

            {/* Кнопка Log Out */}
            <div className="p-8 border-t border-[#232346]">
              <div className="flex gap-4">
                <button
                  onClick={onLogout}
                  className="px-8 py-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-lg"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 