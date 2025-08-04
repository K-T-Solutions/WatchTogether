import { useEffect } from 'react';

export default function Notification({ message, type = 'success', isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Автоматически скрыть через 3 секунды

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✓' : '✕';

  return (
    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300`}>
      <span className="text-lg font-bold">{icon}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 