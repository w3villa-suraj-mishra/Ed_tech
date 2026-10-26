import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { formatChatDate } from '../utils/chatFormatters';

export default function MessageList({
  messages = [],
  currentUserId,
  loading = false,
  loadingMore = false,
  hasMore = false,
  typingText = null,
  onLoadOlder = null,
  onDeleteMessage = null
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto scroll to bottom when new messages are added or initially loaded
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (prevMessagesLength.current === 0 && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Loading skeleton
  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-start">
          <div className="w-48 h-10 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
        <div className="flex justify-end">
          <div className="w-56 h-12 bg-purple-100 rounded-2xl animate-pulse"></div>
        </div>
        <div className="flex justify-start">
          <div className="w-40 h-8 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Group messages by date
  const grouped = [];
  let currentDate = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      grouped.push({ type: 'date', label: formatChatDate(msg.createdAt), key: `date_${msgDate}` });
    }
    grouped.push({ type: 'message', data: msg, key: `msg_${msg.id || msg.clientMessageId}` });
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-3 bg-slate-50/60 custom-scrollbar flex flex-col justify-start"
    >
      {/* Load More Button for older messages */}
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadOlder}
            disabled={loadingMore}
            className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-full shadow-2xs transition disabled:opacity-50"
          >
            {loadingMore ? 'Loading earlier messages...' : '↑ Load older messages'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-2">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-2xl">
            💬
          </div>
          <p className="text-xs font-bold text-gray-700">No messages yet</p>
          <p className="text-[11px] text-gray-500 max-w-xs">
            Start typing below to speak with our support staff. We're here to help!
          </p>
        </div>
      )}

      {/* Render Items */}
      {grouped.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.key} className="flex justify-center my-3">
              <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-semibold px-3 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          );
        }

        return (
          <MessageBubble
            key={item.key}
            message={item.data}
            currentUserId={currentUserId}
            onDelete={onDeleteMessage}
          />
        );
      })}

      {/* Typing indicator */}
      <TypingIndicator typingText={typingText} />

      <div ref={bottomRef} />
    </div>
  );
}
