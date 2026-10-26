import React from 'react';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  loading = false,
  isAdminView = false
}) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-100 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-2 bg-gray-100 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 space-y-2">
        <p className="text-2xl">💬</p>
        <p className="text-xs font-bold text-gray-700">No conversations found</p>
        <p className="text-[11px] text-gray-500">Try changing your search query or status filter.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 overflow-y-auto flex-1 custom-scrollbar">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={String(conv.id) === String(activeConversationId)}
          onClick={() => onSelectConversation(conv)}
          isAdminView={isAdminView}
        />
      ))}
    </div>
  );
}
