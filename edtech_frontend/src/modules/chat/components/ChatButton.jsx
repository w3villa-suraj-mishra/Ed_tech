import React from 'react';
import { BsChatDotsFill } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';

export default function ChatButton({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-700 hover:bg-purple-800 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-300"
      aria-label="Support Chat"
      title="Open Support Chat"
    >
      {isOpen ? (
        <FiX size={24} />
      ) : (
        <>
          <BsChatDotsFill size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
