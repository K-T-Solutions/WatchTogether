import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";

// Demo data for chats
const demoChats = [
  {
    id: 1,
    name: "Alice",
    username: "Alice",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    lastMessage: "See you at 8!",
    lastTime: "18:42",
    lastSeen: "online",
    messages: [
      { fromMe: false, text: "Hey! Are you coming tonight?", time: "18:40" },
      { fromMe: true, text: "Sure! See you at 8!", time: "18:42" },
    ],
  },
  {
    id: 2,
    name: "Bob",
    username: "Bob",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    lastMessage: "Let's play later!",
    lastTime: "17:10",
    lastSeen: "last seen 10 min ago",
    messages: [
      { fromMe: false, text: "Let's play later!", time: "17:10" },
    ],
  },
  {
    id: 3,
    name: "Movie Club",
    username: "MovieClub",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MovieClub",
    lastMessage: "Movie night at 9pm!",
    lastTime: "16:00",
    lastSeen: "last seen 1 hour ago",
    messages: [
      { fromMe: false, text: "Movie night at 9pm!", time: "16:00" },
    ],
  },
];

const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 1000;
const MESSAGE_MAXLEN = 500;

export default function Messenger(props) {
  const [selected, setSelected] = useState(demoChats[0].id);
  const [input, setInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [dragging, setDragging] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const sidebarRef = useRef();
  const [search, setSearch] = useState("");

  // Фильтрация чатов по поиску
  const filteredChats = demoChats.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const chat = demoChats.find(c => c.id === selected);

  // Handle sidebar resize
  const startDrag = (e) => {
    setDragging(true);
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
  };
  const stopDrag = () => {
    setDragging(false);
    document.body.style.cursor = '';
  };
  const onDrag = (e) => {
    if (!dragging) return;
    let clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const left = sidebarRef.current.getBoundingClientRect().left;
    let newWidth = clientX - left;
    if (newWidth < SIDEBAR_MIN) newWidth = SIDEBAR_MIN;
    if (newWidth > SIDEBAR_MAX) newWidth = SIDEBAR_MAX;
    setSidebarWidth(newWidth);
  };
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', onDrag);
      window.addEventListener('touchend', stopDrag);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [dragging]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#070710] text-white select-none relative">
      <Header {...props} />
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-[#232346] rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-[#35356a]">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-white text-xl font-semibold mb-4">Messenger Coming Soon!</h3>
              <p className="text-gray-300 mb-6">
                The messenger functionality is currently under development. This is just a demo interface.
              </p>
              <button 
                onClick={() => setShowWarning(false)}
                className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition text-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 h-0" style={{ paddingTop: 72 }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          // className="border-r border-[#232346] flex flex-col bg-gradient-to-b from-[#181828] to-[#070710] h-full relative shadow-2xl"
          className="border-r border-[#232346] flex flex-col bg-[#070710] h-full relative shadow-2xl"
          style={{ width: sidebarWidth, minWidth: SIDEBAR_MIN, maxWidth: SIDEBAR_MAX }}
        >
          {/* Search bar */}
          <div className="px-4 py-4 h-20 border-t  border-[#232346] bg-[#070710]">
            <input
              type="text"
              className="w-full p-2 rounded-full px-6 bg-[#232346] text-white border border-[#35356a] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all placeholder-gray-400 shadow-md"
              placeholder="Search chats..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredChats.map(c => (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition bg-opacity-80 hover:bg-gradient-to-r hover:from-[#1a023f]/80 hover:to-[#e8652d]/40 ${selected === c.id ? 'bg-gradient-to-r from-[#1a023f]/90 to-[#e8652d]/60 shadow-lg' : ''}`}
                onClick={() => setSelected(c.id)}
              >
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg truncate text-indigo-300">{c.name}</span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{c.lastTime}</span>
                  </div>
                  <div className="text-gray-400 text-sm truncate">{c.lastMessage}</div>
                </div>
              </div>
            ))}
            {filteredChats.length === 0 && (
              <div className="text-gray-500 text-center py-8 select-none">No chats found</div>
            )}
          </div>
          {/* Draggable resizer (absolutely positioned for easy grabbing) */}
          <div
            className="fixed top-0 z-20 h-full w-2 cursor-ew-resize transition-colors duration-150"
            style={{ left: sidebarWidth - 1, userSelect: 'none', touchAction: 'none', background: dragging ? 'linear-gradient(180deg, #4063bd33 0%, #e8652d33 100%)' : 'transparent' }}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            onMouseEnter={e => (e.target.style.cursor = 'ew-resize')}
          />
        </aside>
        {/* Chat window */}
        <main className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#181828] via-[#232346] to-[#070710] shadow-2xl rounded-l-2xl">
          {/* Chat header */}
          <div className="flex items-center gap-4 px-8 h-20 border-b border-t border-[#232346] bg-[#070710] shadow-md">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 cursor-pointer hover:scale-105 transition shadow"
              onClick={() => window.open(`/user/${chat.username}`, '_blank')}
              title={`Go to ${chat.name}'s profile`}
            />
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-indigo-300">{chat.name}</span>
              <span className="text-xs text-gray-400 mt-0.5">{chat.lastSeen}</span>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-2 bg-transparent custom-scrollbar">
            {chat.messages.map((m, i) => (
              <div key={i} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md text-base break-words whitespace-pre-line ${m.fromMe ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 text-white' : 'bg-[#232346]/90 text-gray-100'} transition-all`}
                  style={{ wordBreak: 'break-word', maxWidth: '420px' }}
                >
                  {m.text}
                  <span className="block text-xs text-gray-300 mt-1 text-right">{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Input */}
          <form className="flex items-center gap-4 px-8 py-5 border-t border-[#232346] bg-gradient-to-r from-[#232346]/90 to-[#1a023f]/80 shadow-md" onSubmit={e => {
            e.preventDefault();
            if (!input.trim()) return;
            // Разбиваем длинное сообщение на части по 500 символов
            let text = input;
            while (text.length > 0) {
              const chunk = text.slice(0, MESSAGE_MAXLEN);
              chat.messages.push({ fromMe: true, text: chunk, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
              text = text.slice(MESSAGE_MAXLEN);
            }
            setInput("");
          }}>
            <input
              type="text"
              className="flex-1 p-3 rounded-full bg-[#181828] text-white border border-[#35356a] focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all shadow"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={2000}
              autoFocus
            />
            {/* Счетчик символов убран */}
            <button type="submit" className="bg-gradient-to-tr from-indigo-500 to-pink-500 text-white font-bold px-6 py-2 rounded-full hover:opacity-90 transition text-lg shadow-md" disabled={!input.trim()}>Send</button>
          </form>
        </main>
      </div>
    </div>
  );
} 