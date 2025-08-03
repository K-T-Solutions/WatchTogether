import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import client from './apollo-client'
import { getUserFromToken, isTokenExpired } from './utils/jwt'
import Home from './components/Home.jsx'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import UserProfile from './components/UserProfile'
import RoomCreateModal from './components/RoomCreateModal';
import Messenger from './components/Messenger';
import About from './components/About';
import Rooms from './components/Rooms';
import './App.css'

export default function App() {
  const [modal, setModal] = useState(null) // 'login' | 'register' | 'room-create' | null
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const navigate = useNavigate();

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !isTokenExpired(token)) {
      // Восстанавливаем данные пользователя из токена
      const userData = getUserFromToken(token);
      if (userData) {
        // Добавляем дополнительные данные пользователя
        const fullUserData = {
          ...userData,
          displayName: userData.username, // Используем username как начальное displayName
          email: `${userData.username}@example.com`, // Временный email
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          friends: [
            { 
              username: 'Alice', 
              displayName: 'Alice Johnson',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Alice`,
              id: Date.now() + 1,
              bio: "Movie enthusiast and coffee lover",
              followers: 8,
              following: 15,
              publicEmail: false,
              publicFriends: true
            },
            { 
              username: 'Bob', 
              displayName: 'Bob Smith',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Bob`,
              id: Date.now() + 2,
              bio: "Gaming and streaming fanatic",
              followers: 23,
              following: 12,
              publicEmail: true,
              publicFriends: false
            }
          ],
          followers: 12,
          following: 7
        };
        
        setIsAuthenticated(true);
        setCurrentUser(fullUserData);
      } else {
        // Если токен недействителен, удаляем его
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } else if (token && isTokenExpired(token)) {
      // Если токен истек, удаляем его
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  // Sync modal state with hash
  useEffect(() => {
    const syncModal = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'login') setModal('login')
      else if (hash === 'register') setModal('register')
      else if (hash === 'room-create') setModal('room-create')
      else setModal(null)
    }
    syncModal()
    window.addEventListener('hashchange', syncModal)
    return () => window.removeEventListener('hashchange', syncModal)
  }, [])

  // Close modal on Esc
  useEffect(() => {
    if (!modal) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        window.location.hash = ''
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal])

  // Modal open functions for Header
  const openLogin = useCallback(() => { window.location.hash = 'login' }, [])
  const openRegister = useCallback(() => { window.location.hash = 'register' }, [])
  const openRoomCreate = useCallback(() => { navigate('/create-room') }, [navigate])
  const closeModal = useCallback(() => { window.location.hash = '' }, [])

  // Profile functions
  const openProfile = useCallback(() => { navigate('/profile') }, [navigate])
  const closeProfile = useCallback(() => { navigate('/') }, [navigate])

  // User profile functions
  const openUserProfile = useCallback((user) => { 
    setViewingUser(user)
    navigate(`/user/${user.username}`)
  }, [navigate])
  const closeUserProfile = useCallback(() => { 
    setViewingUser(null)
    navigate('/profile')
  }, [navigate])

  // Auth functions
  const handleLogin = useCallback((userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
    closeModal()
  }, [closeModal])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setViewingUser(null)
    localStorage.removeItem('authToken') // Удаляем токен при выходе
    closeModal()
    navigate('/')
  }, [closeModal, navigate])

  return (
    <ApolloProvider client={client}>
      <Routes>
        <Route path="/" element={
          <Home 
            onLogin={openLogin} 
            onRegister={openRegister} 
            onProfile={openProfile}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
            onRoomCreate={openRoomCreate}
          />
        } />
        <Route path="/about" element={<About />} />
        <Route path="/rooms" element={
          <Rooms 
            onLogin={openLogin} 
            onRegister={openRegister} 
            onProfile={openProfile}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
            onRoomCreate={openRoomCreate}
          />
        } />
        <Route path="/profile" element={
          <Profile 
            currentUser={currentUser} 
            onClose={closeProfile} 
            onLogout={handleLogout}
            onViewUser={openUserProfile}
          />
        } />
        <Route path="/user/:username" element={
          viewingUser ? (
            <UserProfile 
              user={viewingUser}
              currentUser={currentUser} 
              onClose={closeUserProfile} 
              onLogout={handleLogout}
            />
          ) : (
            <div>User not found</div>
          )
        } />
        <Route path="/create-room" element={
          <RoomCreateModal
            onLogin={openLogin}
            onRegister={openRegister}
            onProfile={openProfile}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
            onRoomCreate={openRoomCreate}
          />
        } />
        <Route path="/messenger" element={<Messenger />} />
      </Routes>
      {/* Модальные окна логина и регистрации — всегда поверх всех страниц */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            {modal === 'login' && (
              <Login onSwitchToRegister={openRegister} onClose={closeModal} onLogin={handleLogin} />
            )}
            {modal === 'register' && (
              <Register onSwitchToLogin={openLogin} onClose={closeModal} />
            )}
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold" onClick={closeModal} aria-label="Close">×</button>
          </div>
        </div>
      )}
    </ApolloProvider>
  )
}
