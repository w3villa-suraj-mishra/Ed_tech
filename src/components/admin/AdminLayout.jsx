import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getNotifications } from '../../services/admin/adminAPI';

import { 
  RiDashboardLine,
  RiGroupLine,
  RiBookOpenLine,
  RiPriceTag3Line,
  RiClipboardLine,
  RiFlashlightLine,
  RiGlobalLine,
  RiGraduationCapLine,
  RiMegaphoneLine,
  RiCoupon3Line,
  RiStarLine,
  RiArticleLine,
  RiUserStarLine,
  RiMailLine,
  RiChat3Line
} from "react-icons/ri";

const NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <RiDashboardLine size={18} /> },
  { label: 'Support Chats', path: '/admin/conversations', icon: <RiChat3Line size={18} /> },
  { label: 'Users', path: '/admin/users', icon: <RiGroupLine size={18} /> },
  { label: 'Courses', path: '/admin/courses', icon: <RiBookOpenLine size={18} /> },
  { label: 'Categories', path: '/admin/categories', icon: <RiPriceTag3Line size={18} /> },
  { label: 'Enrollments', path: '/admin/enrollments', icon: <RiClipboardLine size={18} /> },
  {
    group: 'Practice',
    icon: <RiFlashlightLine size={18} />,
    children: [
      { label: 'Practice Bank', path: '/admin/practice-bank', icon: <RiFlashlightLine size={16} /> },
      { label: 'Global Tests', path: '/admin/global-tests', icon: <RiGlobalLine size={16} /> },
      { label: 'Course Tests', path: '/admin/course-tests', icon: <RiGraduationCapLine size={16} /> },
    ]
  },
  {
    group: 'Announcements & Offers',
    icon: <RiMegaphoneLine size={18} />,
    children: [
      { label: 'Announcements', path: '/admin/announcements', icon: <RiMegaphoneLine size={16} /> },
      { label: 'Offers & Coupons', path: '/admin/offers', icon: <RiCoupon3Line size={16} /> },
    ]
  },
  { label: 'Reviews', path: '/admin/reviews', icon: <RiStarLine size={18} /> },
  { label: 'Articles', path: '/admin/articles', icon: <RiArticleLine size={18} /> },
  { label: 'Instructor Spotlight', path: '/admin/instructors', icon: <RiUserStarLine size={18} /> },
  { label: 'Contact Us', path: '/admin/contacts', icon: <RiMailLine size={18} /> },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('adminOpenGroups');
      return saved ? JSON.parse(saved) : ['Actions'];
    } catch {
      return ['Actions'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('adminOpenGroups', JSON.stringify(openGroups));
    } catch {}
  }, [openGroups]);

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const [theme, setTheme]             = useState(localStorage.getItem('adminTheme') || 'dark');
  const [notifications, setNotifs]    = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [tabFilter, setTabFilter]     = useState('all');
  const notifRef                      = useRef(null);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  useEffect(() => {
    NAV.forEach((item) => {
      if (item.children) {
        const hasActive = item.children.some((child) => location.pathname.startsWith(child.path));
        if (hasActive) {
          setOpenGroups((prev) => (prev.includes(item.group) ? prev : [...prev, item.group]));
        }
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  const loadNotifications = () => {
    getNotifications()
      .then(({ data }) => {
        if (data?.success) {
          setNotifs(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadNotifications();
    }, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isLight = theme === 'light';

  const displayedNotifs = tabFilter === 'unread' 
    ? notifications.filter(n => n.type === 'contact')
    : notifications;

  const renderNavLinks = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
      {NAV.map((item, index) => {
        if (item.children) {
          const isExpanded = openGroups.includes(item.group);
          const hasActiveChild = item.children.some((child) => location.pathname.startsWith(child.path));

          return (
            <div key={item.group || index} className="mx-2 mb-1">
              <button
                onClick={() => toggleGroup(item.group)}
                title={!sidebarOpen && !isMobile ? item.group : ''}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-150 text-[15px] cursor-pointer ${
                  hasActiveChild
                    ? 'text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-[#282B3A]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[20px] flex-shrink-0 text-gray-400">{item.icon}</span>
                  {(sidebarOpen || isMobile) && <span className="truncate">{item.group}</span>}
                </div>
                {(sidebarOpen || isMobile) && (
                  <span className="text-[10px] text-gray-500 transition-transform duration-200 ml-1">
                    {isExpanded ? '⌃' : '⌄'}
                  </span>
                )}
              </button>

              {/* Subsections */}
              {isExpanded && (
                <div className={`mt-1 space-y-1 ${sidebarOpen || isMobile ? 'pl-8' : ''}`}>
                  {item.children.map((child) => {
                    const active = location.pathname.startsWith(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => isMobile && setMobileDrawerOpen(false)}
                        title={!sidebarOpen && !isMobile ? child.label : ''}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-[14px] ${
                          active
                            ? 'bg-[#282B3A] text-white font-medium'
                            : 'text-gray-300 hover:bg-[#282B3A] hover:text-white'
                        }`}
                      >
                        <span className="text-[18px] flex-shrink-0 text-gray-400">{child.icon}</span>
                        {(sidebarOpen || isMobile) && <span className="truncate">{child.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const active = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileDrawerOpen(false)}
            title={!sidebarOpen && !isMobile ? item.label : ''}
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-1 transition-all duration-150 text-[15px]
              ${active
                ? 'bg-[#282B3A] text-white font-medium'
                : 'text-gray-300 hover:bg-[#282B3A] hover:text-white'
              }`}
          >
            <span className="text-[20px] flex-shrink-0 text-gray-400">{item.icon}</span>
            {(sidebarOpen || isMobile) && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex font-inter bg-[#f4f5f8] text-gray-800">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. DESKTOP SIDEBAR (Visible on md and larger)              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 border-r flex-col transition-all duration-300 z-30 sticky top-0 h-screen ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#1a1b24] border-[#262837]'
        }`}
      >
        {/* Logo */}
        <div className={`h-24 flex items-center justify-center px-4 border-b ${
          isLight ? 'border-slate-200' : 'border-[#262837]'
        }`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSidebarOpen(false)}>
              <span className="text-[28px] text-[#FFD60A]">⚡</span>
              <span className="text-[20px] font-extrabold text-[#FFD60A] tracking-tight">
                Admin Portal
              </span>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[28px] cursor-pointer hover:scale-110 transition-transform text-[#FFD60A]"
            >
              ⚡
            </button>
          )}
        </div>

        {/* Desktop Nav */}
        {renderNavLinks(false)}

        {/* Desktop User info */}
        <div className={`border-t p-4 ${isLight ? 'border-slate-200' : 'border-[#2C333F]'}`}>
          {sidebarOpen ? (
            <div className="mb-3">
              <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-[#999DAA]'}`}>{adminUser.email}</p>
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                adminUser.accountType === 'Superadmin'
                  ? 'bg-[#FFD60A]/20 text-[#FFD60A]'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {adminUser.accountType}
              </span>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE DRAWER OVERLAY (Visible when mobileDrawerOpen)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Fixed Drawer Panel */}
          <div className={`fixed top-0 left-0 bottom-0 w-64 border-r z-50 flex flex-col justify-between py-4 shadow-2xl transition-transform duration-300 overflow-y-auto custom-scrollbar ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#1a1b24] border-[#262837]'
          }`}>
            <div>
              <div className="flex items-center justify-between px-6 pb-6 pt-2 border-b border-[#262837]">
                <div className="flex items-center gap-2">
                  <span className="text-[24px] text-[#FFD60A]">⚡</span>
                  <span className="text-[18px] font-extrabold text-[#FFD60A] tracking-tight">
                    Admin Portal
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-[#AFB2BF] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {renderNavLinks(true)}
            </div>

            <div className="border-t p-4 border-[#262837] mt-4">
              <div className="mb-3">
                <p className="text-xs truncate text-[#999DAA]">{adminUser.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FFD60A]/20 text-[#FFD60A]">
                  {adminUser.accountType}
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT CONTAINER                                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f5f8]">
        
        {/* Topbar */}
        <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Open Admin Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-800 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl shadow-xl border bg-white border-gray-200 text-gray-800 z-50 overflow-hidden">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-100 px-4 pt-2 text-xs font-semibold text-gray-500">
                    <button
                      onClick={() => setTabFilter('all')}
                      className={`pb-2.5 px-3 border-b-2 transition-all ${
                        tabFilter === 'all'
                          ? 'border-purple-600 text-purple-700 font-bold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTabFilter('unread')}
                      className={`pb-2.5 px-3 border-b-2 transition-all ${
                        tabFilter === 'unread'
                          ? 'border-purple-600 text-purple-700 font-bold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {displayedNotifs.length === 0 ? (
                      <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <h4 className="text-xs font-bold text-gray-700 mb-1">All caught up!</h4>
                        <p className="text-[11px] text-gray-500">You have no new notifications</p>
                      </div>
                    ) : (
                      displayedNotifs.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-xs text-purple-600">{n.title}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2">{n.message}</p>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50">
                    <Link
                      to="/admin/contacts"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-1.5 hover:text-purple-700 transition-colors font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      View All
                    </Link>
                    <button
                      onClick={() => loadNotifications()}
                      className="flex items-center gap-1.5 hover:text-purple-700 transition-colors font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar (Generic gray circle like reference) */}
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden mr-2">
              <svg className="w-5 h-5 text-gray-400 mt-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </header>

        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 text-[13px] shadow-sm flex items-center">
          <Link to="/admin/dashboard" className="text-purple-600 font-semibold hover:underline decoration-1 underline-offset-2">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-500 capitalize">
            {location.pathname.replace('/admin/', '').replace(/-/g, ' ') || 'Dashboard'}
          </span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 text-gray-800">
          {children}
        </main>
      </div>

    </div>
  );
}
