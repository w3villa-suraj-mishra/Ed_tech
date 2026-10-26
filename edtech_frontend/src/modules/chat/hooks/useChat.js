import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createOrGetConversation, fetchUserConversations } from '../services/conversationApi';
import chatSocket from '../sockets/chatSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export function useChat() {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Extract page / course context from current URL
  const extractContext = useCallback(() => {
    const path = location.pathname;
    let pageContext = 'general';
    let courseId = null;

    if (path.includes('/courses/') || path.includes('/course/')) {
      pageContext = 'course-details';
      const parts = path.split('/');
      const idCandidate = parts[parts.length - 1];
      if (!isNaN(idCandidate)) courseId = parseInt(idCandidate, 10);
    } else if (path.includes('/s/courses/')) {
      pageContext = 'course-player';
      const match = path.match(/\/s\/courses\/(\d+)/);
      if (match) courseId = parseInt(match[1], 10);
    } else if (path.includes('/dashboard')) {
      pageContext = 'dashboard';
    } else if (path.includes('/cart')) {
      pageContext = 'cart-checkout';
    } else if (path.includes('/practice')) {
      pageContext = 'practice-center';
    }

    return { pageContext, courseId };
  }, [location.pathname]);

  // Load user's conversations
  const loadConversations = useCallback(async (isSilent = false) => {
    if (!token) return;
    try {
      if (!isSilent) setLoading(true);
      const data = await fetchUserConversations({ limit: 10 }, token);
      const convs = data.conversations || [];
      setConversations(convs);

      // Compute total unread for user
      const total = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadTotal(total);

      // If no active conversation selected yet, pick the latest one
      setActiveConversation((prev) => prev || (convs.length > 0 ? convs[0] : null));
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Real-time unread updates via socket
  useEffect(() => {
    if (!token) return;

    const handleUnreadUpdate = () => {
      loadConversations();
    };

    chatSocket.on(SOCKET_EVENTS.UNREAD_UPDATE, handleUnreadUpdate);
    return () => {
      chatSocket.off(SOCKET_EVENTS.UNREAD_UPDATE, handleUnreadUpdate);
    };
  }, [token, loadConversations]);

  // Open or initiate chat conversation
  const startOrOpenChat = useCallback(
    async (initialMessage = null) => {
      if (!token) return;

      try {
        setLoading(true);
        const { pageContext, courseId } = extractContext();
        const res = await createOrGetConversation(
          {
            courseId,
            pageContext,
            initialMessage
          },
          token
        );

        if (res.conversation) {
          setActiveConversation(res.conversation);
          setIsOpen(true);
          loadConversations();
        }
      } catch (err) {
        console.error('Error starting conversation:', err);
      } finally {
        setLoading(false);
      }
    },
    [token, extractContext, loadConversations]
  );

  // Listen for open chat event from notifications or external triggers
  useEffect(() => {
    const handleOpenChatEvent = async (e) => {
      const convId = e.detail?.conversationId;
      setIsOpen(true);
      if (convId) {
        let currentConvs = conversations;
        if (currentConvs.length === 0 && token) {
          try {
            const data = await fetchUserConversations({ limit: 10 }, token);
            currentConvs = data.conversations || [];
            setConversations(currentConvs);
          } catch (err) {
            console.error('Error fetching conversations on chat open:', err);
          }
        }
        const found = currentConvs.find((c) => String(c.id) === String(convId));
        if (found) {
          setActiveConversation(found);
          return;
        }
      }
      if (!activeConversation) {
        startOrOpenChat();
      }
    };

    window.addEventListener('OPEN_STUDENT_CHAT', handleOpenChatEvent);
    return () => {
      window.removeEventListener('OPEN_STUDENT_CHAT', handleOpenChatEvent);
    };
  }, [conversations, activeConversation, startOrOpenChat, token]);

  return {
    isOpen,
    setIsOpen,
    activeConversation,
    setActiveConversation,
    conversations,
    unreadTotal,
    loading,
    startOrOpenChat,
    reloadConversations: loadConversations
  };
}

export default useChat;
