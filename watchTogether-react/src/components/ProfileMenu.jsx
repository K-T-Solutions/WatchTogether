import { useState, useRef, useEffect } from "react";

export default function ProfileMenu({ currentUser, onLogout, onProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfile();
  };

  // Если currentUser равен null, не рендерим компонент
  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-[#232346] rounded-lg px-3 py-2 transition-colors"
      >
        <img 
          src={currentUser.avatar} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border-2 border-indigo-500"
        />
        <span className="text-indigo-300">{currentUser.displayName}</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#181828] rounded-lg shadow-lg border border-[#232346] py-2 z-50">
          {/* Заголовок профиля */}
          <div className="px-4 py-3 border-b border-[#232346]">
            <div className="flex items-center space-x-3">
              <img 
                src={currentUser.avatar} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-indigo-500"
              />
              <div>
                <p className="text-white font-medium">{currentUser.displayName}</p>
                <p className="text-gray-400 text-sm">@{currentUser.username}</p>
              </div>
            </div>
          </div>

          {/* Меню */}
          <div className="py-1">
            <button 
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#232346] hover:text-white transition-colors flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
            
            <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#232346] hover:text-white transition-colors flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>

            <div className="border-t border-[#232346] my-1"></div>

            <button 
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#232346] hover:text-red-300 transition-colors flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 