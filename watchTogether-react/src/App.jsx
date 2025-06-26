import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home.jsx'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import UserProfile from './components/UserProfile'
import './App.css'

export default function App() {
  const [modal, setModal] = useState(null) // 'login' | 'register' | null
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const navigate = useNavigate();

  // Sync modal state with hash
  useEffect(() => {
    const syncModal = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'login') setModal('login')
      else if (hash === 'register') setModal('register')
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
    // Добавляем соц. данные по умолчанию
    setIsAuthenticated(true)
    setCurrentUser({
      ...userData,
      friends: userData.friends || [
        // Пример друзей-заглушек
        { 
          username: 'Alice', 
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
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Bob`,
          id: Date.now() + 2,
          bio: "Gaming and streaming fanatic",
          followers: 23,
          following: 12,
          publicEmail: true,
          publicFriends: false
        }
      ],
      followers: userData.followers || 12,
      following: userData.following || 7
    })
    closeModal()
  }, [closeModal])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setViewingUser(null)
    closeModal()
    navigate('/')
  }, [closeModal, navigate])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
