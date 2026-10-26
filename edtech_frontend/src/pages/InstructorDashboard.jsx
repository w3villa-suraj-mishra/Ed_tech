import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiUsers,
  FiCreditCard,
  FiStar,
  FiPlus,
  FiArrowRight,
  FiBarChart2,
  FiShield,
  FiSettings,
  FiDatabase,
  FiCode,
  FiMoreVertical,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiEdit3,
  FiEye,
  FiDollarSign
} from 'react-icons/fi';
import {
  SiReact,
  SiEthereum,
  SiVuedotjs,
  SiSwift,
  SiRust,
  SiGraphql,
  SiOpenai,
  SiFlutter,
  SiKubernetes,
  SiFigma,
  SiNodedotjs,
  SiPython
} from 'react-icons/si';
import { FaCrown } from 'react-icons/fa';
import { getInstructorData } from '../services/operations/profileAPI';
import ConfirmationModal from '../components/Common/ConfirmationModal';

// Helper to render course icons matching reference screenshot
const CourseIcon = ({ course }) => {
  const name = (course.courseName || '').toLowerCase();
  const tech = course.tech || '';

  if (tech === 'react-native' || name.includes('react native')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-[#00d8ff] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiReact />
      </div>
    );
  }
  if (tech === 'ethereum' || name.includes('blockchain') || name.includes('ethereum')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#627eea] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiEthereum />
      </div>
    );
  }
  if (tech === 'analytics' || name.includes('analytics') || name.includes('powerbi') || name.includes('sql')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#38bdf8] flex items-center justify-center text-lg shrink-0 shadow-xs">
        <FiBarChart2 />
      </div>
    );
  }
  if (tech === 'vue' || name.includes('vue') || name.includes('nuxt')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-[#42b883] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiVuedotjs />
      </div>
    );
  }
  if (tech === 'swift' || name.includes('swift') || name.includes('ios')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#f05138] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiSwift />
      </div>
    );
  }
  if (tech === 'go' || name.includes('go language') || name.includes('backend api engineering')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#00acd7] text-white flex items-center justify-center font-black text-xs tracking-tight shrink-0 shadow-xs">
        GO
      </div>
    );
  }
  if (tech === 'rust' || name.includes('rust')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#f74c00] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiRust />
      </div>
    );
  }
  if (tech === 'graphql' || name.includes('graphql') || name.includes('prisma')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#e535ab] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiGraphql />
      </div>
    );
  }
  if (tech === 'ai' || name.includes('ai &') || name.includes('prompt engineering') || name.includes('language model')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#2e1a5a] text-[#a78bfa] flex items-center justify-center text-lg shrink-0 shadow-xs">
        <SiOpenai />
      </div>
    );
  }
  if (tech === 'flutter' || name.includes('flutter') || name.includes('dart')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#02569b] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiFlutter className="text-[#38bdf8]" />
      </div>
    );
  }
  if (tech === 'security' || name.includes('cyber security') || name.includes('hacking')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-[#38bdf8] flex items-center justify-center text-lg shrink-0 shadow-xs">
        <FiShield />
      </div>
    );
  }
  if (tech === 'devops' || name.includes('devops') || name.includes('kubernetes')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#326ce5] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiKubernetes />
      </div>
    );
  }
  if (tech === 'uiux' || name.includes('figma') || name.includes('ui/ux')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#a259ff] flex items-center justify-center text-lg shrink-0 shadow-xs">
        <SiFigma />
      </div>
    );
  }
  if (tech === 'system-design' || name.includes('system design')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-slate-300 flex items-center justify-center text-lg shrink-0 shadow-xs">
        <FiSettings />
      </div>
    );
  }
  if (tech === 'aws' || name.includes('aws') || name.includes('cloud engineering')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-[#ff9900] flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
        aws
      </div>
    );
  }
  if (tech === 'node' || name.includes('node.js') || name.includes('postgresql')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-[#22c55e] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiNodedotjs />
      </div>
    );
  }
  if (tech === 'react-next' || (name.includes('react') && name.includes('typescript'))) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#007acc] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
        TS
      </div>
    );
  }
  if (tech === 'dsa' || name.includes('data structures') || name.includes('supreme')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-slate-200 flex items-center justify-center text-lg shrink-0 shadow-xs">
        <FiDatabase />
      </div>
    );
  }
  if (tech === 'fullstack' || name.includes('bootcamp') || name.includes('full stack web')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-blue-400 flex items-center justify-center text-lg shrink-0 shadow-xs">
        <FiCode />
      </div>
    );
  }
  if (tech === 'python' || name.includes('python')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1e293b] text-[#ffd43b] flex items-center justify-center text-xl shrink-0 shadow-xs">
        <SiPython />
      </div>
    );
  }

  // Fallback thumbnail or letter badge
  if (course.thumbnail) {
    return (
      <img
        src={course.thumbnail}
        alt=""
        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold flex items-center justify-center shrink-0 shadow-xs">
      {course.courseName?.[0] || 'C'}
    </div>
  );
};

