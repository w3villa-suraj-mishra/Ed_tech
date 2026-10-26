import React from 'react';

// Generic reusable modal
export default function AdminModal({ isOpen, title, onClose, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white border border-gray-200 rounded-lg shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 bg-purple-700 text-white shrink-0">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 text-gray-800">{children}</div>
      </div>
    </div>
  );
}
