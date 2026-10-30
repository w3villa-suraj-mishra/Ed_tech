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
      
      {/* Simple Heading */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-6">
        Practice Center
      </h1>

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
