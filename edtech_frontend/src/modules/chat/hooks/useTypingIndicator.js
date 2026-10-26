import { useState, useEffect, useRef, useCallback } from 'react';
import chatSocket from '../sockets/chatSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export function useTypingIndicator(conversationId, currentUserName) {
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> userName
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Listen for typing events from other participants
  useEffect(() => {
    if (!conversationId) return;

    const handleTypingStart = ({ conversationId: cId, userId, userName }) => {
      if (String(cId) !== String(conversationId)) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, userName);
        return next;
      });
    };

    const handleTypingStop = ({ conversationId: cId, userId }) => {
      if (String(cId) !== String(conversationId)) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    chatSocket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    chatSocket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);

    return () => {
      chatSocket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      chatSocket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
      setTypingUsers(new Map());
    };
  }, [conversationId]);

  // Method called on input change to emit typing with debounce
  const handleUserKeystroke = useCallback(() => {
    if (!conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      chatSocket.startTyping(conversationId, currentUserName);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      chatSocket.stopTyping(conversationId);
    }, 2000);
  }, [conversationId, currentUserName]);

  // Method to explicitly stop typing (e.g. on message submit)
  const stopUserTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      chatSocket.stopTyping(conversationId);
    }
  }, [conversationId]);

  // Generate readable string: e.g. "Rahul is typing..."
  const typingNames = Array.from(typingUsers.values());
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : typingNames.length > 1
      ? 'Several people are typing...'
      : null;

  return {
    isTyping: typingNames.length > 0,
    typingText,
    handleUserKeystroke,
    stopUserTyping
  };
}

export default useTypingIndicator;
