import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "../graphql/queries";
import { getUserFromToken } from "../utils/jwt";
import Header from "./Header";

export default function Settings({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('account');
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
    displayName: profileData?.displayName || currentUser?.displayName || currentUser?.username,
    bio: profileData?.bio || currentUser?.bio || "No bio yet...",
    email: profileData?.displayEmail || currentUser?.email,
    joinDate: profileData?.joinDate || new Date().toISOString(),
    login: profileData?.login || currentUser?.username
  };

  // Инициализируем formData с безопасными значениями
  const [formData, setFormData] = useState({
    username: mergedUserData?.username || '',
    displayName: mergedUserData?.displayName || mergedUserData?.username || '',
    email: mergedUserData?.email || '',
    bio: mergedUserData?.bio || "No bio yet...",
    avatar: mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  });

  // Обновляем formData при изменении данных
  useEffect(() => {
    setFormData({
      username: mergedUserData?.username || '',
      displayName: mergedUserData?.displayName || mergedUserData?.username || '',
      email: mergedUserData?.email || '',
      bio: mergedUserData?.bio || "No bio yet...",
      avatar: mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    });
  }, [mergedUserData]);

  const handleSave = () => {
    // Здесь будет логика сохранения изменений
    // Можно добавить уведомление об успешном сохранении
  };

  const handleCancel = () => {
    setFormData({
      username: mergedUserData?.username || '',
      displayName: mergedUserData?.displayName || mergedUserData?.username || '',
      email: mergedUserData?.email || '',
      bio: mergedUserData?.bio || "No bio yet...",
      avatar: mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const menuItems = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  // Если currentUser равен null или данные загружаются, показываем сообщение о загрузке
  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-xl mb-4">Loading settings...</div>
          <div className="text-gray-400">Please wait while we load your settings.</div>
        </div>
      </div>
    );
  }

  // Если произошла ошибка при загрузке данных
  if (error) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Error loading settings</div>
          <div className="text-gray-400 mb-6">Failed to load settings data. Please try again.</div>
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

  const renderAccountSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">Account Settings</h2>
        <p className="text-gray-400">Manage your account information and preferences</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={formData.avatar || mergedUserData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full border-4 border-indigo-500"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full transition-colors shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">Profile Picture</h3>
            <p className="text-gray-400 text-sm">Upload a new profile picture</p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346] space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Display Name
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your display name..."
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled
          />
          <p className="text-gray-500 text-xs mt-1">Username cannot be changed</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your email..."
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
          >
            Update Profile
          </button>
          {/*<button*/}
          {/*  onClick={handleCancel}*/}
          {/*  className="px-6 py-3 bg-[#232346] text-white font-medium rounded-lg hover:bg-[#2a2a4a] transition"*/}
          {/*>*/}
          {/*  Cancel*/}
          {/*</button>*/}
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">Privacy Settings</h2>
        <p className="text-gray-400">Control who can see your information</p>
      </div>
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346]">
        <p className="text-gray-400">Privacy settings will be implemented soon...</p>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">Notification Settings</h2>
        <p className="text-gray-400">Manage your notification preferences</p>
      </div>
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346]">
        <p className="text-gray-400">Notification settings will be implemented soon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070710]">
      <Header 
        onLogin={() => {}} 
        onRegister={() => {}} 
        onProfile={() => navigate('/profile')}
        isAuthenticated={true}
        currentUser={mergedUserData || currentUser}
        onLogout={onLogout}
      />

      <div className="pt-24 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-white text-3xl font-bold">Settings</h1>
            </div>
            {/*<p className="text-gray-400">Manage your account settings and preferences</p>*/}
          </div>

          <div className="flex gap-8">
            {/* Sidebar Menu */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-[#181828] rounded-xl border border-[#232346] overflow-hidden">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#232346]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeSection === 'account' && renderAccountSection()}
              {activeSection === 'privacy' && renderPrivacySection()}
              {activeSection === 'notifications' && renderNotificationsSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 