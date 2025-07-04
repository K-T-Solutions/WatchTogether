import ProfileMenu from "./ProfileMenu";
import { Link } from "react-router-dom";

export default function Header({ onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout }) {
  return (
    <header className="fixed top-0 left-0 w-full flex items-center justify-between px-24 py-4 bg-[#070710] z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center hover:text-indigo-400 transition-colors group">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-10 mr-4 group-hover:scale-110 transition-transform" />
          <span className="text-white text-2xl font-bold tracking-wide select-none group-hover:text-indigo-400 transition-colors">
            WatchTogether
          </span>
        </Link>
      </div>
      <nav>
        <ul className="flex space-x-12 text-white font-medium text-lg items-center">
          <li><a href="#about" className="hover:text-gray-400 ">About</a></li>
          <li><a href="#how" className="hover:text-gray-400">How it works</a></li>
          <li><a href="#rooms" className="hover:text-gray-400">Rooms</a></li>
          {isAuthenticated ? (
            <li>
              <ProfileMenu currentUser={currentUser} onLogout={onLogout} onProfile={onProfile} />
            </li>
          ) : (
            <li>
              <button type="button" className="hover:text-gray-400 bg-transparent" onClick={onLogin}>Log In</button>
            </li>
          )}
          <li>
            <a href="#host" className="gradient-border">
              <span className="gradient-btn">Be a host</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
} 