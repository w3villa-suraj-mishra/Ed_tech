import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { fetchMessages, sendMessage as apiSendMessage, uploadAttachment, deleteMessage as apiDeleteMessage } from '../services/messageApi';
import chatSocket from '../sockets/chatSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export function useMessages(conversationId, explicitToken = null) {
  const reduxToken = useSelector((state) => state?.auth?.token);
  const token =
    explicitToken ||
    reduxToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('adminToken') || localStorage.getItem('token') : null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Keep ref of messages for real-time deduplication and update
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Initial fetch of messages
  const loadInitialMessages = useCallback(async () => {
    if (!conversationId || !token) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMessages(conversationId, { limit: 50 }, token);
      const fetched = data.messages || [];
      setMessages(fetched);
      setHasMore(fetched.length >= 50);

      // Tell socket to mark conversation read
      chatSocket.markConversationRead(conversationId);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, token]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  // Join socket room and attach real-time listeners
  useEffect(() => {
    if (!conversationId) return;

    chatSocket.joinConversation(conversationId);

    const handleNewMessage = ({ conversationId: cId, message }) => {
      if (String(cId) !== String(conversationId)) return;

      setMessages((prev) => {
        // If message already exists (e.g. from optimistic update or clientMessageId), update it
        const existsIndex = prev.findIndex(
          (m) => (message.clientMessageId && m.clientMessageId === message.clientMessageId) || m.id === message.id
        );

        if (existsIndex >= 0) {
          const updated = [...prev];
          updated[existsIndex] = message;
          return updated;
        }
        return [...prev, message];
      });

      // Mark read if active
      chatSocket.markConversationRead(conversationId);
    };

    const handleMessageRead = ({ conversationId: cId, readAt }) => {
      if (String(cId) !== String(conversationId)) return;
      setMessages((prev) =>
        prev.map((m) => (m.readAt ? m : { ...m, readAt, deliveredAt: m.deliveredAt || readAt }))
      );
    };

    chatSocket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    chatSocket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);

    return () => {
      chatSocket.leaveConversation(conversationId);
      chatSocket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
      chatSocket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    };
  }, [conversationId]);

  // REST fallback auto-refresh for serverless deployments
  useEffect(() => {
    if (!conversationId || !token) return;

    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!chatSocket.socket?.connected || chatSocket.isRestFallback) {
        try {
          const data = await fetchMessages(conversationId, { limit: 50 }, token);
          const fetched = data.messages || [];
          setMessages((prev) => {
            if (
              fetched.length !== prev.length ||
              (fetched.length > 0 && fetched[fetched.length - 1]?.id !== prev[prev.length - 1]?.id)
            ) {
              return fetched;
            }
            return prev;
          });
        } catch (e) {}
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [conversationId, token]);

  // Load older messages (scrolling up)
  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !token || loadingMore || !hasMore || messages.length === 0) return;

    const oldestId = messages[0]?.id;
    if (!oldestId) return;

    try {
      setLoadingMore(true);
      const data = await fetchMessages(conversationId, { limit: 50, beforeMessageId: oldestId }, token);
      const older = data.messages || [];

      if (older.length < 50) {
        setHasMore(false);
      }

      setMessages((prev) => [...older, ...prev]);
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, token, loadingMore, hasMore, messages]);

  // Send message
  const handleSendMessage = useCallback(
    async (content, messageType = 'TEXT', attachment = null) => {
      if (!conversationId || !token) return;

      const clientMessageId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        conversationId,
        content: content || null,
        messageType,
        attachmentUrl: attachment?.fileUrl || null,
        attachmentName: attachment?.fileName || null,
        attachmentSize: attachment?.fileSize || null,
        attachmentMime: attachment?.mimeType || null,
        clientMessageId
      };

      try {
        // Send via live socket if connected, otherwise send via REST immediately
        const isLiveSocket = Boolean(chatSocket.socket?.connected && !chatSocket.isRestFallback);

        if (isLiveSocket) {
          chatSocket.sendSocketMessage(payload, async (ack) => {
            if (!ack?.success) {
              const res = await apiSendMessage(conversationId, payload, token);
              if (res.message) {
                setMessages((prev) =>
                  prev.some((m) => m.id === res.message.id) ? prev : [...prev, res.message]
                );
              }
            }
          });
        } else {
          const res = await apiSendMessage(conversationId, payload, token);
          if (res.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === res.message.id)) return prev;
              return [...prev, res.message];
            });
          }
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        throw err;
      }
    },
    [conversationId, token]
  );

  // Send attachment helper
  const handleSendAttachment = useCallback(
    async (file, caption = '') => {
      if (!conversationId || !token) return;

      try {
        const uploadRes = await uploadAttachment(file, token);
        if (uploadRes.success && uploadRes.attachment) {
          await handleSendMessage(caption, uploadRes.attachment.messageType, uploadRes.attachment);
        }
      } catch (err) {
        console.error('Attachment upload failed, attempting text delivery:', err);
        if (caption && caption.trim()) {
          await handleSendMessage(caption.trim(), 'TEXT', null);
        } else {
          throw err;
        }
      }
    },
    [conversationId, token, handleSendMessage]
  );

  // Soft delete message
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!token) return;
      await apiDeleteMessage(messageId, token);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deletedAt: new Date(), content: 'This message was deleted' }
            : m
        )
      );
    },
    [token]
  );

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    sendMessage: handleSendMessage,
    sendAttachment: handleSendAttachment,
    loadOlderMessages,
    deleteMessage: handleDeleteMessage,
    reloadMessages: loadInitialMessages
  };
}

export default useMessages;
