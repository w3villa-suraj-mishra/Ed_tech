import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import {
  FiClipboard,
  FiMonitor,
  FiZap,
  FiUser,
  FiAward,
  FiUsers,
  FiRotateCcw,
  FiArrowRight
} from 'react-icons/fi';

export default function PracticeCenter() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication Guard: Redirect unauthenticated users immediately to /login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchOverviewData();
    }
  }, [token]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_PRACTICE_OVERVIEW, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error("Error loading practice overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      id: 'mcq-tests',
      title: 'MCQ Practice',
      count: 'Multiple Choice Quizzes',
      desc: 'Test your knowledge across foundational and advanced concepts.',
      icon: <FiClipboard className="text-[#0284C7] text-lg" />,
      iconBg: 'bg-[#E0F2FE]',
      tag: 'QUIZ',
      tagColor: 'bg-[#E0F2FE] text-[#0284C7]',
      link: '/practice/tests?type=MCQ'
    },
    {
      id: 'coding-problems',
      title: 'Coding Practice',
      count: `${overview?.codingCount ?? 0} Challenges`,
      desc: 'Solve interactive algorithmic & web development programming problems.',
      icon: <FiMonitor className="text-[#9333EA] text-lg" />,
      iconBg: 'bg-[#13AA92]/10',
      tag: 'HANDS-ON',
      tagColor: 'bg-[#13AA92]/10 text-[#13AA92]',
      link: '/practice/coding'
    },
    {
      id: 'daily-quiz',
      title: 'Daily Quiz',
      count: `${overview?.dailyQuizCount ?? 0} Active Quizzes`,
      desc: 'Quick 5-minute daily challenges to keep your coding skills sharp.',
      icon: <FiZap className="text-[#D97706] text-lg" />,
      iconBg: 'bg-[#FEF3C7]',
      tag: 'FREE DAILY',
      tagColor: 'bg-[#FEF3C7] text-[#D97706]',
      link: '/practice/daily-quiz'
    },
    {
      id: 'topic-practice',
      title: 'Topic Practice',
      count: `${overview?.topicPracticeCount ?? 0} Topics Available`,
      desc: 'Filter questions by category, topic, and difficulty to master specific concepts.',
      icon: <FiUser className="text-[#16A34A] text-lg" />,
      iconBg: 'bg-[#DCFCE7]',
      tag: 'CONCEPT-WISE',
      tagColor: 'bg-[#DCFCE7] text-[#16A34A]',
      link: '/practice/topic'
    },
    {
      id: 'mock-tests',
      title: 'Mock Tests',
      count: `${overview?.mockTestCount ?? 0} Full Mocks`,
      desc: 'Full-length timed exams simulating real interview assessments.',
      icon: <FiAward className="text-[#DC2626] text-lg" />,
      iconBg: 'bg-[#FEE2E2]',
      tag: 'TIMED EXAMS',
      tagColor: 'bg-[#FEE2E2] text-[#DC2626]',
      link: '/practice/tests?type=Mock Test'
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      count: `${overview?.interviewCount ?? 0} Questions`,
      desc: 'Top tech company interview questions with detailed solution breakdowns.',
      icon: <FiUsers className="text-[#13AA92] text-lg" />,
      iconBg: 'bg-[#13AA92]/10',
      tag: 'CAREER READY',
      tagColor: 'bg-[#13AA92]/10 text-[#13AA92]',
      link: '/practice/interview'
    },
  ];

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10 font-sans">
      
      {/* 1. HERO BANNER CARD */}
      <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Subtle decorative background gradient on right */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none bg-gradient-to-l from-indigo-50/60 via-blue-50/20 to-transparent rounded-r-3xl" />

        {/* Left Content */}
        <div className="relative z-10 max-w-xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13AA92]/10 text-[#3BA7F2] border border-[#13AA92]/30 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
            <span>🚀 100% FREE FOR ALL LOGGED-IN LEARNERS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            CodeLearn <span className="text-[#3BA7F2]">Practice Center</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
            Sharpen your coding skills with daily quizzes, topic tests, full-length mock exams, and real tech interview questions. Unlimited attempts with instant dynamic score analytics.
          </p>
        </div>

        {/* Right Illustration: 3D Laptop, Floating Analytics Card, Checklist, and Potted Plant */}
        <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center">
          <svg width="270" height="175" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[270px] h-auto select-none">
            {/* Sparkles top right */}
            <line x1="238" y1="18" x2="244" y2="13" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="247" y1="26" x2="254" y2="26" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="242" y1="34" x2="248" y2="39" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Floating Chart Card (Left) */}
            <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.06))">
              <rect x="12" y="60" width="46" height="38" rx="8" fill="#FFFFFF" />
              <rect x="12" y="60" width="46" height="38" rx="8" stroke="#E2E8F0" strokeWidth="1" />
              <path d="M20 83L27 75L33 80L42 69" stroke="#3BA7F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="21" y="86" width="3.5" height="6" rx="1" fill="#93C5FD" />
              <rect x="27.5" y="81" width="3.5" height="11" rx="1" fill="#60A5FA" />
              <rect x="34" y="77" width="3.5" height="15" rx="1" fill="#3BA7F2" />
            </g>

            {/* 3D Laptop Body */}
            {/* Screen Bezel */}
            <rect x="68" y="28" width="130" height="92" rx="10" fill="#3BA7F2" />
            {/* Screen Interior */}
            <rect x="73" y="33" width="120" height="82" rx="6" fill="#1E293B" />
            {/* Code Brackets on Screen */}
            <text x="133" y="80" textAnchor="middle" fill="#60A5FA" fontSize="26" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</text>
            
            {/* Laptop Base */}
            <path d="M50 120L68 120L198 120L216 120C222 120 226 124 224 129L220 136C218 139 214 141 210 141H56C52 141 48 139 46 136L42 129C40 124 44 120 50 120Z" fill="#1D4ED8" />
            {/* Trackpad */}
            <rect x="115" y="128" width="38" height="5" rx="2" fill="#3BA7F2" />

            {/* Floating Checklist Card (Overlapping Laptop Screen Right) */}
            <g filter="drop-shadow(0 6px 16px rgba(0,0,0,0.08))">
              <rect x="162" y="26" width="64" height="86" rx="8" fill="#FFFFFF" />
              <rect x="162" y="26" width="64" height="86" rx="8" stroke="#E2E8F0" strokeWidth="1" />
              
              {/* Checklist Row 1 */}
              <rect x="170" y="38" width="11" height="11" rx="2.5" fill="#10B981" />
              <path d="M172.5 43.5L175 46L179 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="185" y="42" width="32" height="4" rx="2" fill="#E2E8F0" />

              {/* Checklist Row 2 */}
              <rect x="170" y="55" width="11" height="11" rx="2.5" fill="#10B981" />
              <path d="M172.5 60.5L175 63L179 58" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="185" y="59" width="26" height="4" rx="2" fill="#E2E8F0" />

              {/* Checklist Row 3 */}
              <rect x="170" y="72" width="11" height="11" rx="2.5" fill="#10B981" />
              <path d="M172.5 77.5L175 80L179 75" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="185" y="76" width="30" height="4" rx="2" fill="#E2E8F0" />

              {/* Checklist Row 4 */}
              <rect x="170" y="89" width="11" height="11" rx="2.5" fill="#E2E8F0" />
              <rect x="185" y="93" width="22" height="4" rx="2" fill="#E2E8F0" />
            </g>

            {/* Potted Plant (Far Right) */}
            {/* White Planter Pot */}
            <path d="M232 116L234 140H248L250 116H232Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Green Foliage */}
            <path d="M241 116C241 108 245 102 247 100C247 104 245 112 241 116Z" fill="#10B981" />
            <path d="M241 116C239 106 235 102 232 102C234 106 237 112 241 116Z" fill="#059669" />
            <path d="M241 116C241 100 240 92 241 86C243 92 244 102 241 116Z" fill="#34D399" />
            <path d="M241 116C245 110 250 108 252 108C250 112 246 114 241 116Z" fill="#10B981" />
          </svg>
        </div>

      </div>

      {/* 2. 6 FEATURE PRACTICE CARDS GRID (3 columns x 2 rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className="group bg-white border border-gray-200/80 hover:border-indigo-200 rounded-2xl p-6 transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Card Header: Icon & Badge */}
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  {card.icon}
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider ${card.tagColor}`}>
                  {card.tag}
                </span>
              </div>

              {/* Title & Subtitle/Count */}
              <h2 className="text-base font-extrabold text-[#0F172A] group-hover:text-[#3BA7F2] transition-colors leading-snug">
                {card.title}
              </h2>
              <p className="text-xs text-[#3BA7F2] font-bold mt-0.5 mb-2">
                {loading ? (
                  <span className="w-16 h-3 bg-indigo-50 rounded animate-pulse inline-block"></span>
                ) : (
                  card.count
                )}
              </p>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed font-normal mb-5">
                {card.desc}
              </p>
            </div>

            {/* Bottom Link CTA */}
            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#3BA7F2]">
              <span>Start Practicing</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. PREVIOUS ATTEMPTS & DETAILED ANALYTICS BOTTOM BANNER */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Soft background blue wave on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none bg-gradient-to-l from-indigo-50/70 via-blue-50/30 to-transparent rounded-r-2xl" />
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />

        {/* Left Icon & Text */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-[#13AA92]/10 text-[#3BA7F2] flex items-center justify-center text-lg shrink-0">
            <FiRotateCcw />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
              Your Previous Attempts & Detailed Analytics
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              Review scores, time taken, accuracy percentage, and strong/weak topic breakdowns.
            </p>
          </div>
        </div>

        {/* Right Action Button */}
        <button
          onClick={() => navigate('/practice/attempts')}
          className="px-5 py-2.5 rounded-xl bg-[#3BA7F2] hover:bg-[#3BA7F2] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 text-center shrink-0 flex items-center justify-center gap-2 relative z-10 cursor-pointer"
        >
          <span>View Attempts History ({overview?.userAttemptsCount || 0})</span>
          <FiArrowRight className="text-sm" />
        </button>
      </div>

    </div>
  );
}
