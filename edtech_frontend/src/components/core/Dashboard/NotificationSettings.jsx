import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchNotificationPreferencesAPI,
  updateNotificationPreferencesAPI,
  createAdminNotificationAPI
} from "../../../services/operations/notificationAPI";
import {
  FiBell,
  FiCheck,
  FiBookOpen,
  FiCalendar,
  FiStar,
  FiTag,
  FiSend
} from "react-icons/fi";

const NotificationSettings = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const isAdmin = user?.accountType === "Admin" || user?.account_type === "Admin";

  const [activeTab, setActiveTab] = useState("preferences");
  const [preferences, setPreferences] = useState({
    courseUpdates: true,
    newLessons: true,
    newCourses: true,
    discussionReplies: true,
    courseReviews: true,
    offersPromotions: true,
    planExpiration: true,
    platformAnnouncements: true
  });
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);

  // Admin Broadcast Form State
  const [adminForm, setAdminForm] = useState({
    title: "",
    message: "",
    type: "PLATFORM_ANNOUNCEMENT",
    audience: "All Users",
    link: "/catalog",
    courseId: ""
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      if (!token) return;
      setLoading(true);
      const data = await fetchNotificationPreferencesAPI(token);
      if (data) {
        setPreferences({
          courseUpdates: Boolean(data.courseUpdates ?? data.course_updates ?? true),
          newLessons: Boolean(data.newLessons ?? data.new_lessons ?? true),
          newCourses: Boolean(data.newCourses ?? data.new_courses ?? true),
          discussionReplies: Boolean(data.discussionReplies ?? data.discussion_replies ?? true),
          courseReviews: Boolean(data.courseReviews ?? data.course_reviews ?? true),
          offersPromotions: Boolean(data.offersPromotions ?? data.offers_promotions ?? true),
          planExpiration: Boolean(data.planExpiration ?? data.plan_expiration ?? true),
          platformAnnouncements: Boolean(data.platformAnnouncements ?? data.platform_announcements ?? true)
        });
      }
      setLoading(false);
    };
    loadPrefs();
  }, [token]);

  const handlePrefToggle = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setLastSaved(true);
    setTimeout(() => setLastSaved(false), 2000);
    if (token) {
      await updateNotificationPreferencesAPI(updated, token);
    }
  };

  const handleAdminSend = async (e) => {
    e.preventDefault();
    if (!adminForm.title || !adminForm.message) return;
    setSending(true);
    const res = await createAdminNotificationAPI(adminForm, token);
    if (res) {
      setAdminForm({
        title: "",
        message: "",
        type: "PLATFORM_ANNOUNCEMENT",
        audience: "All Users",
        link: "/catalog",
        courseId: ""
      });
    }
    setSending(false);
  };

  // Preference item definitions matching the UI screenshot exactly
  const preferenceItems = [
    {
      key: "courseUpdates",
      label: "Course Updates",
      desc: "Alerts when course content or structure is modified.",
      iconBg: "bg-[#EFF6FF] border-[#DBEAFE] text-[#3BA7F2]",
      icon: <FiBookOpen className="text-xl" />
    },
    {
      key: "newLessons",
      label: "New Lessons & Lectures",
      desc: "Notifications when instructors add new lectures.",
      iconBg: "bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <polygon points="10 8 15 10 10 12 10 8" fill="currentColor" stroke="none" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      )
    },
    {
      key: "newCourses",
      label: "New Course Launches",
      desc: "Alerts for newly published courses across categories.",
      iconBg: "bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4.5c1.45-1.47 4.5-2 4.5-2" />
          <path d="M15 9v5s3.03-.55 4.5-2c1.47-1.45 2-4.5 2-4.5" />
        </svg>
      )
    },
    {
      key: "discussionReplies",
      label: "Discussion & Comment Replies",
      desc: "Notifications when someone replies to your post.",
      iconBg: "bg-[#FFFBEB] border-[#FEF3C7] text-[#D97706]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          <circle cx="12" cy="11.5" r="0.75" fill="currentColor" />
          <circle cx="16" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
      )
    },
    {
      key: "courseReviews",
      label: "Course Reviews (Instructors)",
      desc: "Alerts when students rate or review your course.",
      iconBg: "bg-[#13AA92]/10 border-[#13AA92]/30 text-[#13AA92]",
      icon: <FiStar className="text-xl" />
    },
    {
      key: "offersPromotions",
      label: "Offers & Promotions",
      desc: "Discount codes, sale events, and promotional deals.",
      iconBg: "bg-[#F7FEE7] border-[#ECFCCB] text-[#65A30D]",
      icon: <FiTag className="text-xl" />
    },
    {
      key: "planExpiration",
      label: "Plan & Subscription Expiration",
      desc: "Reminders before Silver/Gold plan access expires.",
      iconBg: "bg-[#FDF2F8] border-[#FCE7F3] text-[#DB2777]",
      icon: <FiCalendar className="text-xl" />
    },
    {
      key: "platformAnnouncements",
      label: "Platform Announcements",
      desc: "System maintenance and major platform updates.",
      iconBg: "bg-[#F0F9FF] border-[#E0F2FE] text-[#0284C7]",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11v3a2 2 0 0 0 2 2h1l4 4V4L6 8H5a2 2 0 0 0-2 2z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1E293B] font-sans pb-12 max-w-[1240px] mx-auto">
      
      {isAdmin && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "admin" ? "preferences" : "admin")}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FiSend size={13} />
            <span>{activeTab === "admin" ? "Close Composer" : "Admin Composer"}</span>
          </button>
        </div>
      )}

      {/* NOTIFICATION PREFERENCES CARD */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          
          {/* Card Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Notification Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Control which non-critical real-time alerts you wish to receive in your notification bell.
              </p>
            </div>

            {/* Pill: Changes are saved automatically */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 text-[11px] sm:text-xs text-slate-600 font-medium">
              <FiBell className="text-slate-400 text-xs shrink-0" />
              <span>Changes are saved automatically</span>
              <FiCheck className={`text-xs ml-0.5 transition-colors ${lastSaved ? "text-emerald-600 font-bold" : "text-slate-500"}`} />
            </div>
          </div>

          {/* 2-Column Grid of 8 Preference Items */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your preferences...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferenceItems.map(({ key, label, desc, iconBg, icon }) => {
                const isChecked = preferences[key];
                return (
                  <div
                    key={key}
                    onClick={() => handlePrefToggle(key)}
                    className="border border-slate-200/80 rounded-2xl p-4 sm:p-4.5 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    {/* Left: Pastel Icon Box + Texts */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} transition-transform group-hover:scale-105`}>
                        {icon}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {label}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Smooth Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrefToggle(key);
                      }}
                      className={`w-12 h-6.5 rounded-full transition-colors duration-200 relative p-0.5 cursor-pointer shrink-0 focus:outline-none ${
                        isChecked ? "bg-[#3BA7F2]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`block w-5.5 h-5.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                          isChecked ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ADMIN BROADCAST COMPOSER (If Admin active) */}
      {activeTab === "admin" && isAdmin && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiSend className="text-indigo-600" /> Create Platform Broadcast / Targeted Notification
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Send instant real-time and persistent database notifications to platform users.
            </p>
          </div>

          <form onSubmit={handleAdminSend} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Platform Maintenance Scheduled"
                  value={adminForm.title}
                  onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Audience *</label>
                <select
                  value={adminForm.audience}
                  onChange={(e) => setAdminForm({ ...adminForm, audience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                >
                  <option value="All Users">All Users</option>
                  <option value="Students">Students Only</option>
                  <option value="Instructors">Instructors Only</option>
                  <option value="Specific Course Students">Specific Course Enrollees</option>
                </select>
              </div>
            </div>

            {adminForm.audience === "Specific Course Students" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Course ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Course ID"
                  value={adminForm.courseId}
                  onChange={(e) => setAdminForm({ ...adminForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Destination Link</label>
              <input
                type="text"
                placeholder="e.g. /catalog or /dashboard/courses"
                value={adminForm.link}
                onChange={(e) => setAdminForm({ ...adminForm, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Enter complete notification message..."
                value={adminForm.message}
                onChange={(e) => setAdminForm({ ...adminForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiSend size={14} /> {sending ? "Dispatching..." : "Send Notification Broadcast"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default NotificationSettings;
