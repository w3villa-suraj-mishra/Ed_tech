import React from 'react';

export default function DeleteConfirm({ isOpen, onClose, onConfirm, title = 'Delete?', message = 'This action cannot be undone.', loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-xs mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-xs font-semibold cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold transition-colors text-xs disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
