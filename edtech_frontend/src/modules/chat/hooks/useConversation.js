import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchConversationDetails,
  updateConversationStatus as apiUpdateStatus,
  assignConversation as apiAssign,
  archiveConversation as apiArchive
} from '../services/conversationApi';
import chatSocket from '../sockets/chatSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export function useConversation(conversationId, explicitToken = null) {
  const reduxToken = useSelector((state) => state?.auth?.token);
  const token =
    explicitToken ||
    reduxToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('adminToken') || localStorage.getItem('token') : null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId || !token) {
      setConversation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversationDetails(conversationId, token);
      setConversation(data.conversation || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading conversation details');
    } finally {
      setLoading(false);
    }
  }, [conversationId, token]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Real-time socket events for conversation changes
  useEffect(() => {
    if (!conversationId) return;

    const handleStatus = ({ conversationId: cId, status }) => {
      if (String(cId) !== String(conversationId)) return;
      setConversation((prev) => (prev ? { ...prev, status } : prev));
    };

    const handleAssign = ({ conversationId: cId, conversation: updated }) => {
      if (String(cId) !== String(conversationId)) return;
      setConversation(updated);
    };

    chatSocket.on(SOCKET_EVENTS.CONVERSATION_STATUS, handleStatus);
    chatSocket.on(SOCKET_EVENTS.CONVERSATION_ASSIGN, handleAssign);

    return () => {
      chatSocket.off(SOCKET_EVENTS.CONVERSATION_STATUS, handleStatus);
      chatSocket.off(SOCKET_EVENTS.CONVERSATION_ASSIGN, handleAssign);
    };
  }, [conversationId]);

  const updateStatus = useCallback(
    async (newStatus) => {
      if (!conversationId || !token) return;
      const res = await apiUpdateStatus(conversationId, newStatus, token);
      if (res.conversation) {
        setConversation(res.conversation);
      }
      return res;
    },
    [conversationId, token]
  );

  const assignAdmin = useCallback(
    async (adminId) => {
      if (!conversationId || !token) return;
      const res = await apiAssign(conversationId, adminId, token);
      if (res.conversation) {
        setConversation(res.conversation);
      }
      return res;
    },
    [conversationId, token]
  );

  const archive = useCallback(async () => {
    if (!conversationId || !token) return;
    const res = await apiArchive(conversationId, token);
    setConversation(null);
    return res;
  }, [conversationId, token]);

  return {
    conversation,
    loading,
    error,
    updateStatus,
    assignAdmin,
    archive,
    reload: loadConversation
  };
}

export default useConversation;
