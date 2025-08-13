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
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
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
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок страницы */}
          <div className="text-center mb-12">
            <h1 className="text-white text-4xl font-bold mb-4">Your Profile</h1>
            <p className="text-gray-400 text-lg">Manage your account settings and social connections</p>
          </div>


          {/* Трехколоночный макет: слева — профиль, центр — контент, справа — панель ачивок */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)_300px] gap-6 xl:gap-8">
            {/* Левая колонка: карточка профиля */}
            <aside>
              <div className="bg-[#181828] rounded-2xl shadow-lg border border-[#232346] overflow-hidden p-8 flex flex-col items-start">
                <img
                  src={mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt="Avatar"
                  className="w-48 h-48 rounded-full border-4 border-indigo-500"
                />

                <div className="text-left mt-4 w-full">
                  <h2 className="text-white text-2xl font-bold leading-tight">{mergedUserData?.displayName || mergedUserData?.username || 'Unknown'}</h2>
                  <div className="text-gray-400 mt-1">@{mergedUserData?.username || 'unknown'}</div>
                </div>

                <button
                  onClick={handleEditProfile}
                  className="mt-3 w-full px-4 py-2 text-sm rounded-md bg-[#232346] text-white hover:bg-[#2a2a4a] border border-[#2b2b4a] transition"
                >
                  Edit profile
                </button>

                <div className="flex flex-nowrap items-center gap-x-2 text-sm mt-3 w-full">
                  <span className="text-gray-300"><span className="text-indigo-400 font-semibold">{mergedUserData?.friends?.length || 0}</span> friends</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300"><span className="text-indigo-400 font-semibold">{mergedUserData?.followers || 0}</span> follower{(mergedUserData?.followers || 0) === 1 ? '' : 's'}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300"><span className="text-indigo-400 font-semibold">{mergedUserData?.following || 0}</span> following</span>
                </div>

                <div className="text-gray-300 text-sm mt-2">{mergedUserData?.email || 'No email'}</div>
                <p className="text-gray-400 text-sm text-left mt-2">{mergedUserData?.bio || 'No bio yet...'}</p>

                <div className="text-gray-500 text-xs mt-2">
                  Member since{' '}
                  {(() => {
                    try {
                      return mergedUserData?.joinDate ? new Date(mergedUserData.joinDate).toLocaleDateString() : 'Unknown';
                    } catch (e) {
                      return 'Unknown';
                    }
                  })()}
                </div>

                <button
                  onClick={onLogout}
                  className="mt-6 w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                >
                  Log Out
                </button>
              </div>
            </aside>

            {/* Центральная колонка: основное содержимое */}
            <main className="space-y-8">
              {/* Активность */}
              <div className="bg-[#181828] rounded-2xl border border-[#232346] overflow-hidden">
                <div className="px-8 py-6 flex items-center justify-between">
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
                <div className={`px-8 pb-6 transition-all duration-500 ease-in-out overflow-hidden ${isActivityVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-[#232346] rounded-lg">
                      <p className="text-3xl font-bold text-indigo-400">0</p>
                      <p className="text-gray-400 text-sm">Rooms Created</p>
                    </div>
                    <div className="text-center p-4 bg-[#232346] rounded-lg">
                      <p className="text-3xl font-bold text-indigo-400">0</p>
                      <p className="text-gray-400 text-sm">Sessions Joined</p>
                    </div>
                    <div className="text-center p-4 bg-[#232346] rounded-lg">
                      <p className="text-3xl font-bold text-indigo-400">0</p>
                      <p className="text-gray-400 text-sm">Hours Watched</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Друзья */}
              <div className="bg-[#181828] rounded-2xl border border-[#232346] p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Friends</h3>
                  <Link to="#" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(mergedUserData?.friends && mergedUserData.friends.length > 0) ? (
                    mergedUserData.friends.map((friend, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-[#232346] rounded-lg p-4">
                        <img src={friend.avatar} alt={friend.displayName || friend.username} className="w-14 h-14 rounded-full mb-2 border-2 border-indigo-400" />
                        <span className="text-white font-medium text-sm text-center line-clamp-1">{friend.displayName || friend.username}</span>
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

              {/* Недавние комнаты (заглушка) */}
              <div className="bg-[#181828] rounded-2xl border border-[#232346] p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Recent Rooms</h3>
                  <Link to="/rooms" className="text-sm text-indigo-400 hover:text-indigo-300">Explore rooms</Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#232346] rounded-lg p-4">
                    <div className="text-gray-300">No recent rooms yet</div>
                    <span className="text-gray-500 text-sm">Coming soon</span>
                  </div>
                </div>
              </div>

              {/* Закладки/Watchlist (заглушка) */}
              <div className="bg-[#181828] rounded-2xl border border-[#232346] p-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white text-lg font-semibold">Watchlist</h3>
                  <Link to="#" className="text-sm text-indigo-400 hover:text-indigo-300">Manage</Link>
                </div>
                <p className="text-gray-400 text-sm">Save movies and shows you plan to watch together. Integration coming soon.</p>
              </div>
            </main>

            {/* Правая колонка: ачивки */}
            <aside className="space-y-8">
              <div className="bg-[#181828] rounded-2xl border border-[#232346] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Achievements</h3>
                  <span className="text-xs text-gray-500">beta</span>
                </div>
                {
                  (() => {
                    const friendsCount = mergedUserData?.friends?.length || 0;
                    const followersCount = mergedUserData?.followers || 0;
                    const followingCount = mergedUserData?.following || 0;
                    const achievements = [
                      { id: 'first-room', icon: '🎬', title: 'First Room', unlocked: false, hint: 'Create your first room' },
                      { id: 'party-10', icon: '🎉', title: 'Party Starter', unlocked: false, hint: 'Host 10 sessions' },
                      { id: 'friend-maker', icon: '🤝', title: 'Friend Maker', unlocked: friendsCount >= 5, hint: 'Add 5 friends' },
                      { id: 'social', icon: '📣', title: 'Social Buzz', unlocked: followersCount + followingCount >= 10, hint: 'Reach 10 social connections' },
                      { id: 'night-owl', icon: '🌙', title: 'Night Owl', unlocked: false, hint: 'Watch after midnight' },
                      { id: 'streak-7', icon: '🔥', title: '7‑day Streak', unlocked: false, hint: 'Be active 7 days in a row' },
                    ];
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {achievements.map(a => (
                          <div key={a.id} className={`rounded-lg p-3 border text-center ${a.unlocked ? 'bg-[#232346] border-[#2f2f58]' : 'bg-[#141426] border-[#232346] opacity-80'}`} title={a.unlocked ? a.title : a.hint}>
                            <div className="text-2xl mb-1">{a.icon}</div>
                            <div className={`text-xs ${a.unlocked ? 'text-white' : 'text-gray-500'}`}>{a.title}</div>
                            {!a.unlocked && <div className="mt-1 text-[10px] text-gray-500">locked</div>}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                }
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
} 