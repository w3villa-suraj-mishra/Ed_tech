import React from 'react';

export default function EmptyChatState({
  title = 'No conversation selected',
  description = 'Choose a conversation from the left panel to review message history and reply.',
  icon = '💬',
  actionButton = null
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center text-3xl mb-3 shadow-xs">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionButton}
    </div>
  );
}
