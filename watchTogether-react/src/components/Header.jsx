import ProfileMenu from "./ProfileMenu";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate, safeNavigate, isInRoom }) {
  const navigate = useNavigate();
  
  // Функция для безопасной навигации
  const handleNavigation = (path) => {
    if (isInRoom && safeNavigate) {
      safeNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-24 py-4 bg-[#070710] z-50">
      <div className="flex items-center">
        <button 
          onClick={() => handleNavigation("/")} 
          className="flex items-center hover:text-indigo-400 transition-colors group cursor-pointer"
        >
          <img src="/images/logo.png" alt="Logo" className="h-10 w-10 mr-4 group-hover:scale-110 transition-transform" />
          <span className="text-white text-2xl font-bold tracking-wide select-none group-hover:text-indigo-400 transition-colors">
            WatchTogether
          </span>
        </button>
      </div>
      <nav>
        <ul className="flex space-x-12 text-white font-medium text-lg items-center">
          <li><button onClick={() => handleNavigation("/about")} className="hover:text-gray-400 cursor-pointer">About</button></li>
          <li><a href="#features" className="hover:text-gray-400 cursor-pointer">How it works</a></li>
          <li><button onClick={() => handleNavigation("/rooms")} className="hover:text-gray-400 cursor-pointer">Rooms</button></li>
          {isAuthenticated && (
            <li>
              <button
                type="button"
                className="hover:text-gray-400 bg-transparent cursor-pointer"
                onClick={() => handleNavigation('/messenger')}
              >Messenger</button>
            </li>
          )}
          {isAuthenticated ? (
            <li>
              <ProfileMenu currentUser={currentUser} onLogout={onLogout} onProfile={onProfile} safeNavigate={safeNavigate} isInRoom={isInRoom} />
            </li>
          ) : (
            <li>
              <button type="button" className="hover:text-gray-400 bg-transparent cursor-pointer" onClick={onLogin}>Log In</button>
            </li>
          )}
          <li>
            <button type="button" className="gradient-border cursor-pointer" onClick={() => {
              if (isInRoom && safeNavigate) {
                safeNavigate('/create-room');
              } else {
                onRoomCreate();
              }
            }}>
              <span className="gradient-btn">Be a host</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
} 