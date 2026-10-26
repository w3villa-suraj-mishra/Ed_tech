import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { 
  VscSignOut, 
  VscDashboard, 
  VscBook, 
  VscAccount, 
  VscBell, 
  VscGear, 
  VscCode, 
  VscChevronDown,
  VscSearch,
  VscClose
} from "react-icons/vsc";
import { logout } from "../../services/operations/authAPI";
import { fetchCourseCategories, getAllCourses } from "../../services/operations/courseDetailsAPI";
import NotificationBell from './NotificationBell';
import { sidebarLinks } from '../../data/dashboard-links';
import SidebarLink from '../core/Dashboard/SidebarLink';
import CartPreview from '../../modules/cart/components/CartPreview';

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const searchContainerRef = useRef(null);

  const userRole = user?.accountType || user?.account_type;

  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          fetchCourseCategories(1, 20),
          getAllCourses(1, 10)
        ]);
        if (isMounted) {
          if (catRes && Array.isArray(catRes)) {
            setCategories(catRes);
          }
          if (courseRes && Array.isArray(courseRes.data)) {
            setCourses(courseRes.data);
            setTotalCourses(courseRes.totalCourses || courseRes.data.length);
          }
        }
      } catch (error) {
        console.log("Could not fetch navbar data", error);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setProfileOpen(false);
        setIsCoursesOpen(false);
        setIsCatalogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock Body Scroll when Mobile Drawer is Open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const matchRoute = (route) => {
    return location.pathname === route;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const [searchedCategories, setSearchedCategories] = useState([]);
  const [searchedCourses, setSearchedCourses] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const q = searchQuery.trim();
    if (!q) {
      setSearchedCategories([]);
      setSearchedCourses([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          fetchCourseCategories(1, 5, q),
          getAllCourses(1, 5, null, q)
        ]);
        if (isMounted) {
          if (catRes && Array.isArray(catRes)) {
            setSearchedCategories(catRes);
          }
          if (courseRes && Array.isArray(courseRes.data)) {
            setSearchedCourses(courseRes.data);
          }
        }
      } catch (err) {
        console.error("Live navbar search failed", err);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredCategories = searchedCategories;
  const filteredCourses = searchedCourses;

  const hasSearchMatches = filteredCategories.length > 0 || filteredCourses.length > 0;

  return (
    <>
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 transition-all">
      <div className="w-11/12 max-w-maxContent mx-auto">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* BRAND LOGO & MOBILE HAMBURGER BUTTON */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Trigger (Always visible on mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-[#3B82F6] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Toggle Mobile Menu"
            >
              <span className="text-xl leading-none">☰</span>
            </button>

            {/* CodeLearn Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <VscCode />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-base tracking-tight leading-none group-hover:text-[#3B82F6] transition-colors">
                  CodeLearn
                </span>
                <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase mt-1 hidden sm:block">
                  Learn • Build • Grow
                </span>
              </div>
            </Link>
          </div>

          {/* DESKTOP SEARCH BAR */}
          <div ref={searchContainerRef} className="hidden md:flex flex-col flex-1 max-w-xs lg:max-w-sm mx-2 relative z-50 group">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses, categories, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <VscClose className="text-sm" />
                </button>
              )}
            </form>

            {/* SEARCH SUGGESTIONS DROPDOWN */}
            {searchQuery.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-premium-light overflow-hidden z-[100] opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 max-h-[75vh] overflow-y-auto">
                {hasSearchMatches ? (
                  <div className="py-2 divide-y divide-gray-100">
                    
                    {/* CATEGORIES MATCHES */}
                    {filteredCategories.length > 0 && (
                      <div className="py-1">
                        <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                          <span>Categories</span>
                        </div>
                        <ul>
                          {filteredCategories.map((cat) => {
                            const catId = cat._id || cat.id;
                            const targetLink = `/categories?search=${encodeURIComponent(cat.name)}`;
                            return (
                              <li key={catId || cat.name}>
                                <Link
                                  to={targetLink}
                                  onClick={() => setSearchQuery("")}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-purple-50/60 text-xs text-gray-800 hover:text-purple-700 transition-colors group/item"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                      📁
                                    </span>
                                    <span className="font-semibold truncate">{cat.name}</span>
                                  </div>
                                  <span className="text-[10px] font-medium text-purple-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    Browse →
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* COURSES MATCHES */}
                    {filteredCourses.length > 0 && (
                      <div className="py-1">
                        <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                          <span>Courses</span>
                        </div>
                        <ul>
                          {filteredCourses.map((course) => (
                            <li key={course._id || course.id}>
                              <Link
                                to={`/courses/${course._id || course.id}`}
                                onClick={() => setSearchQuery("")}
                                className="block px-4 py-2 hover:bg-blue-50/60 text-xs text-gray-700 hover:text-blue-600 transition-colors"
                              >
                                <div className="font-semibold truncate text-gray-900">{course.courseName}</div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5 truncate">
                                  {course.category?.name && (
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-gray-600">
                                      {course.category.name}
                                    </span>
                                  )}
                                  {course.instructor && course.instructor.firstName && (
                                    <span>
                                      By {course.instructor.firstName} {course.instructor.lastName}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-500 text-center">
                    No matching categories or courses found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden lg:flex items-center gap-x-6 text-sm font-medium text-gray-600">
            
            {/* Courses Dropdown */}
            <div
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setIsCoursesOpen(true)}
              onMouseLeave={() => setIsCoursesOpen(false)}
            >
              <button 
                className={`flex items-center gap-1.5 transition-colors ${matchRoute('/courses') ? 'text-[#4B5563] font-semibold' : 'hover:text-gray-900'}`}
                aria-expanded={isCoursesOpen}
              >
                <span>Courses</span>
                <VscChevronDown className={`text-xs transition-transform duration-200 ${isCoursesOpen ? 'rotate-180 text-[#4F8FF7]' : 'text-gray-400'}`} />
              </button>

              {isCoursesOpen && (
                <div className="absolute top-full left-0 pt-2 w-[320px] z-50">
                  <div className="bg-white rounded-2xl p-4 shadow-premium-light border border-gray-200 text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Top Curated Courses
                      </span>
                      <span className="text-[10px] bg-[#EFF6FF] text-[#3B82F6] px-2 py-0.5 rounded-full font-bold border border-[#DBEAFE]">
                        {totalCourses > 1000 ? `${(totalCourses / 1000).toFixed(1)}K Available` : `${totalCourses || courses.length} Available`}
                      </span>
                    </div>

                    <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {courses.length > 0 ? (
                        courses.slice(0, 8).map((course, i) => (
                          <Link
                            key={course._id || i}
                            to={`/courses/${course._id}`}
                            onClick={() => setIsCoursesOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl text-xs text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors group/item"
                          >
                            <div className="flex flex-col max-w-[200px]">
                              <span className="font-medium truncate capitalize">{course.courseName}</span>
                              {course.instructor && (
                                <span className="text-[10px] text-gray-400">
                                  By {course.instructor.firstName || 'Instructor'}
                                </span>
                              )}
                            </div>
                            <span className="text-[#3B82F6] font-semibold text-xs shrink-0">
                              ₹{course.price || 0}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-center text-xs text-gray-400 py-3">
                          No Courses Available
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                      <Link 
                        to="/courses" 
                        onClick={() => setIsCoursesOpen(false)}
                        className="text-xs font-semibold text-[#3B82F6] hover:text-[#3B82F6] transition-colors inline-flex items-center gap-1"
                      >
                        <span>View All Courses</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setIsCatalogOpen(true)}
              onMouseLeave={() => setIsCatalogOpen(false)}
            >
              <button 
                className={`flex items-center gap-1.5 transition-colors ${matchRoute('/catalog') ? 'text-[#4F8FF7] font-semibold' : 'hover:text-gray-900'}`}
                aria-expanded={isCatalogOpen}
              >
                <span>Categories</span>
                <VscChevronDown className={`text-xs transition-transform duration-200 ${isCatalogOpen ? 'rotate-180 text-[#4F8FF7]' : 'text-gray-400'}`} />
              </button>

              {isCatalogOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[280px] z-50">
                  <div className="bg-white rounded-2xl p-4 shadow-premium-light border border-gray-200 text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Explore Disciplines
                      </span>
                      <span className="text-[10px] bg-[#EFF6FF] text-[#3B82F6] px-2 py-0.5 rounded-full font-bold border border-[#DBEAFE]">
                        {categories.length} Total
                      </span>
                    </div>

                    <div className="max-h-[260px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {categories.length > 0 ? (
                        categories.map((subLink, i) => (
                          <Link
                            key={subLink._id || i}
                            to={`/categories?search=${encodeURIComponent(subLink.name)}`}
                            onClick={() => setIsCatalogOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors group/item"
                          >
                            <span className="capitalize">{subLink.name}</span>
                            <span className="text-gray-400 group-hover/item:translate-x-0.5 transition-transform text-[10px]">
                              →
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-center text-xs text-gray-400 py-3">
                          No Categories Found
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 text-center">
                      <Link 
                        to="/categories" 
                        onClick={() => setIsCatalogOpen(false)}
                        className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                      >
                        <span>View All Categories</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Practice Center */}
            <Link 
              to="/practice" 
              className={`transition-colors py-1 ${matchRoute('/practice') ? 'text-[#4F8FF7] font-semibold' : 'hover:text-gray-900'}`}
            >
              Practice
            </Link>

            {/* About */}
            <Link 
              to="/about" 
              className={`transition-colors py-1 ${matchRoute('/about') ? 'text-[#4F8FF7] font-semibold' : 'hover:text-gray-900'}`}
            >
              About
            </Link>

            {/* Contact */}
            <Link 
              to="/contact" 
              className={`transition-colors py-1 ${matchRoute('/contact') ? 'text-[#4F8FF7] font-semibold' : 'hover:text-gray-900'}`}
            >
              Contact
            </Link>
          </nav>

          {/* ACTION CONTROLS (Notification Bell + Profile Dropdown / Auth Buttons) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Trigger */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-700 hover:text-[#3B82F6] hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Open Mobile Search"
            >
              <VscSearch className="text-xl" />
            </button>

            {/* Real-time Notification Bell */}
            <NotificationBell />

            {/* Cart Icon & Quick Preview Dropdown */}
            {(!userRole || userRole === "Student") && (
              <div className="relative">
                <button
                  onClick={() => setIsCartPreviewOpen(!isCartPreviewOpen)}
                  className="relative p-2 rounded-xl text-gray-600 hover:text-[#3B82F6] hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                  title="Cart"
                  aria-label="View Cart"
                >
                  <AiOutlineShoppingCart className="text-xl" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </button>

                <CartPreview
                  isOpen={isCartPreviewOpen}
                  onClose={() => setIsCartPreviewOpen(false)}
                />
              </div>
            )}

            {/* Unauthenticated Login / Sign Up */}
            {token === null && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login">
                  <button className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <button className="px-4 py-2 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95">
                    Join For Free
                  </button>
                </Link>
              </div>
            )}

            {/* Authenticated User Profile Avatar */}
            {token !== null && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-all focus:outline-none cursor-pointer"
                  aria-label="User Account Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#15803D] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                    {(user?.first_name ? user.first_name[0].toUpperCase() : "S")}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                    {user?.first_name || "Suraj"}
                  </span>
                  <VscChevronDown className="text-xs text-slate-500" />
                </button>

                {/* Account Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2.5 w-60 max-h-[80vh] overflow-y-auto custom-scrollbar rounded-2xl bg-white border border-gray-200 text-gray-700 shadow-premium-light z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    <div className="px-4 py-2 border-b border-gray-200 mb-1">
                      <h3 className="font-semibold text-xs text-gray-900">{user?.first_name} {user?.last_name}</h3>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Dynamic User Account Links */}
                    <div className="space-y-0.5">
                      <Link
                        to="/dashboard/global"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscDashboard className="text-sm text-[#3B82F6]" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/practice"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscCode className="text-sm text-[#3B82F6]" />
                        <span>Practice</span>
                      </Link>

                      <Link
                        to="/dashboard/enrolled-courses"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscBook className="text-sm text-[#3B82F6]" />
                        <span>Enrolled Courses</span>
                      </Link>

                      <Link
                        to="/dashboard/my-profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscAccount className="text-sm text-[#3B82F6]" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscGear className="text-sm text-[#3B82F6]" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="/dashboard/notifications"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                      >
                        <VscBell className="text-sm text-[#3B82F6]" />
                        <span>Notifications</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-200 mt-1.5 pt-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          dispatch(logout(navigate));
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                      >
                        <VscSignOut className="text-sm text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>

      {/* MOBILE SLIDE-IN OVERLAY SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[99999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <aside className="fixed top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white border-r border-gray-200 z-[100000] flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-2xl p-5 animate-in slide-in-from-left duration-300">
            
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base shadow-sm">
                    <VscCode />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-bold text-sm tracking-tight leading-none">CodeLearn</span>
                    <span className="text-[8px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">LEARN • BUILD • GROW</span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Close Drawer"
                >
                  ✕
                </button>
              </div>




              {/* Main Navigation Links */}
              <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
                <Link
                  to="/courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                >
                  <span>All Courses</span>
                  <span className="text-gray-400">→</span>
                </Link>
                <Link
                  to="/catalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                >
                  <span>Categories</span>
                  <span className="text-gray-400">→</span>
                </Link>
                <Link
                  to="/practice"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                >
                  <span>Practice Center</span>
                  <span className="text-gray-400">→</span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                >
                  <span>About Us</span>
                  <span className="text-gray-400">→</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#EFF6FF] hover:text-[#3B82F6]"
                >
                  <span>Contact Us</span>
                  <span className="text-gray-400">→</span>
                </Link>
              </div>

              {/* Role-Based Dashboard Links if Logged In */}
              {token && (
                <div className="flex flex-col gap-1 pt-3">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    My Account
                  </span>
                  <SidebarLink
                    link={{ name: 'My Profile', path: '/dashboard/my-profile' }}
                    iconName="VscAccount"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />

                  {sidebarLinks.map((link) => {
                    if (link.type && userRole !== link.type) return null;
                    return (
                      <SidebarLink
                        key={link.id}
                        link={link}
                        iconName={link.icon}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 mt-6 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    dispatch(logout(navigate));
                  }}
                  className="w-full px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2"
                >
                  <VscSignOut className="text-base" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      Log In
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

          </aside>
        </div>
      )}

      {/* MOBILE SEARCH OVERLAY */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[100000] flex flex-col">
          {/* Invisible backdrop to close search when clicking outside, but leaves page visible */}
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileSearchOpen(false)}
          />
          
          {/* Top Search Bar */}
          <div className="relative bg-white shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center px-4 py-3 gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses, categories, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#3BA7F2] focus:bg-white transition-all shadow-sm"
                />
              </form>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center shrink-0 shadow-sm"
                aria-label="Close Search"
              >
                <VscClose className="text-xl" />
              </button>
            </div>
            
            {/* Results Dropdown */}
            {searchQuery && (
              <div className="max-h-[60vh] overflow-y-auto bg-gray-50 p-4 border-t border-gray-100 shadow-inner space-y-4">
                {hasSearchMatches ? (
                  <>
                    {/* Categories */}
                    {filteredCategories.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 px-1">Categories</span>
                        {filteredCategories.map(cat => {
                          const catId = cat._id || cat.id;
                          const targetLink = `/categories?search=${encodeURIComponent(cat.name)}`;
                          return (
                            <Link
                              key={catId || cat.name}
                              to={targetLink}
                              onClick={() => {
                                setIsMobileSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between group active:scale-[0.98] transition-all hover:border-purple-200"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">📁</span>
                                <span className="text-xs font-semibold text-gray-800 truncate">{cat.name}</span>
                              </div>
                              <span className="text-xs font-medium text-purple-500">Browse →</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Courses */}
                    {filteredCourses.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 px-1">Courses</span>
                        {filteredCourses.map(course => (
                          <Link
                            key={course._id}
                            to={`/courses/${course._id}`}
                            onClick={() => {
                              setIsMobileSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between group active:scale-[0.98] transition-all hover:border-blue-200"
                          >
                            <div className="flex flex-col truncate pr-2">
                              <span className="text-sm font-medium text-gray-800 truncate">{course.courseName}</span>
                              {course.category?.name && (
                                <span className="text-[10px] text-gray-500">{course.category.name}</span>
                              )}
                            </div>
                            <span className="text-gray-300 group-hover:text-[#3BA7F2] transition-colors">→</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500">
                    No matching categories or courses found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
