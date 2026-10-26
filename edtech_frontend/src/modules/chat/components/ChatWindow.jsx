import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../hooks/useMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useChatPresence } from '../hooks/useChatPresence';
import { useChatSocket } from '../hooks/useChatSocket';
import { useConversation } from '../hooks/useConversation';

export default function ChatWindow({
  activeConversation,
  onClose,
  onMinimize,
  onReloadConversations = null
}) {
  const { user } = useSelector((state) => state.profile);
  const { connectionStatus, isConnected } = useChatSocket();

  const conversationId = activeConversation?.id;
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const {
    messages,
    loading,
    loadingMore,
    hasMore,
    sendMessage,
    sendAttachment,
    loadOlderMessages,
    deleteMessage
  } = useMessages(conversationId);

  const {
    conversation,
    updateStatus,
    archive
  } = useConversation(conversationId);

  const activeConv = conversation || activeConversation;

  // Presence for assigned staff or target participant
  const targetStaffId = activeConv?.assignedTo;
  const { isOnline, lastSeen } = useChatPresence(targetStaffId);

  // Typing indicator
  const {
    typingText,
    handleUserKeystroke,
    stopUserTyping
  } = useTypingIndicator(conversationId, currentUserName);

  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to clear this chat history from your view?')) {
      await archive();
      if (onReloadConversations) onReloadConversations();
      onClose();
    }
  };

  const handleReopen = async () => {
    await updateStatus('OPEN');
    if (onReloadConversations) onReloadConversations();
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'bottom-2 right-2 sm:bottom-6 sm:right-6 w-[calc(100vw-1rem)] sm:w-[680px] md:w-[780px] h-[calc(100vh-1.5rem)] sm:h-[84vh] max-h-[860px]'
          : 'bottom-6 right-6 w-[370px] sm:w-[410px] max-w-[calc(100vw-1.5rem)] h-[580px] max-h-[calc(100vh-5rem)]'
      }`}
    >
      {/* Header */}
      <ChatHeader
        title={
          activeConv?.assignee
            ? `${activeConv.assignee.firstName} ${activeConv.assignee.lastName}`
            : 'Student Support'
        }
        subtitle={activeConv?.assignee ? 'Support Specialist' : null}
        isOnline={isOnline}
        lastSeen={lastSeen}
        course={activeConv?.course}
        status={activeConv?.status}
        onClose={onClose}
        onMinimize={onMinimize}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        onArchive={handleArchive}
      />

      {/* Connection warning banner if disconnected/reconnecting */}
      {!isConnected && (
        <div className="bg-amber-500 text-white text-[11px] font-semibold py-1 px-3 text-center shrink-0">
          {connectionStatus === 'RECONNECTING'
            ? 'Reconnecting to chat server...'
            : 'Connecting to chat server...'}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.id || user?._id}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        typingText={typingText}
        onLoadOlder={loadOlderMessages}
        onDeleteMessage={deleteMessage}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onSendAttachment={sendAttachment}
        onKeystroke={handleUserKeystroke}
        onStopTyping={stopUserTyping}
        status={activeConv?.status}
        onReopen={handleReopen}
      />
    </div>
  );
}
