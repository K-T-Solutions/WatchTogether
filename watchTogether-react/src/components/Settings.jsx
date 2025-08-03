import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_PROFILE } from "../graphql/queries";
import { UPDATE_USER_PROFILE } from "../graphql/mutations";
import { getUserFromToken } from "../utils/jwt";
import Header from "./Header";
import Notification from "./Notification";

export default function Settings({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState('public-profile');
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'success' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  // Мутация для обновления профиля
  const [updateProfile, { loading: updateLoading }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: (data) => {
      console.log('Profile updated successfully:', data);
      
      // Обновляем локальное состояние с новыми данными
      const updatedProfile = data.updateUserProfileById;
      const newPublicProfileData = {
        displayName: updatedProfile.displayName || publicProfileData.displayName,
        selectedEmail: updatedProfile.displayEmail || publicProfileData.selectedEmail,
        bio: updatedProfile.bio || publicProfileData.bio,
        avatar: publicProfileData.avatar
      };
      
      setPublicProfileData(newPublicProfileData);
      
      // Обновляем исходные данные
      setOriginalPublicProfileData({
        displayName: newPublicProfileData.displayName,
        selectedEmail: newPublicProfileData.selectedEmail,
        bio: newPublicProfileData.bio
      });
      
      // Сбрасываем состояние изменений
      setHasUnsavedChanges(false);
      
      // Обновляем кэш Apollo Client
      refetch();
      
      // Показываем уведомление об успешном обновлении
      setNotification({
        isVisible: true,
        message: 'Profile updated successfully!',
        type: 'success'
      });
      
      // Автоматически обновляем страницу через 1 секунду
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      // Показываем уведомление об ошибке
      setNotification({
        isVisible: true,
        message: `Error updating profile: ${error.message}`,
        type: 'error'
      });
    }
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

  // Состояние для Public Profile
  const [publicProfileData, setPublicProfileData] = useState({
    displayName: '',
    selectedEmail: '',
    bio: "No bio yet...",
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  });

  // Состояние для Account
  const [accountData, setAccountData] = useState({
    username: '',
    emails: [''],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Состояние для отслеживания исходных данных
  const [originalPublicProfileData, setOriginalPublicProfileData] = useState({
    displayName: '',
    selectedEmail: '',
    bio: "No bio yet..."
  });

  // Обновляем данные при изменении данных профиля
  useEffect(() => {
    if (profileData || currentUser) {
      const newPublicProfileData = {
        displayName: profileData?.displayName || currentUser?.displayName || currentUser?.username || '',
        selectedEmail: profileData?.displayEmail || currentUser?.email || '',
        bio: profileData?.bio || currentUser?.bio || "No bio yet...",
        avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      };
      
      setPublicProfileData(newPublicProfileData);
      
      // Сохраняем исходные данные для сравнения
      setOriginalPublicProfileData({
        displayName: newPublicProfileData.displayName,
        selectedEmail: newPublicProfileData.selectedEmail,
        bio: newPublicProfileData.bio
      });
      
      setAccountData({
        username: profileData?.login || currentUser?.username || '',
        emails: [profileData?.displayEmail || currentUser?.email || ''],
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Сбрасываем состояние изменений при загрузке данных
      setHasUnsavedChanges(false);
    }
  }, [profileData, currentUser]);

  const handlePublicProfileChange = (e) => {
    const { name, value } = e.target;
    setPublicProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Проверяем изменения после небольшой задержки
    setTimeout(() => {
      checkPublicProfileChanges();
    }, 100);
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailChange = (index, value) => {
    setAccountData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
    
    // Если изменяемый email является выбранным в Public Profile, обновляем его
    if (publicProfileData.selectedEmail === accountData.emails[index]) {
      setPublicProfileData(prev => ({
        ...prev,
        selectedEmail: value
      }));
    }
  };

  const addEmail = () => {
    setAccountData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index) => {
    if (accountData.emails.length > 1) {
      const emailToRemove = accountData.emails[index];
      
      setAccountData(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
      
      // Если удаляемый email является выбранным в Public Profile, выбираем первый доступный
      if (publicProfileData.selectedEmail === emailToRemove) {
        const remainingEmails = accountData.emails.filter((_, i) => i !== index);
        if (remainingEmails.length > 0) {
          setPublicProfileData(prev => ({
            ...prev,
            selectedEmail: remainingEmails[0]
          }));
        }
      }
    }
  };

  const handleSavePublicProfile = () => {
    // Проверяем, что у нас есть userId
    if (!userId) {
      console.error('No user ID available');
      setNotification({
        isVisible: true,
        message: 'No user ID available',
        type: 'error'
      });
      return;
    }

    // Валидация данных
    if (!publicProfileData.displayName.trim()) {
      setNotification({
        isVisible: true,
        message: 'Display name is required',
        type: 'error'
      });
      return;
    }

    if (!publicProfileData.selectedEmail.trim()) {
      setNotification({
        isVisible: true,
        message: 'Please select an email to display',
        type: 'error'
      });
      return;
    }

    // Проверяем, изменились ли данные
    const currentData = {
      displayName: publicProfileData.displayName.trim(),
      displayEmail: publicProfileData.selectedEmail.trim(),
      bio: publicProfileData.bio.trim()
    };

    // Сравниваем данные с исходными
    const hasChanges = 
      originalPublicProfileData.displayName !== currentData.displayName ||
      originalPublicProfileData.selectedEmail !== currentData.displayEmail ||
      originalPublicProfileData.bio !== currentData.bio;

    if (!hasChanges) {
      setNotification({
        isVisible: true,
        message: 'No changes detected. Nothing to update.',
        type: 'error'
      });
      return;
    }

    // Подготавливаем данные для отправки
    const updateData = {
      userId: userId,
      displayName: currentData.displayName,
      displayEmail: currentData.displayEmail,
      bio: currentData.bio
    };

    // Вызываем мутацию
    updateProfile({
      variables: {
        request: updateData
      }
    });
  };

  const handleSaveAccount = () => {
    // Здесь будет логика сохранения изменений аккаунта
    console.log('Saving account:', accountData);
  };

  const handleCancelPublicProfile = () => {
    setPublicProfileData({
      displayName: originalPublicProfileData.displayName,
      selectedEmail: originalPublicProfileData.selectedEmail,
      bio: originalPublicProfileData.bio,
      avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    });
    setHasUnsavedChanges(false);
  };

  const handleCancelAccount = () => {
    setAccountData({
      username: profileData?.login || currentUser?.username || '',
      emails: [profileData?.displayEmail || currentUser?.email || ''],
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const closeNotification = () => {
    setNotification({ isVisible: false, message: '', type: 'success' });
  };

  // Функция для проверки изменений в Public Profile
  const checkPublicProfileChanges = () => {
    const currentData = {
      displayName: publicProfileData.displayName.trim(),
      displayEmail: publicProfileData.selectedEmail.trim(),
      bio: publicProfileData.bio.trim()
    };

    const hasChanges = 
      originalPublicProfileData.displayName !== currentData.displayName ||
      originalPublicProfileData.selectedEmail !== currentData.displayEmail ||
      originalPublicProfileData.bio !== currentData.bio;

    setHasUnsavedChanges(hasChanges);
  };

  const menuItems = [
    { id: 'public-profile', label: 'Public Profile', icon: '👤' },
    { id: 'account', label: 'Account', icon: '⚙️' },
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

  const renderPublicProfileSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">Public Profile</h2>
        <p className="text-gray-400">Manage your public profile information</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={publicProfileData.avatar} 
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
            value={publicProfileData.displayName}
            onChange={handlePublicProfileChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your display name..."
          />
        </div>

        {/* Email Selection */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Display Email
          </label>
          <select
            name="selectedEmail"
            value={publicProfileData.selectedEmail}
            onChange={handlePublicProfileChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {accountData.emails.map((email, index) => (
              <option key={index} value={email}>
                {email}
              </option>
            ))}
          </select>
          <p className="text-gray-500 text-xs mt-1">Choose which email to display publicly</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={publicProfileData.bio}
            onChange={handlePublicProfileChange}
            rows="4"
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSavePublicProfile}
            disabled={updateLoading || !hasUnsavedChanges}
            className={`bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition ${
              updateLoading || !hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {updateLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
          <button
            onClick={handleCancelPublicProfile}
            disabled={updateLoading}
            className={`px-6 py-3 bg-[#232346] text-white font-medium rounded-lg transition ${
              updateLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2a2a4a]'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">Account Settings</h2>
        <p className="text-gray-400">Manage your account credentials and preferences</p>
      </div>

      {/* Form Fields */}
      <div className="bg-[#181828] rounded-xl p-6 border border-[#232346] space-y-6">
        {/* Username */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={accountData.username}
            onChange={handleAccountChange}
            className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your username..."
          />
        </div>

        {/* Email Management */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Email Addresses
          </label>
          <div className="space-y-3">
            {accountData.emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  className="flex-1 p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email address..."
                />
                {accountData.emails.length > 1 && (
                  <button
                    onClick={() => removeEmail(index)}
                    className="px-4 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addEmail}
              className="w-full p-4 border-2 border-dashed border-gray-500 text-gray-400 hover:text-white hover:border-indigo-500 rounded-lg transition-colors"
            >
              + Add Email Address
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="border-t border-[#232346] pt-6">
          <h3 className="text-white text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={accountData.currentPassword}
                onChange={handleAccountChange}
                className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter current password..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={accountData.newPassword}
                onChange={handleAccountChange}
                className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter new password..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={accountData.confirmPassword}
                onChange={handleAccountChange}
                className="w-full p-4 rounded-lg bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirm new password..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSaveAccount}
            className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
          >
            Update Account
          </button>
          <button
            onClick={handleCancelAccount}
            className="px-6 py-3 bg-[#232346] text-white font-medium rounded-lg hover:bg-[#2a2a4a] transition"
          >
            Cancel
          </button>
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
        currentUser={currentUser}
        onLogout={onLogout}
      />
      
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
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
              {activeSection === 'public-profile' && renderPublicProfileSection()}
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