import { useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { CREATE_ROOM } from "../graphql/mutations";

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

export default function RoomCreateModal({ onClose, onLogin, onRegister, onProfile, isAuthenticated, currentUser, onLogout, onRoomCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "PUBLIC", // PUBLIC | PRIVATE
    category: "MOVIES",
    password: "",
    maxParticipants: 5,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated || !currentUser?.id) {
      setError("Please log in to create a room");
      return;
    }
    if (!form.name.trim()) {
      setError("Please enter a room name");
      return;
    }
    const maxP = Number(form.maxParticipants);
    if (Number.isNaN(maxP) || maxP < 2 || maxP > 20) {
      setError("Max participants must be between 2 and 20");
      return;
    }
    if (form.type === "PRIVATE" && !form.password) {
      setError("Password is required for private rooms");
      return;
    }

    setError("");

    const input = {
      ownerId: String(currentUser.id),
      ownerDisplayName: String(
        currentUser.displayName ||
        currentUser.username ||
        currentUser.login ||
        currentUser.email ||
        'User'
      ),
      roomName: form.name.trim(),
      roomDescription: form.description.trim() || "",
      roomType: form.type,
      roomCategory: form.category,
      roomPassword: form.type === "PRIVATE" ? form.password : "",
      maxParticipants: maxP,
    };

    console.log('Creating room with input:', input);

    try {
      const { data } = await createRoom({ variables: { input } });
      console.log('Create room response:', data);
      if (data?.createRoom?.success) {
        // Автоматически открываем созданную комнату
        const roomId = data.createRoom.roomId;
        if (roomId) {
          console.log('Room created successfully, navigating to room:', roomId);
          // Устанавливаем флаг в sessionStorage чтобы Room.jsx знал что пользователь уже присоединился
          const dedupeKey = `room_join:${roomId}:${currentUser.id}`;
          sessionStorage.setItem(dedupeKey, 'done');
          console.log('Set sessionStorage key:', dedupeKey);
          // Переходим в комнату
          console.log('Setting navigation state:', { joined: true });
          navigate(`/room/${roomId}`, { state: { joined: true } });
        } else {
          console.warn('Room created but no roomId returned');
          navigate("/rooms");
        }
      } else {
        setError(data?.createRoom?.message || "Failed to create room");
      }
    } catch (err) {
      console.error('Create room error:', err);
      setError(err.message || "Network error");
    }
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
        <div className="w-full max-w-xl bg-[#232346] rounded-2xl shadow-2xl p-0 overflow-hidden animate-fadeIn">
          <div className="p-8 bg-[#232346]">
            <button
              className="mb-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold text-base transition cursor-pointer"
              type="button"
              onClick={() => onClose ? onClose() : navigate("/")}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Room name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200 placeholder-gray-400"
                  placeholder="e.g. Friday Movie Night"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={40}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200 placeholder-gray-400 min-h-[60px]"
                  placeholder="What is this room about?"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={120}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-300 font-semibold mb-1">Room type</label>
                  <select
                    name="type"
                    className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    name="category"
                    className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200"
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
                <label className="block text-gray-300 font-semibold mb-1">Password {form.type === 'PUBLIC' ? <span className='text-xs text-gray-400'>(optional)</span> : <span className='text-xs text-gray-400'>(required)</span>}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200 placeholder-gray-400 pr-12"
                    placeholder={form.type === 'PUBLIC' ? "(optional)" : "Enter password"}
                    value={form.password}
                    onChange={handleChange}
                    maxLength={32}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 text-sm cursor-pointer"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Max participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  className="w-full p-3 rounded bg-[#232346] text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 border border-[#35356a] focus:bg-[#232346] transition-all duration-200"
                  min={2}
                  max={20}
                  value={form.maxParticipants}
                  onChange={handleChange}
                  required
                />
                <span className="text-gray-400 text-xs">from 2 to 20</span>
              </div>
              {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              <button type="submit" disabled={creating} className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 rounded hover:opacity-90 transition text-lg mt-2 disabled:opacity-60 cursor-pointer">
                {creating ? 'Creating…' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
    </div>
    </div>
  );
} 