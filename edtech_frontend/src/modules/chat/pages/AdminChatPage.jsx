import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { AdminProtectedRoute } from '../../../components/admin/AdminUI';
import ConversationFilters from '../components/ConversationFilters';
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import EmptyChatState from '../components/EmptyChatState';
import { fetchAdminConversations, fetchAdminsList, updateConversationStatus, assignConversation } from '../services/conversationApi';
import { useMessages } from '../hooks/useMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useChatPresence } from '../hooks/useChatPresence';
import { useChatSocket } from '../hooks/useChatSocket';
import { STATUS_COLORS } from '../constants/chatConstants';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { FiArrowLeft, FiUserCheck, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  return (
    <AdminProtectedRoute>
      <AdminChatPageInner />
    </AdminProtectedRoute>
  );
}

function AdminChatPageInner() {
  const reduxToken = useSelector((state) => state?.auth?.token);
  const reduxUser = useSelector((state) => state?.profile?.user);

  const token =
    (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) ||
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null) ||
    reduxToken;

  const adminStoredUser = React.useMemo(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem('adminUser') || localStorage.getItem('user')
          : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const user = adminStoredUser || reduxUser;
  const [searchParams] = useSearchParams();

  const isSuperAdmin = user?.accountType === 'Superadmin';
  const { connectionStatus, isConnected, socket, isRestFallback } = useChatSocket(token);

  // Filters & State
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState('');
  const [adminsList, setAdminsList] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const hasLoadedOnceRef = useRef(false);
  const selectedIdRef = useRef(null);
  const initialUrlIdRef = useRef(searchParams.get('id'));

  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Active conversation message management hook
  const activeConversationId = selectedConversation?.id;
  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const {
    messages,
    loading: loadingMessages,
    loadingMore,
    hasMore,
    sendMessage,
    sendAttachment,
    loadOlderMessages,
    deleteMessage
  } = useMessages(activeConversationId, token);

  // Presence for student participant
  const studentUserId = selectedConversation?.userId;
  const { isOnline, lastSeen } = useChatPresence(studentUserId);

  // Typing indicator
  const {
    typingText,
    handleUserKeystroke,
    stopUserTyping
  } = useTypingIndicator(activeConversationId, adminName);

  // Fetch admin conversations list
  const loadConversations = useCallback(
    async (isSilent = false) => {
      if (!token) return;
      try {
        if (!isSilent && !hasLoadedOnceRef.current) {
          setLoadingList(true);
        }
        const params = { limit: 50 };

        if (activeFilter === 'MY_CHATS') {
          params.myChatsOnly = 'true';
        } else if (activeFilter !== 'ALL') {
          params.status = activeFilter;
        }

        if (selectedAdminFilter) {
          params.assignedTo = selectedAdminFilter;
        }

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        const data = await fetchAdminConversations(params, token);
        const list = data.conversations || [];
        setConversations(list);
        hasLoadedOnceRef.current = true;

        // Auto-select conversation on initial load or preserve current active selection
        const targetId = selectedIdRef.current || initialUrlIdRef.current;
        if (initialUrlIdRef.current) {
          initialUrlIdRef.current = null;
        }
        if (targetId && !selectedIdRef.current) {
          selectedIdRef.current = targetId;
        }

        setSelectedConversation((prev) => {
          const effectiveId = selectedIdRef.current || prev?.id;
          if (!effectiveId) return prev;
          const updated = list.find((c) => String(c.id) === String(effectiveId));
          if (!updated) return prev;
          if (
            prev &&
            prev.id === updated.id &&
            prev.status === updated.status &&
            prev.assignedTo === updated.assignedTo &&
            prev.lastMessageAt === updated.lastMessageAt &&
            prev.unreadCount === updated.unreadCount
          ) {
            return prev;
          }
          return updated;
        });
      } catch (err) {
        console.error('Error fetching admin conversations:', err);
      } finally {
        if (!isSilent) {
          setLoadingList(false);
        }
      }
    },
    [token, activeFilter, selectedAdminFilter, searchTerm]
  );

  useEffect(() => {
    hasLoadedOnceRef.current = false;
    loadConversations();
  }, [loadConversations]);

  // Real-time socket updates for incoming student messages & threads
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = ({ conversationId, message }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => String(c.id) === String(conversationId));
        if (index >= 0) {
          const updated = [...prev];
          const conv = { ...updated[index] };
          conv.lastMessageContent =
            message.content || (message.messageType === 'IMAGE' ? '📷 Image' : 'Attachment');
          conv.lastMessageAt = message.createdAt || new Date();
          if (String(activeConversationId) !== String(conversationId)) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          updated.splice(index, 1);
          return [conv, ...updated];
        } else {
          // If conversation wasn't in current list, reload from API silently
          loadConversations(true);
          return prev;
        }
      });
    };

    const handleUnreadUpdate = () => {
      loadConversations(true);
    };

    const handleStatusUpdate = ({ conversationId, status }) => {
      setConversations((prev) =>
        prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, status } : c))
      );
      setSelectedConversation((prev) =>
        prev && String(prev.id) === String(conversationId) ? { ...prev, status } : prev
      );
    };

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleIncomingMessage);
    socket.on(SOCKET_EVENTS.UNREAD_UPDATE, handleUnreadUpdate);
    socket.on(SOCKET_EVENTS.CONVERSATION_STATUS, handleStatusUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleIncomingMessage);
      socket.off(SOCKET_EVENTS.UNREAD_UPDATE, handleUnreadUpdate);
      socket.off(SOCKET_EVENTS.CONVERSATION_STATUS, handleStatusUpdate);
    };
  }, [socket, activeConversationId, loadConversations]);

  // Auto-refresh conversations silently in REST mode without flashing skeletons
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!socket?.socket?.connected || socket?.isRestFallback) {
        loadConversations(true);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [token, socket, loadConversations]);

  // Load admins list for assignment dropdown
  useEffect(() => {
    if (!token) return;
    fetchAdminsList(token)
      .then((data) => {
        setAdminsList(data.admins || []);
      })
      .catch(() => {});
  }, [token]);

  // Change conversation status
  const handleStatusChange = async (newStatus) => {
    if (!activeConversationId || !token) return;
    try {
      const res = await updateConversationStatus(activeConversationId, newStatus, token);
      if (res.conversation) {
        setSelectedConversation(res.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === res.conversation.id ? { ...c, ...res.conversation } : c))
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  // Assign conversation to admin
  const handleAssign = async (targetAdminId) => {
    if (!activeConversationId || !token) return;
    try {
      const res = await assignConversation(activeConversationId, targetAdminId || null, token);
      if (res.conversation) {
        setSelectedConversation(res.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === res.conversation.id ? { ...c, ...res.conversation } : c))
        );
        toast.success('Conversation assigned successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error assigning conversation');
    }
  };

  const handleSelectConversation = (conv) => {
    selectedIdRef.current = conv?.id || null;
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const statusStyle =
    STATUS_COLORS[selectedConversation?.status] || STATUS_COLORS.OPEN;

  return (
    <AdminLayout>
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
        {/* Top Bar with Real-time Status */}
        <div className="px-5 py-3 bg-purple-700 text-white flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-bold">💬 Student Support Conversations</h1>
            <span className="text-xs text-purple-200 hidden sm:inline">
              ({conversations.length} active threads)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-purple-200 text-[11px] font-medium">
              {isConnected
                ? isRestFallback
                  ? 'Cloud Synced'
                  : 'Real-time Connected'
                : connectionStatus}
            </span>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: Conversation List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white shrink-0 ${
              showMobileChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            <ConversationFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isSuperAdmin={isSuperAdmin}
              adminsList={adminsList}
              selectedAdmin={selectedAdminFilter}
              onAdminChange={setSelectedAdminFilter}
            />

            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              loading={loadingList}
              isAdminView={true}
            />
          </div>

          {/* Right Panel: Active Conversation View */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/50 overflow-hidden ${
              showMobileChat ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                    >
                      <FiArrowLeft size={18} />
                    </button>

                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-sm">
                        {selectedConversation.user?.firstName?.[0] || 'S'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {selectedConversation.user
                            ? `${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`
                            : 'Student'}
                        </h2>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          {selectedConversation.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {selectedConversation.user?.email} • {isOnline ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Header Controls: Course Context, Assign Admin, Status Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedConversation.course && (
                      <div
                        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold"
                        title={`Course context: ${selectedConversation.course.courseName}`}
                      >
                        <FiBookOpen size={13} />
                        <span className="truncate max-w-[140px]">{selectedConversation.course.courseName}</span>
                      </div>
                    )}

                    {/* Assign to Admin Dropdown (Super Admin or Unassigned) */}
                    {(isSuperAdmin || !selectedConversation.assignedTo) && adminsList.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FiUserCheck size={14} className="text-gray-400 hidden sm:inline" />
                        <select
                          value={selectedConversation.assignedTo || ''}
                          onChange={(e) => handleAssign(e.target.value)}
                          className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-2 py-1 outline-none focus:border-purple-600 cursor-pointer"
                        >
                          <option value="">Assign To...</option>
                          {adminsList.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.firstName} {a.lastName} ({a.accountType})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Status Dropdown */}
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-2.5 py-1 font-bold outline-none focus:border-purple-600 cursor-pointer"
                    >
                      <option value="OPEN">Open</option>
                      <option value="PENDING">Pending</option>
                      <option value="CLOSED">Closed</option>
                      <option value="UNASSIGNED">Unassigned</option>
                    </select>
                  </div>
                </div>

                {/* Message List */}
                <MessageList
                  messages={messages}
                  currentUserId={user?.id || user?._id}
                  loading={loadingMessages}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  typingText={typingText}
                  onLoadOlder={loadOlderMessages}
                  onDeleteMessage={deleteMessage}
                />

                {/* Message Input */}
                <MessageInput
                  onSendMessage={sendMessage}
                  onSendAttachment={sendAttachment}
                  onKeystroke={handleUserKeystroke}
                  onStopTyping={stopUserTyping}
                  status={selectedConversation.status}
                  onReopen={() => handleStatusChange('OPEN')}
                />
              </>
            ) : (
              <EmptyChatState
                title="Select a conversation"
                description="Select an active conversation from the left to view user context, message history and reply in real time."
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
