import React from 'react';

export default function TypingIndicator({ typingText }) {
  if (!typingText) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 animate-fadeIn">
      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200">
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></span>
        <span className="text-[11px] text-gray-600 ml-1 font-medium italic">{typingText}</span>
      </div>
    </div>
  );
}
