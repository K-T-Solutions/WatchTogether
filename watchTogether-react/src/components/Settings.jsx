import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_PROFILE } from "../graphql/queries";
import { UPDATE_USER_PROFILE, UPDATE_USER_LOGIN, UPDATE_USER_PASSWORD } from "../graphql/mutations";
import { getUserFromToken } from "../utils/jwt";
import Header from "./Header";
import Notification from "./Notification";
import EmailVerifyModal from "./EmailVerifyModal";
import { GET_USER_CRED_QUERY, ENABLE_TWO_FACTOR_MUTATION, SEND_EMAIL_VERIFICATION_CODE, VERIFY_EMAIL_CODE } from "../graphql/auth";

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

  // Загружаем креды пользователя (emailVerified)
  const { data: credData, refetch: refetchCreds } = useQuery(GET_USER_CRED_QUERY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first'
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

  // Мутация для обновления логина
  const [updateLogin, { loading: updateLoginLoading }] = useMutation(UPDATE_USER_LOGIN, {
    onCompleted: (data) => {
      console.log('Login update response:', data);
      const message = data?.updateUserLogin?.message || 'Login updated successfully!';
      
      // Проверяем, содержит ли сообщение ошибку
      const isError = message.toLowerCase().includes('error') || 
                     message.toLowerCase().includes('already taken') || 
                     message.toLowerCase().includes('not found') ||
                     message.toLowerCase().includes('invalid');
      
      setNotification({
        isVisible: true,
        message: message,
        type: isError ? 'error' : 'success'
      });
      
      if (!isError) {
        // Обновляем кэш Apollo Client только при успехе
        refetch();
        
        // Скрываем форму и очищаем поля только при успехе
        setShowLoginForm(false);
        setAccountData(prev => ({
          ...prev,
          username: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    },
    onError: (error) => {
      console.error('Error updating login:', error);
      setNotification({
        isVisible: true,
        message: `Error updating login: ${error.message}`,
        type: 'error'
      });
    }
  });

  // Мутация для обновления пароля
  const [updatePassword, { loading: updatePasswordLoading }] = useMutation(UPDATE_USER_PASSWORD, {
    onCompleted: (data) => {
      console.log('Password update response:', data);
      const message = data?.updateUserPassword?.message || 'Password updated successfully!';
      
      // Проверяем, содержит ли сообщение ошибку
      const isError = message.toLowerCase().includes('error') || 
                     message.toLowerCase().includes('invalid') || 
                     message.toLowerCase().includes('not found');
      
      setNotification({
        isVisible: true,
        message: message,
        type: isError ? 'error' : 'success'
      });
      
      if (!isError) {
        // Скрываем форму и очищаем поля только при успехе
        setShowPasswordForm(false);
        setAccountData(prev => ({
          ...prev,
          username: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    },
    onError: (error) => {
      console.error('Error updating password:', error);
      setNotification({
        isVisible: true,
        message: `Error updating password: ${error.message}`,
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

  // Состояние для отображения форм
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const isEmailVerified = !!credData?.getUserCredentials?.emailVerified;
  const [enableTwoFactor, { loading: enable2faLoading }] = useMutation(ENABLE_TWO_FACTOR_MUTATION, {
    onCompleted: (res) => {
      setNotification({ isVisible: true, message: res?.enableTwoFactor?.message || '2FA enabled', type: 'success' });
      refetchCreds();
    },
    onError: (e) => {
      setNotification({ isVisible: true, message: `Error enabling 2FA: ${e.message}`, type: 'error' });
    }
  });

  // Email verification
  const [emailCode, setEmailCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resendTick, setResendTick] = useState(0); // to reset modal timer after resend
  // Local-only notification preferences (frontend only for now)
  const [notificationPrefs, setNotificationPrefs] = useState({
    friendRequests: true,
    roomInvites: true,
    messages: true,
    mentions: true
  });

  const startCooldown = (seconds = 30) => {
    setCooldown(seconds);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendEmailCode = async () => {
    if (!userId || cooldown > 0) return false;
    try {
      setIsSending(true);
      await refetch({ userId });
      // eslint-disable-next-line no-undef
      await window.__APOLLO_CLIENT__.query({
        query: SEND_EMAIL_VERIFICATION_CODE,
        variables: { userId }
      });
      setNotification({ isVisible: true, message: 'Verification code sent to your email', type: 'success' });
      startCooldown(30);
      setResendTick((v) => v + 1);
      return true;
    } catch (e) {
      setNotification({ isVisible: true, message: `Failed to send code: ${e.message}` , type: 'error' });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyEmailCode = async (codeFromModal) => {
    const codeToUse = (codeFromModal ?? emailCode).trim();
    if (!codeToUse) {
      setNotification({ isVisible: true, message: 'Enter verification code', type: 'error' });
      return false;
    }
    try {
      // eslint-disable-next-line no-undef
      const res = await window.__APOLLO_CLIENT__.query({
        query: VERIFY_EMAIL_CODE,
        variables: { userId, code: codeToUse },
        fetchPolicy: 'no-cache'
      });
      const ok = !!res?.data?.finishEmailVerification;
      if (ok) {
        setNotification({ isVisible: true, message: 'Email verified successfully', type: 'success' });
        setEmailCode("");
        await refetchCreds();
        setShowEmailModal(false);
        return true;
      }
      setNotification({ isVisible: true, message: 'Invalid code', type: 'error' });
      return false;
    } catch (e) {
      setNotification({ isVisible: true, message: `Failed to verify: ${e.message}`, type: 'error' });
      return false;
    }
  };

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
        username: '',
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

    let hasChanges = false;

    // Проверяем изменения логина
    if (showLoginForm && accountData.username.trim()) {
      const currentLogin = profileData?.login || currentUser?.username || '';
      if (accountData.username.trim() !== currentLogin) {
        // Валидация логина
        if (accountData.username.trim().length < 3) {
          setNotification({
            isVisible: true,
            message: 'Username must be at least 3 characters long',
            type: 'error'
          });
          return;
        }

        // Обновляем логин
        updateLogin({
          variables: {
            userId: userId,
            newLogin: accountData.username.trim()
          }
        });
        hasChanges = true;
      } else {
        setNotification({
          isVisible: true,
          message: 'New username is the same as current username',
          type: 'error'
        });
        return;
      }
    }

    // Проверяем изменения пароля
    if (showPasswordForm && accountData.currentPassword && accountData.newPassword) {
      // Валидация паролей
      if (accountData.newPassword.length < 6) {
        setNotification({
          isVisible: true,
          message: 'New password must be at least 6 characters long',
          type: 'error'
        });
        return;
      }

      if (accountData.newPassword !== accountData.confirmPassword) {
        setNotification({
          isVisible: true,
          message: 'New password and confirm password do not match',
          type: 'error'
        });
        return;
      }

      // Обновляем пароль
      updatePassword({
        variables: {
          userId: userId,
          oldPass: accountData.currentPassword,
          newPass: accountData.newPassword
        }
      });
      hasChanges = true;
    }

    if (!hasChanges) {
      setNotification({
        isVisible: true,
        message: 'Please fill in the required fields',
        type: 'error'
      });
    }
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
      username: '',
      emails: [profileData?.displayEmail || currentUser?.email || ''],
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowLoginForm(false);
    setShowPasswordForm(false);
  };

  const handleShowLoginForm = () => {
    setShowLoginForm(true);
    setShowPasswordForm(false);
    setAccountData(prev => ({
      ...prev,
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleShowPasswordForm = () => {
    setShowPasswordForm(true);
    setShowLoginForm(false);
    setAccountData(prev => ({
      ...prev,
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
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
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
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
            <button className="absolute bottom-0 right-0 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full transition-colors shadow-lg cursor-pointer">
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
            className={`bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition cursor-pointer ${
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
            className={`px-6 py-3 bg-[#232346] text-white font-medium rounded-lg transition cursor-pointer ${
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
        <h2 className="text-white text-2xl font-bold mb-2">Account settings</h2>
        <p className="text-gray-400">Manage your account credentials and preferences</p>
      </div>

      {/* Change Username (GitHub-like) */}
      <div className="bg-[#181828] rounded-2xl border border-[#232346] p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-white text-lg font-semibold">Change username</h3>
            <div className="mt-3 text-sm text-gray-400">
              Current: <span className="text-white font-medium">{profileData?.login || currentUser?.username || 'not set'}</span>
            </div>
          </div>
          {!showLoginForm && (
            <button
              onClick={handleShowLoginForm}
              disabled={updateLoginLoading}
              className="shrink-0 h-10 px-4 rounded-md bg-[#232346] text-white hover:bg-[#2a2a4a] border border-[#2b2b4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change username
            </button>
          )}
        </div>

        {showLoginForm && (
          <div className="mt-6 border-t border-[#232346] pt-6">
            <label className="block text-gray-400 text-sm font-medium mb-2">New username</label>
            <input
              type="text"
              name="username"
              value={accountData.username}
              onChange={handleAccountChange}
              className="w-full p-3 rounded-md bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter new username"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveAccount}
                disabled={updateLoginLoading}
                className="h-10 px-5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoginLoading ? 'Updating…' : 'Update username'}
              </button>
              <button
                onClick={() => setShowLoginForm(false)}
                disabled={updateLoginLoading}
                className="h-10 px-5 rounded-md bg-[#232346] hover:bg-[#2a2a4a] text-white border border-[#2b2b4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password (GitHub-like) */}
      <div className="bg-[#181828] rounded-2xl border border-[#232346] p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-white text-lg font-semibold">Change password</h3>
            <p className="text-gray-400 text-sm mt-1">A strong password helps keep your account secure.</p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={handleShowPasswordForm}
              disabled={updatePasswordLoading}
              className="shrink-0 h-10 px-4 rounded-md bg-[#232346] text-white hover:bg-[#2a2a4a] border border-[#2b2b4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="mt-6 border-t border-[#232346] pt-6 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Current password</label>
              <input
                type="password"
                name="currentPassword"
                value={accountData.currentPassword}
                onChange={handleAccountChange}
                className="w-full p-3 rounded-md bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">New password</label>
              <input
                type="password"
                name="newPassword"
                value={accountData.newPassword}
                onChange={handleAccountChange}
                className="w-full p-3 rounded-md bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter new password"
              />
              <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Confirm new password</label>
              <input
                type="password"
                name="confirmPassword"
                value={accountData.confirmPassword}
                onChange={handleAccountChange}
                className="w-full p-3 rounded-md bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAccount}
                disabled={updatePasswordLoading}
                className="h-10 px-5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatePasswordLoading ? 'Updating…' : 'Update password'}
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                disabled={updatePasswordLoading}
                className="h-10 px-5 rounded-md bg-[#232346] hover:bg-[#2a2a4a] text-white border border-[#2b2b4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security / Email Verify + 2FA Card */}
      <div className="bg-[#181828] rounded-2xl p-6 border border-[#232346] space-y-6">
        {/* Email verification row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold">Email verification</h3>
            <p className="text-gray-400 text-sm mt-1">Verify your email to enable advanced security features</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border"
                 style={{
                   background: isEmailVerified ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                   color: isEmailVerified ? '#10B981' : '#EF4444',
                   borderColor: isEmailVerified ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'
                 }}>
              <span className={`w-2 h-2 rounded-full ${isEmailVerified ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span>{isEmailVerified ? 'Email verified' : 'Email not verified'}</span>
            </div>
          </div>

          {!isEmailVerified && (
            <div className="flex items-center gap-3">
              <button
                onClick={async () => { const sent = await handleSendEmailCode(); if (sent) setShowEmailModal(true); }}
                disabled={cooldown > 0 || isSending}
                className={`h-10 px-5 rounded-md font-semibold transition ${
                  cooldown > 0 || isSending
                    ? 'bg-[#232346] text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Verify email'}
              </button>
            </div>
          )}
        </div>

        <div className="h-px bg-[#232346]" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-lg font-semibold">Two‑Factor Authentication (2FA)</h3>
            <p className="text-gray-400 text-sm mt-1">Add an extra layer of security to your account</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border"
                 style={{
                   background: isEmailVerified ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                   color: isEmailVerified ? '#10B981' : '#EF4444',
                   borderColor: isEmailVerified ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'
                 }}>
              <span className={`w-2 h-2 rounded-full ${isEmailVerified ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span>{isEmailVerified ? 'Email verified' : 'Email not verified'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => enableTwoFactor({ variables: { userId } })}
              disabled={!isEmailVerified || enable2faLoading}
              className={`inline-flex items-center gap-2 font-semibold py-3 px-5 rounded-lg transition cursor-pointer ${
                !isEmailVerified || enable2faLoading
                  ? 'bg-[#232346] text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-indigo-500 to-pink-500 text-white hover:opacity-90'
              }`}
            >
              {enable2faLoading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Enabling…</span>
              ) : (
                'Enable 2FA'
              )}
            </button>
            {!isEmailVerified && (
              <div className="text-xs text-gray-400">Verify your email to enable 2FA</div>
            )}
          </div>
        </div>
      </div>

      {/* The old separate forms were merged into the cards above */}
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
        <h2 className="text-white text-2xl font-bold mb-2">Notification preferences</h2>
        <p className="text-gray-400">Choose what to be notified about</p>
      </div>

      <div className="bg-[#181828] rounded-2xl p-6 border border-[#232346]">
        <div className="divide-y divide-[#232346]">
          {/* Friend requests */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#232346] text-indigo-300">🤝</div>
              <div>
                <div className="text-white font-medium">Friend requests</div>
                <div className="text-gray-400 text-sm">Get notified when someone sends you a friend request</div>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notificationPrefs.friendRequests}
              onClick={() => setNotificationPrefs((p) => ({ ...p, friendRequests: !p.friendRequests }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.friendRequests ? 'bg-indigo-600' : 'bg-[#232346]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  notificationPrefs.friendRequests ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Room invites */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#232346] text-indigo-300">🎥</div>
              <div>
                <div className="text-white font-medium">Room invites</div>
                <div className="text-gray-400 text-sm">Be alerted when you are invited to a room</div>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notificationPrefs.roomInvites}
              onClick={() => setNotificationPrefs((p) => ({ ...p, roomInvites: !p.roomInvites }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.roomInvites ? 'bg-indigo-600' : 'bg-[#232346]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  notificationPrefs.roomInvites ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Messages */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#232346] text-indigo-300">💬</div>
              <div>
                <div className="text-white font-medium">Messages</div>
                <div className="text-gray-400 text-sm">Receive notifications for new direct messages</div>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notificationPrefs.messages}
              onClick={() => setNotificationPrefs((p) => ({ ...p, messages: !p.messages }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.messages ? 'bg-indigo-600' : 'bg-[#232346]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  notificationPrefs.messages ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Mentions */}
          <div className="py-4 flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#232346] text-indigo-300">📣</div>
              <div>
                <div className="text-white font-medium">Mentions</div>
                <div className="text-gray-400 text-sm">Notify me when someone mentions me</div>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notificationPrefs.mentions}
              onClick={() => setNotificationPrefs((p) => ({ ...p, mentions: !p.mentions }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs.mentions ? 'bg-indigo-600' : 'bg-[#232346]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  notificationPrefs.mentions ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
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
            <div className="mb-4">
              <button
                onClick={() => navigate('/profile')}
                className="group inline-flex items-center gap-4 text-left text-white focus:outline-none"
                aria-label="Back to profile"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-white text-3xl font-bold">Settings</span>
              </button>
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
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors cursor-pointer ${
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
      {showEmailModal && !isEmailVerified && (
        <EmailVerifyModal
          email={profileData?.displayEmail || currentUser?.email}
          onClose={() => setShowEmailModal(false)}
          onVerify={handleVerifyEmailCode}
          onResend={handleSendEmailCode}
          resendCooldown={cooldown}
          isResending={isSending}
          resetSignal={resendTick}
        />
      )}
    </div>
  );
} 