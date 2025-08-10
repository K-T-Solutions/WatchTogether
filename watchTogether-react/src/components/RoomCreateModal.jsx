import { useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const ROOM_CATEGORIES = [
  { value: "MOVIES", label: "🎬 Movies", description: "Watch movies of all genres" },
  { value: "SERIES", label: "📺 Series", description: "Watch series together" },
  { value: "ANIME", label: "🇯🇵 Anime", description: "Anime, manga, and Asian animation" },
  { value: "MUSIC", label: "🎵 Music", description: "Clips, concerts, music collections" },
  { value: "GAMING", label: "🎮 Gaming", description: "Game streams, esports broadcasts" },
  { value: "EDUCATION", label: "🎓 Education", description: "Lectures, documentaries, courses" },
  { value: "SPORTS", label: "⚽ Sports", description: "Sports events and broadcasts" },
  { value: "STAND_UP", label: "😂 Stand-up", description: "Comedy performances" },
  { value: "KIDS", label: "👶 Kids", description: "Content for kids and family" },
  { value: "ART", label: "🎨 Art", description: "Art films, arthouse" },
  { value: "TRAVEL", label: "✈️ Travel", description: "Documentaries about countries and cultures" },
  { value: "COOKING", label: "🍳 Cooking", description: "Cooking shows and master classes" },
  { value: "FASHION", label: "👗 Fashion", description: "Fashion shows, fashion industry" },
  { value: "LIVE", label: "🔴 LIVE", description: "Live broadcasts" },
  { value: "TESTING", label: "🧪 Testing", description: "Feature and content testing" },
  { value: "SOCIAL", label: "💬 Social", description: "Rooms for free communication" },
  { value: "OTHER", label: "❔ Other", description: "Various topics and content" },
];

const QUEUE_ROLES = [
  { value: "owner", label: "Owner only" },
  { value: "moderator", label: "Moderators" },
  { value: "vip", label: "VIPs" },
  { value: "all", label: "All members" },
];

export default function RoomCreateModal({ onClose, onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate }) {
  const [tab, setTab] = useState(0); // 0: create, 1: settings
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "PUBLIC", // PUBLIC | PRIVATE
    category: "MOVIES",
    password: "",
    maxParticipants: 5,
    queueControl: "owner",
    chatEnabled: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a room name");
      return;
    }
    if (form.type === "PRIVATE" && !form.password) {
      setError("Password is required for private rooms");
      return;
    }
    setError("");
    // TODO: send data to server
    alert("Room created! (stub)");
    if (onClose) onClose();
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#181828] flex flex-col">
      <Header 
        onLogin={onLogin}
        onRegister={onRegister}
        onProfile={onProfile}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
        onRoomCreate={onRoomCreate}
      />
      <div className="flex-1 flex flex-col items-center justify-start pt-28 pb-12 px-4">
        <div className="w-full max-w-2xl p-[1.5px] rounded-2xl bg-gradient-to-br from-[#3b1a6f] via-[#2a2a4a] to-[#0b0b1a] shadow-[0_10px_30px_rgba(0,0,0,0.45)] animate-fadeIn">
          <div className="rounded-2xl bg-[#232346] overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="mb-6 sm:mb-8 flex items-center justify-between">
                <button
                  className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 -ml-1 text-gray-300 hover:text-white hover:bg-[#2a2a4a] border border-transparent hover:border-[#35356a] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  type="button"
                  onClick={() => onClose ? onClose() : navigate("/")}
                  aria-label="Back"
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-white transition-colors"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  <span className="font-semibold">Back</span>
                </button>
                <div className="hidden sm:block" />
              </div>

              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="inline-flex rounded-full bg-[#1f1f3a] p-1 border border-[#2b2b4a]">
                  <button
                    className={`px-4 sm:px-6 h-9 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-colors ${tab === 0 ? 'bg-[#2a2a4a] text-white shadow-inner' : 'text-gray-300 hover:text-white'}`}
                    onClick={() => setTab(0)}
                    type="button"
                  >Create</button>
                  <button
                    className={`px-4 sm:px-6 h-9 sm:h-10 rounded-full text-sm sm:text-base font-semibold transition-colors ${tab === 1 ? 'bg-[#2a2a4a] text-white shadow-inner' : 'text-gray-300 hover:text-white'}`}
                    onClick={() => setTab(1)}
                    type="button"
                  >Settings</button>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-2 text-sm text-center">
                  {error}
                </div>
              )}

              {tab === 0 ? (
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Room name</label>
                  <input
                    type="text"
                    name="name"
                      className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200 placeholder-gray-400"
                    placeholder="e.g. Friday Movie Night"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={40}
                    required
                  />
                    <div className="mt-1 text-right text-xs text-gray-400">{form.name.length}/40</div>
                </div>
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                      className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200 placeholder-gray-400 min-h-[80px]"
                    placeholder="What is this room about?"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={120}
                  />
                    <div className="mt-1 text-right text-xs text-gray-400">{form.description.length}/120</div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                      <label className="block text-gray-300 font-semibold mb-2">Room type</label>
                    <select
                      name="type"
                        className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  <div className="flex-1">
                      <label className="block text-gray-300 font-semibold mb-2">Category</label>
                    <select
                      name="category"
                        className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {ROOM_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Password {form.type === 'PUBLIC' ? <span className='text-xs text-gray-400'>(optional)</span> : <span className='text-xs text-gray-400'>(required)</span>}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                        className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200 placeholder-gray-400 pr-12"
                      placeholder={form.type === 'PUBLIC' ? "(optional)" : "Enter password"}
                      value={form.password}
                      onChange={handleChange}
                      maxLength={32}
                    />
                    <button
                      type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 text-sm"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">Max participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                      className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200"
                    min={2}
                    max={10}
                    value={form.maxParticipants}
                    onChange={handleChange}
                    required
                  />
                  <span className="text-gray-400 text-xs">from 2 to 10</span>
                </div>
                  <button type="submit" className="w-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition text-lg mt-2">Create Room</button>
                </form>
              ) : (
                <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Who can control the queue?</label>
                  <select
                    name="queueControl"
                      className="w-full p-3 rounded-lg bg-[#1f1f3a] text-white focus:outline-none focus:ring-2 focus:ring-pink-500/60 focus:border-pink-400 border border-[#35356a] transition-all duration-200"
                    value={form.queueControl}
                    onChange={handleChange}
                  >
                    {QUEUE_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="block text-gray-300 font-semibold mb-1" htmlFor="chatEnabled">Enable chat</label>
                  <input
                    id="chatEnabled"
                    name="chatEnabled"
                    type="checkbox"
                    checked={form.chatEnabled}
                    onChange={handleChange}
                    className="accent-pink-500 w-5 h-5 rounded focus:ring-2 focus:ring-pink-500 border border-[#35356a]"
                  />
                  <span className="text-gray-400 text-sm">{form.chatEnabled ? "On" : "Off"}</span>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
    </div>
  );
} 