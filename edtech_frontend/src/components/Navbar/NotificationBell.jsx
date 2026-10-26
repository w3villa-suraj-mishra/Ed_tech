import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VscBell, VscCheckAll, VscTrash } from "react-icons/vsc";
import { io } from "socket.io-client";
import {
  fetchNotificationsAPI,
  fetchUnreadCountAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI
} from "../../services/operations/notificationAPI";

const NotificationBell = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load initial notifications & unread count
  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchNotificationsAPI(token, 1, 20);
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  // Real-time Socket.IO Connection
  useEffect(() => {
    if (!token) return;

    const backendUrl = process.env.REACT_APP_BASE_URL
      ? process.env.REACT_APP_BASE_URL.replace("/api/v1", "")
      : "http://localhost:5000";

    const socket = io(backendUrl, {
      auth: { token },
      transports: ["polling"],
      reconnectionAttempts: 3,
    });

    socket.on("connect", () => {
      console.log("🔔 Connected to Notification Socket.IO");
    });

    socket.on("notification:new", (newNotif) => {
      console.log("🔔 Real-time notification received:", newNotif);
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      const ok = await markNotificationReadAPI(notif.id, token);
      if (ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
    setIsOpen(false);

    // Check if notification is a chat message / support conversation
    const isChatMessage =
      notif.type === "CHAT_MESSAGE" ||
      notif.type === "CHAT_ASSIGNMENT" ||
      notif.entityType === "CONVERSATION" ||
      (notif.link && notif.link.includes("conversations"));

    if (isChatMessage) {
      // If student or non-admin user, open the floating student chat widget on screen
      if (user?.accountType !== "Admin") {
        window.dispatchEvent(
          new CustomEvent("OPEN_STUDENT_CHAT", {
            detail: { conversationId: notif.entityId }
          })
        );
        return;
      }
    }

    if (notif.link) {
      // Security & UX guard: Never redirect non-admins to admin routes
      if (notif.link.startsWith("/admin") && user?.accountType !== "Admin") {
        return;
      }
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    const ok = await markAllNotificationsReadAPI(token);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    const ok = await deleteNotificationAPI(notifId, token);
    if (ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      fetchUnreadCountAPI(token).then((count) => setUnreadCount(count));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <VscBell className="w-5 h-5" />

        {/* UNREAD BADGE */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION MODAL PANEL — positioned directly below bell icon */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-[999] w-[340px] sm:w-[380px] max-w-[90vw] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-base text-gray-900 tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
                >
                  <VscCheckAll size={14} /> Mark Read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer text-sm font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100 bg-white">
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-gray-500 font-medium">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-start gap-3 group relative ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  {!notif.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  )}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${!notif.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {notif.message}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition cursor-pointer"
                    title="Delete"
                  >
                    <VscTrash size={15} />
                  </button>
                </div>
              ))
            ) : (
              /* EMPTY STATE */
              <div className="px-8 py-10 flex flex-col items-center justify-center text-center">
                <VscBell size={44} className="text-gray-300 mb-4" />
                {token ? (
                  <>
                    <h4 className="text-base font-bold text-gray-900 mb-1">All Caught Up!</h4>
                    <p className="text-sm text-gray-500 max-w-[230px] leading-relaxed">
                      You have no new notifications right now.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-base font-bold text-gray-900 mb-2">Sign in for updates</h4>
                    <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed mb-6">
                      Log in to track your course progress, notifications, and account status.
                    </p>
                    <button
                      onClick={() => { setIsOpen(false); navigate("/login"); }}
                      className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all duration-200"
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* FOOTER */}
          {token && (
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <button
                onClick={() => { setIsOpen(false); navigate("/dashboard/notifications"); }}
                className="text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer w-full text-center"
              >
                View Notification History →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