// SVG Sparkline component for Stat Cards
const Sparkline = ({ stroke = '#3BA7F2' }) => (
  <svg width="68" height="22" viewBox="0 0 68 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 opacity-80">
    <path
      d="M2 16C12 12 18 20 28 10C38 0 48 14 66 6"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [activeTab, setActiveTab] = useState('COURSES');
  const [confirmationModal, setConfirmationModal] = useState(null);

  // READ MORE / VIEW MORE FEATURE STATE:
  // Shows initial 6 courses, expandable to all courses with sleek button
  const INITIAL_DISPLAY_COUNT = 6;
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dots action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch instructor analytics data from API
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;
      setLoading(true);
      const apiRes = await getInstructorData(token);
      setCoursesData(apiRes?.success && Array.isArray(apiRes.data) ? apiRes.data : []);
      setStatsData(apiRes?.success ? apiRes.stats || null : null);
      setLoading(false);
    };

    fetchDashboard();
  }, [token]);

  // Only show courses returned for the authenticated instructor.
  const effectiveCourses = coursesData;

  // Stats calculation
  const totalCourses = statsData?.totalCourses ?? effectiveCourses.length;
  const totalStudents =
    statsData?.totalStudents ??
    effectiveCourses.reduce((acc, c) => acc + (c.totalStudentsEnrolled || 0), 0);
  const totalEarnings =
    statsData?.totalEarnings ??
    effectiveCourses.reduce((acc, c) => acc + (c.totalAmountGenerated || 0), 0);
  const averageRating =
    statsData?.averageRating ??
    (effectiveCourses.length > 0
      ? (
          effectiveCourses.reduce((acc, c) => acc + (c.averageRating || 0), 0) /
          effectiveCourses.length
        ).toFixed(1)
      : '0');

  // Deltas matching screenshot
  const courseDelta = statsData?.courseDelta || 'No change this month';
  const studentDelta = statsData?.studentDelta || 'No change this month';
  const earningsDelta = statsData?.earningsDelta || 'No change this month';
  const ratingDelta = 'No change this month';

  // Displayed courses based on Read More / View More state
  const displayedCourses = showAllCourses
    ? effectiveCourses
    : effectiveCourses.slice(0, INITIAL_DISPLAY_COUNT);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" aria-label="Loading instructor dashboard">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 font-['Inter',sans-serif] selection:bg-blue-600 selection:text-white pb-10">
      {/* FOUR STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: TOTAL COURSES */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FiBookOpen size={20} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-none">
                {totalCourses}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Total Courses</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>↑</span> {courseDelta}
            </span>
            <Sparkline stroke="#3BA7F2" />
          </div>
        </div>

        {/* CARD 2: TOTAL STUDENTS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FiUsers size={20} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-none">
                {totalStudents}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Total Students</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>↑</span> {studentDelta}
            </span>
            <Sparkline stroke="#10b981" />
          </div>
        </div>

        {/* CARD 3: TOTAL EARNINGS */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FiCreditCard size={20} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-none">
                ₹{totalEarnings.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Total Earnings</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>↑</span> {earningsDelta}
            </span>
            <Sparkline stroke="#f59e0b" />
          </div>
        </div>

        {/* CARD 4: AVERAGE RATING */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FiStar size={20} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-none">
                {averageRating}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Avg. Rating</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>↑</span> {ratingDelta}
            </span>
            <Sparkline stroke="#3BA7F2" />
          </div>
        </div>

      </div>

      {/* 3. MAIN SECTION: COURSE PERFORMANCE (LEFT) & CREATOR PROGRAM (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: COURSE PERFORMANCE (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          
          {/* Header with Title and + New Course Button */}
          <div className="flex flex-row items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Course Performance
            </h2>
            <button
              onClick={() => navigate('/dashboard/add-course')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <FiPlus size={15} />
              <span>New Course</span>
            </button>
          </div>

          {/* Tabs: COURSES, STUDENTS, EARNINGS, REVIEWS, STATUS */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100 overflow-x-auto pb-0 text-xs select-none">
            {['COURSES', 'STUDENTS', 'EARNINGS', 'REVIEWS', 'STATUS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold uppercase tracking-wider transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: COURSES TAB TABLE */}
          {activeTab === 'COURSES' && (
            <div className="space-y-4">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3.5 pl-2 font-semibold">Course</th>
                      <th className="pb-3.5 text-center font-semibold w-24">Students</th>
                      <th className="pb-3.5 text-right font-semibold w-28">Revenue</th>
                      <th className="pb-3.5 text-right font-semibold w-10 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayedCourses.map((c) => (
                      <tr
                        key={c.id || c._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Course Name & Subtitle with Custom Brand Icon */}
                        <td className="py-3.5 pl-2 pr-4">
                          <div className="flex items-center gap-3">
                            <CourseIcon course={c} />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {c.courseName}
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {c.courseDescription || 'Complete course syllabus and hands-on modules.'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Students Count */}
                        <td className="py-3.5 text-center font-semibold text-slate-700 text-xs sm:text-sm">
                          {c.totalStudentsEnrolled ?? 0}
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 text-right font-bold text-emerald-600 text-xs sm:text-sm">
                          ₹{(c.totalAmountGenerated || 0).toLocaleString()}
                        </td>

                        {/* 3-Dots Action Menu */}
                        <td className="py-3.5 text-right pr-2 relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenu(activeActionMenu === (c.id || c._id) ? null : (c.id || c._id));
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Course Actions"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {/* Floating Actions Dropdown */}
                          {activeActionMenu === (c.id || c._id) && (
                            <div
                              ref={menuRef}
                              className="absolute right-2 top-11 z-30 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                onClick={() => {
                                  setActiveActionMenu(null);
                                  navigate(`/dashboard/edit-course/${c.id || c._id}`);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition cursor-pointer"
                              >
                                <FiEdit3 size={14} className="text-blue-600" />
                                <span>Edit Course</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionMenu(null);
                                  navigate(`/courses/${c.id || c._id}`);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition cursor-pointer"
                              >
                                <FiEye size={14} className="text-slate-500" />
                                <span>View Course Page</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionMenu(null);
                                  setActiveTab('STUDENTS');
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition cursor-pointer"
                              >
                                <FiUsers size={14} className="text-emerald-600" />
                                <span>View Students</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveActionMenu(null);
                                  setActiveTab('EARNINGS');
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition cursor-pointer"
                              >
                                <FiDollarSign size={14} className="text-amber-500" />
                                <span>View Earnings</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* READ MORE / VIEW MORE EXPANSION BAR */}
              {effectiveCourses.length > INITIAL_DISPLAY_COUNT && (
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  
                  {/* Indicator count + progress bar */}
                  <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                    <span>
                      Showing <strong className="text-slate-800 font-bold">{displayedCourses.length}</strong> of{' '}
                      <strong className="text-slate-800 font-bold">{effectiveCourses.length}</strong> courses
                    </span>
                    <div className="w-20 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${(displayedCourses.length / effectiveCourses.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Read More / View More Button */}
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold border border-slate-200/70 hover:border-blue-200 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>
                      {showAllCourses
                        ? 'Show Less'
                        : `Read More Courses (${effectiveCourses.length - INITIAL_DISPLAY_COUNT} remaining)`}
                    </span>
                    {showAllCourses ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENTS TAB */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-3 pt-1">
              {displayedCourses.map((c) => (
                <div
                  key={c.id || c._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CourseIcon course={c} />
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{c.courseName}</p>
                      <p className="text-[11px] text-slate-400">Total Enrolled Learners</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 shrink-0">
                    {c.totalStudentsEnrolled || 0} Enrolled
                  </span>
                </div>
              ))}

              {effectiveCourses.length > INITIAL_DISPLAY_COUNT && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 font-semibold text-xs border border-slate-200/70 transition"
                  >
                    <span>{showAllCourses ? 'Show Less' : `Read More (${effectiveCourses.length - INITIAL_DISPLAY_COUNT} more)`}</span>
                    {showAllCourses ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EARNINGS TAB */}
          {activeTab === 'EARNINGS' && (
            <div className="space-y-3 pt-1">
              {displayedCourses.map((c) => (
                <div
                  key={c.id || c._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CourseIcon course={c} />
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{c.courseName}</p>
                      <p className="text-[11px] text-slate-400">Course Price: ₹{c.price || 3499}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-600 text-sm">
                      ₹{(c.totalAmountGenerated || 0).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">Gross Payout</p>
                  </div>
                </div>
              ))}

              {effectiveCourses.length > INITIAL_DISPLAY_COUNT && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 font-semibold text-xs border border-slate-200/70 transition"
                  >
                    <span>{showAllCourses ? 'Show Less' : `Read More (${effectiveCourses.length - INITIAL_DISPLAY_COUNT} more)`}</span>
                    {showAllCourses ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS TAB */}
          {activeTab === 'REVIEWS' && (
            <div className="space-y-3 pt-1">
              {displayedCourses.map((c) => (
                <div
                  key={c.id || c._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CourseIcon course={c} />
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{c.courseName}</p>
                      <p className="text-[11px] text-slate-400">Student Satisfaction</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200 shrink-0">
                    <FiStar className="fill-purple-500 text-purple-500" size={13} />
                    <span>{c.averageRating > 0 ? c.averageRating : '5.0'}</span>
                  </div>
                </div>
              ))}

              {effectiveCourses.length > INITIAL_DISPLAY_COUNT && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 font-semibold text-xs border border-slate-200/70 transition"
                  >
                    <span>{showAllCourses ? 'Show Less' : `Read More (${effectiveCourses.length - INITIAL_DISPLAY_COUNT} more)`}</span>
                    {showAllCourses ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STATUS TAB */}
          {activeTab === 'STATUS' && (
            <div className="space-y-3 pt-1">
              {displayedCourses.map((c) => (
                <div
                  key={c.id || c._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CourseIcon course={c} />
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{c.courseName}</p>
                      <p className="text-[11px] text-slate-400">Visibility: Public</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                    Published
                  </span>
                </div>
              ))}

              {effectiveCourses.length > INITIAL_DISPLAY_COUNT && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setShowAllCourses(!showAllCourses)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 font-semibold text-xs border border-slate-200/70 transition"
                  >
                    <span>{showAllCourses ? 'Show Less' : `Read More (${effectiveCourses.length - INITIAL_DISPLAY_COUNT} more)`}</span>
                    {showAllCourses ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CREATOR PROGRAM CARD (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-[#2e1d6e] via-[#372082] to-[#1f1647] rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-xl border border-indigo-900/30 flex flex-col justify-between space-y-6">
          
          {/* Top section: Crown Badge, Heading, Description, Checklist, Explore Button */}
          <div className="space-y-5 relative z-10">
            
            {/* Golden Crown Icon */}
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
              <FaCrown size={18} />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Creator Program
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Join our creator program and unlock exclusive benefits, analytics, and get higher payout rates.
              </p>
            </div>

            {/* Feature Checklist matching reference */}
            <div className="space-y-2.5 pt-1">
              {[
                'Higher revenue share',
                'Advanced analytics',
                'Early access to features',
                'Dedicated support'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-xs text-indigo-100 font-medium">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-[10px] text-indigo-200 shrink-0">
                    <FiCheck size={10} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Explore More Button */}
            <button
              onClick={() => navigate('/dashboard/add-course')}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-full shadow-lg transition-all active:scale-95 cursor-pointer mt-2"
            >
              <span>Explore More</span>
              <FiArrowRight size={14} />
            </button>

          </div>

          {/* Bottom 3D Graphic: Ascending Growth Chart with Curved Arrow and Plant Sprout */}
          <div className="relative pt-4 -mx-2 -mb-2 pointer-events-none">
            <svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
              <defs>
                <linearGradient id="growthBar1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#3BA7F2" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="growthBar2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3BA7F2" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="growthBar3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="growthBar4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="100%" stopColor="#3BA7F2" />
                </linearGradient>
                <linearGradient id="growthArrow" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
              </defs>

              {/* Plant Sprout at Base */}
              <g transform="translate(18, 90)">
                <path d="M10 24 C10 14 18 10 24 10 C24 18 18 24 10 24 Z" fill="#4ade80" />
                <path d="M10 24 C10 16 4 12 0 14 C0 22 6 24 10 24 Z" fill="#22c55e" />
                <path d="M10 26 L10 16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* 3D Ascending Growth Bars */}
              {/* Bar 1 */}
              <rect x="55" y="85" width="22" height="35" rx="5" fill="url(#growthBar1)" />
              <path d="M55 89 L63 82 L85 82 L77 89 Z" fill="#a5b4fc" opacity="0.6" />

              {/* Bar 2 */}
              <rect x="85" y="65" width="24" height="55" rx="5" fill="url(#growthBar2)" />
              <path d="M85 69 L95 61 L119 61 L109 69 Z" fill="#93c5fd" opacity="0.7" />

              {/* Bar 3 */}
              <rect x="118" y="44" width="26" height="76" rx="5" fill="url(#growthBar3)" />
              <path d="M118 48 L130 39 L156 39 L144 48 Z" fill="#60a5fa" opacity="0.8" />

              {/* Bar 4 */}
              <rect x="154" y="24" width="28" height="96" rx="5" fill="url(#growthBar4)" />
              <path d="M154 28 L168 18 L196 18 L182 28 Z" fill="#bfdbfe" />

              {/* Dynamic Curved Growth Arrow */}
              <path
                d="M48 95 Q115 78 180 18"
                stroke="url(#growthArrow)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <polygon points="174,10 196,12 185,30" fill="#93c5fd" />
            </svg>
          </div>

          {/* Decorative ambient background glow */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default InstructorDashboard;
