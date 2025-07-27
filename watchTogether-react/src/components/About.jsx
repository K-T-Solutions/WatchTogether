import React, { useState, useRef } from "react";

export default function About() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181828] via-[#232346] to-[#070710] flex flex-col items-center pt-32 px-4 text-white">
      <div className="max-w-3xl w-full bg-[#181828]/90 rounded-3xl shadow-2xl p-10 border border-[#232346]">
        <h1 className="text-4xl font-bold text-pink-400 mb-6 text-center">About WatchTogether</h1>
        <p className="text-lg text-gray-200 mb-6 text-center">
          <span className="text-indigo-300 font-semibold">WatchTogether</span> is a modern platform for watching videos, chatting, and sharing experiences with friends in real time. Whether you want to host a movie night, discuss your favorite shows, or just hang out virtually, WatchTogether makes it easy and fun.
        </p>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li><span className="text-pink-400 font-semibold">Rooms:</span> Create or join rooms to watch videos together, chat, and interact in real time.</li>
            <li><span className="text-pink-400 font-semibold">Messenger:</span> Built-in chat for private and group conversations, with a stylish and responsive interface.</li>
            <li><span className="text-pink-400 font-semibold">Profiles:</span> Personalize your profile, see others' profiles, and connect with friends.</li>
            <li><span className="text-pink-400 font-semibold">Host Mode:</span> Become a host to control the playback and invite others to join your room.</li>
            <li><span className="text-pink-400 font-semibold">Modern UI:</span> Enjoy a beautiful, dark-themed interface with smooth gradients and interactive elements.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">How to Use</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>Sign up or log in to your account.</li>
            <li>Browse or create a room to start watching together.</li>
            <li>Invite friends by sharing the room link or username.</li>
            <li>Use the chat to communicate, share reactions, and have fun!</li>
            <li>Visit user profiles to connect and learn more about other members.</li>
          </ol>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">Why WatchTogether?</h2>
          <p className="text-gray-300">
            WatchTogether is designed for seamless, shared experiences. Whether you're far from friends or just want to make movie nights more interactive, our platform brings people together with real-time chat, synchronized playback, and a vibrant community.
          </p>
        </div>
        <div className="text-center mt-10">
          <span className="text-gray-400">Made with ❤️ for friends, families, and communities everywhere.</span>
        </div>
      </div>
    </div>
  );
} 