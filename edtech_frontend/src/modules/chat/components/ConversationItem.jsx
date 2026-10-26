import React from 'react';
import { formatChatDate } from '../utils/chatFormatters';
import { STATUS_COLORS } from '../constants/chatConstants';

export default function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  isAdminView = false
}) {
  const statusStyle = STATUS_COLORS[conversation.status] || STATUS_COLORS.OPEN;
  const targetUser = isAdminView ? conversation.user : conversation.assignee;

  const displayName = targetUser
    ? `${targetUser.firstName} ${targetUser.lastName}`
    : isAdminView
    ? 'Student'
    : 'Support Staff';

  const initial = displayName?.[0]?.toUpperCase() || 'U';

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 flex items-start gap-3 cursor-pointer transition-colors ${
        isActive ? 'bg-purple-50/80 border-r-2 border-r-purple-700' : 'hover:bg-gray-50 bg-white'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-sm">
          {initial}
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h4 className="text-xs font-bold text-gray-900 truncate">{displayName}</h4>
          <span className="text-[10px] text-gray-400 shrink-0">
            {formatChatDate(conversation.lastMessageAt || conversation.updatedAt)}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 truncate mb-1.5">
          {conversation.lastMessageContent || 'No messages yet'}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Status badge */}
          <span
            className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {conversation.status}
          </span>

          {/* Unread count badge */}
          {conversation.unreadCount > 0 && (
            <span className="bg-purple-700 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
