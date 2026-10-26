import React, { useState } from 'react';
import { FiTrash2, FiMoreVertical } from 'react-icons/fi';
import AttachmentPreview from './AttachmentPreview';
import ReadReceipt from './ReadReceipt';
import { formatMessageTime } from '../utils/chatFormatters';

export default function MessageBubble({ message, currentUserId, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  // System Messages
  if (message.messageType === 'SYSTEM' || message.senderType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-3 px-4">
        <span className="bg-gray-100 border border-gray-200 text-gray-600 text-[11px] font-medium px-3.5 py-1 rounded-full text-center shadow-xs">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = String(message.senderId) === String(currentUserId);
  const isDeleted = Boolean(message.deletedAt);

  return (
    <div
      className={`group flex items-end gap-1.5 my-1.5 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Delete / Action button for user messages */}
      {isUser && !isDeleted && showActions && onDelete && (
        <button
          onClick={() => onDelete(message.id)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          title="Delete message"
        >
          <FiTrash2 size={13} />
        </button>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2.5 shadow-xs transition-all ${
          isUser
            ? 'bg-purple-700 text-white rounded-2xl rounded-br-xs'
            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-xs'
        }`}
      >
        {/* Staff Sender Header if not current user */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold">
            <span className="text-purple-700">
              {message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Support Staff'}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              ({message.senderType === 'SUPER_ADMIN' ? 'Superadmin' : 'Support'})
            </span>
          </div>
        )}

        {/* Content */}
        {isDeleted ? (
          <p className="text-xs italic text-gray-400">This message was deleted</p>
        ) : (
          <>
            {message.attachmentUrl && (
              <AttachmentPreview
                messageType={message.messageType}
                attachmentUrl={message.attachmentUrl}
                attachmentName={message.attachmentName}
                attachmentSize={message.attachmentSize}
              />
            )}
            {message.content && (
              <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </>
        )}

        {/* Timestamp and Delivery/Read Receipts */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isUser ? 'text-purple-200' : 'text-gray-400'
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          <ReadReceipt
            deliveredAt={message.deliveredAt}
            readAt={message.readAt}
            isUserMessage={isUser}
          />
        </div>
      </div>
    </div>
  );
}
