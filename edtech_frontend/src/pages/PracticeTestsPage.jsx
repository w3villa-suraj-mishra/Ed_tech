import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import {
  FiArrowLeft,
  FiClock,
  FiAward,
  FiPlay,
  FiCheckCircle,
  FiSearch,
  FiRotateCcw,
  FiArrowRight,
  FiGrid,
  FiBookOpen,
  FiCode
} from 'react-icons/fi';

const TEST_CATEGORIES = [
  { id: 'All', label: 'All Tests' },
  { id: 'MCQ', label: 'MCQ Practice' },
  { id: 'Coding', label: 'Coding Practice' },
  { id: 'Mock Test', label: 'Mock Tests' },
  { id: 'Interview Test', label: 'Interview Tests' },
  { id: 'Daily Quiz', label: 'Daily Quiz' }
];

export default function PracticeTestsPage({ defaultType }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const initialType = searchParams.get('type') || defaultType || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync category with URL search param
  useEffect(() => {
    const typeParam = searchParams.get('type') || defaultType;
    if (typeParam) {
      setSelectedCategory(typeParam);
    }
  }, [searchParams, defaultType]);

  useEffect(() => {
    fetchTests();
  }, [token]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await apiConnector('GET', `${practiceEndpoints.GET_PRACTICE_TESTS}?status=Published`, null, headers);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTests(res.data.data);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error('Failed to load practice tests:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'All') {
      searchParams.delete('type');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ type: catId });
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (test.testType && test.testType.toLowerCase() === selectedCategory.toLowerCase()) ||
      (test.category?.name && test.category.name.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      (test.title && test.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getActiveCategoryTitle = () => {
    const cat = TEST_CATEGORIES.find(
      (c) => c.id.toLowerCase() === selectedCategory.toLowerCase()
    );
    return cat ? cat.label : selectedCategory;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4FAFF] via-[#F8FAFC] to-[#F0F8FF] text-[#0F172A] font-sans pb-16">
      
      {/* 1. COMPACT SINGLE-LINE HEADER BAR */}
      <div className="bg-white border-b border-blue-100/80 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/practice')}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#3BA7F2] hover:bg-blue-50/60 transition flex items-center gap-1.5 text-xs font-bold"
              title="Return to Practice Center"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
              {getActiveCategoryTitle()}
            </h1>
          </div>

          {/* Center: Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {TEST_CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#3BA7F2] text-white border-[#3BA7F2] shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right: Search & Attempts */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-40 sm:w-48">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#3BA7F2] transition"
              />
            </div>
            <Link
              to="/practice/attempts"
              className="text-xs font-bold text-gray-700 hover:text-[#3BA7F2] px-2.5 py-1 rounded-lg border border-gray-200 bg-white shadow-2xs flex items-center gap-1.5 transition"
            >
              <FiRotateCcw className="text-xs text-[#3BA7F2]" />
              <span className="hidden sm:inline">Attempts</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="w-16 h-4 bg-gray-200 rounded-full" />
                  <div className="w-12 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTests.length > 0 ? (
          /* Tests Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-200/90 hover:border-[#3BA7F2] rounded-2xl p-6 flex flex-col justify-between transition duration-200 shadow-xs hover:shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3BA7F2] border border-blue-100">
                      {test.testType || 'Practice Test'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {test.questions?.length || test.numberOfQuestions || 0} Questions
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#3BA7F2] transition-colors leading-snug">
                    {test.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2">
                    {test.description || 'Comprehensive assessment designed to evaluate and sharpen core engineering skills.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <FiClock className="text-[#3BA7F2]" />
                      <span>{test.duration || 15}m</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FiAward className="text-amber-500" />
                      <span>{test.totalMarks || 100} Marks</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-500" />
                      <span>{test.passingPercentage || 60}% Pass</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/s/courses/global/take/pratice-test/${test.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#3BA7F2] hover:bg-[#13AA92] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs"
                  >
                    <span>Start Test</span>
                    <FiPlay className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             3. EXACT MATCH EMPTY STATE DESIGN (FROM REFERENCE IMAGE)
          ======================================================== */
          <div className="relative max-w-2xl mx-auto my-6">
            
            {/* Left Decorative Dot Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-2.5 absolute -left-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#3BA7F2]" />
              ))}
            </div>

            {/* Left Bottom Books & Potted Plant Illustration */}
            <div className="hidden lg:flex items-end absolute -left-24 bottom-0 pointer-events-none select-none">
              <svg width="86" height="95" viewBox="0 0 100 110" fill="none">
                <rect x="25" y="85" width="70" height="12" rx="3" fill="#F59E0B" />
                <rect x="22" y="73" width="73" height="12" rx="3" fill="#2563EB" />
                <rect x="20" y="61" width="75" height="12" rx="3" fill="#3BA7F2" />
                <path d="M8 80 L12 100 H28 L32 80 Z" fill="#E2E8F0" />
                <path d="M16 80 C12 66 10 50 20 42 C22 55 20 70 16 80 Z" fill="#10B981" />
                <path d="M22 80 C22 62 28 48 35 54 C30 65 26 73 22 80 Z" fill="#059669" />
                <path d="M20 80 C20 58 18 38 23 30 C26 42 25 60 20 80 Z" fill="#34D399" />
              </svg>
            </div>

            {/* Top Right "Keep Learning!" Arrow Doodle */}
            <div className="hidden lg:flex flex-col items-center absolute -top-4 -right-16 pointer-events-none select-none">
              <span className="text-[#3BA7F2] font-black text-xs rotate-12 italic tracking-wide">
                Keep Learning!
              </span>
              <svg className="w-14 h-10 text-[#3BA7F2] mt-0.5" viewBox="0 0 50 35" fill="none" stroke="currentColor">
                <path d="M5 25 C 15 5, 35 5, 45 20" strokeWidth="1.8" strokeDasharray="3 3" />
                <path d="M40 22 L 46 20 L 44 14" strokeWidth="1.8" />
              </svg>
            </div>

            {/* Central White Hero Card */}
            <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-blue-100/80 shadow-[0_12px_40px_rgba(59,167,242,0.08)] p-8 sm:p-12 text-center relative overflow-hidden">
              
              {/* 3D Clipboard & Question Mark Illustration */}
              <div className="relative mb-5 flex justify-center">
                <svg width="140" height="110" viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="select-none">
                  {/* Soft Background Radial Glow */}
                  <circle cx="70" cy="55" r="42" fill="#3BA7F2" fillOpacity="0.1" />
                  
                  {/* Dashed Orbit Trail */}
                  <path d="M28 55 C28 32, 112 32, 116 62" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Sparkles */}
                  <path d="M36 26 L38 31 L43 33 L38 35 L36 40 L34 35 L29 33 L34 31 Z" fill="#FBBF24" />
                  <circle cx="32" cy="46" r="2" fill="#60A5FA" />
                  <circle cx="114" cy="74" r="2" fill="#FBBF24" />
                  <path d="M108 24 L109.5 27 L112.5 28.5 L109.5 30 L108 33 L106.5 30 L103.5 28.5 L106.5 27 Z" fill="#60A5FA" />

                  {/* 3D Blue Clipboard Body */}
                  <rect x="42" y="18" width="56" height="74" rx="14" fill="#2563EB" filter="drop-shadow(0 8px 16px rgba(37,99,235,0.22))" />
                  <rect x="44" y="16" width="52" height="72" rx="12" fill="#3BA7F2" />
                  
                  {/* Clipboard Paper sheet */}
                  <rect x="49" y="26" width="42" height="56" rx="7" fill="#FFFFFF" />

                  {/* Top Clip */}
                  <rect x="58" y="11" width="24" height="11" rx="4.5" fill="#1D4ED8" />
                  <rect x="62" y="14" width="16" height="5" rx="2.5" fill="#93C5FD" />

                  {/* Checklist item 1 */}
                  <rect x="54" y="36" width="7" height="7" rx="2" fill="#10B981" />
                  <path d="M55.5 39.5 L57 41 L60 37.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="65" y="38.5" width="20" height="3" rx="1.5" fill="#CBD5E1" />

                  {/* Checklist item 2 */}
                  <rect x="54" y="48" width="7" height="7" rx="2" fill="#3BA7F2" />
                  <path d="M55.5 51.5 L57 53 L60 49.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="65" y="50.5" width="22" height="3" rx="1.5" fill="#CBD5E1" />

                  {/* Checklist item 3 */}
                  <rect x="54" y="60" width="7" height="7" rx="2" fill="#3BA7F2" />
                  <path d="M55.5 63.5 L57 65 L60 61.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="65" y="62.5" width="16" height="3" rx="1.5" fill="#CBD5E1" />

                  {/* 3D Yellow Question Mark Speech Bubble */}
                  <g filter="drop-shadow(0 6px 12px rgba(245,158,11,0.35))">
                    <circle cx="95" cy="27" r="16" fill="#F59E0B" />
                    <path d="M86 36 L82 42 L90 38 Z" fill="#F59E0B" />
                    <text x="95" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif">?</text>
                  </g>
                </svg>
              </div>

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                No <span className="text-[#3BA7F2]">{getActiveCategoryTitle()}</span> Available Right Now
              </h2>

              {/* Subtitle */}
              <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed font-normal">
                Tests for this category have not been published yet. Please check back later or explore other categories.
              </p>

              {/* Primary Action Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate('/practice')}
                  className="inline-flex items-center justify-center gap-2 bg-[#3BA7F2] hover:bg-[#13AA92] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-[0_8px_20px_rgba(59,167,242,0.32)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Return to Practice Center</span>
                  <FiArrowRight className="text-sm" />
                </button>
              </div>

              {/* "OR" Divider */}
              <div className="flex items-center justify-center gap-3 my-6 max-w-sm mx-auto">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* 3 Bottom Action Pill Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-blue-50/60 text-[#0F172A] hover:text-[#3BA7F2] border border-gray-200 hover:border-[#3BA7F2] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <FiGrid className="text-[#3BA7F2] text-sm" />
                  <span>Explore All Tests</span>
                </button>

                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-blue-50/60 text-[#0F172A] hover:text-[#3BA7F2] border border-gray-200 hover:border-[#3BA7F2] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <FiBookOpen className="text-[#3BA7F2] text-sm" />
                  <span>Browse Categories</span>
                </button>

                <button
                  onClick={() => handleCategoryChange('Coding')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-blue-50/60 text-[#0F172A] hover:text-[#3BA7F2] border border-gray-200 hover:border-[#3BA7F2] px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <FiCode className="text-[#3BA7F2] text-sm" />
                  <span>Try Coding Tests</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
