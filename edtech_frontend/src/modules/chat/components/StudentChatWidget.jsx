import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { useChat } from '../hooks/useChat';

export default function StudentChatWidget() {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  const {
    isOpen,
    setIsOpen,
    activeConversation,
    unreadTotal,
    startOrOpenChat,
    reloadConversations
  } = useChat();

  // Do not render floating widget on admin routes or if unauthenticated
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (!token || isAdminRoute) return null;

  const handleToggle = () => {
    if (!isOpen && !activeConversation) {
      startOrOpenChat();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {isOpen && activeConversation && (
        <ChatWindow
          activeConversation={activeConversation}
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsOpen(false)}
          onReloadConversations={reloadConversations}
        />
      )}
      {!isOpen && (
        <ChatButton
          isOpen={isOpen}
          onClick={handleToggle}
          unreadCount={unreadTotal}
        />
      )}
    </>
  );
}
