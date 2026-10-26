import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { practiceEndpoints, courseEndpoints } from '../services/apis';
import {
  FiArrowLeft,
  FiClock,
  FiAward,
  FiPlay,
  FiCheckCircle,
  FiHelpCircle,
  FiBarChart2,
  FiBookOpen,
  FiLock,
  FiRefreshCw
} from 'react-icons/fi';

const CATEGORIES = [
  'All',
  'MCQ',
  'Coding',
  'Topic Practice',
  'Mock Test',
  'Interview Test',
  'Daily Quiz'
];

export default function StudentCoursePracticePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (courseId) {
      loadCourseDataAndTests();
    }
  }, [courseId, token]);

  const loadCourseDataAndTests = async () => {
    setLoading(true);
    setNotEnrolled(false);
    setErrorMessage('');
    try {
      // 1. Fetch Course Header Details
      const courseRes = await apiConnector(
        'GET',
        `${courseEndpoints.COURSE_DETAILS_API}?courseId=${courseId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (courseRes.data?.success) {
        setCourse(courseRes.data.data);
      }

      // 2. Fetch Course Practice Tests (Backend checks enrollment & scope)
      const testsRes = await apiConnector(
        'GET',
        `${practiceEndpoints.GET_COURSE_PRACTICE}/${courseId}`,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (testsRes.data?.success) {
        setTests(testsRes.data.data || []);
      }
    } catch (err) {
      console.error('Fetch course practice tests error:', err);
      if (err.response?.status === 403 && err.response?.data?.notEnrolled) {
        setNotEnrolled(true);
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to load course practice tests.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    if (selectedCategory === 'All') return true;
    return (
      (test.testType && test.testType.toLowerCase() === selectedCategory.toLowerCase()) ||
      (test.category && test.category.toLowerCase() === selectedCategory.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3 font-['Inter',sans-serif]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Course Practice Tests...</p>
      </div>
    );
  }

  // Enrollment Security Guard Error View
  if (notEnrolled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <FiLock size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Practice & Tests are available only to students enrolled in this course.
            </p>
          </div>

          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            View Course & Enroll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex flex-col">
      {/* TOP HEADER - MATCHES COURSE PLAYER THEME */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/s/courses/${courseId}/take`)}
            className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition flex items-center gap-1.5 text-xs font-bold"
            title="Back to Course Player"
          >
            <FiArrowLeft size={18} />
            <span>Back to Course</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <h1 className="font-bold text-base text-slate-900 line-clamp-1 max-w-md">
            {course?.courseName || 'Course Practice & Tests'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-800 font-extrabold text-xs rounded-full border border-blue-200">
            🎯 Course Tests
          </span>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* BANNER CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-400/30 inline-block">
              Course Specific Assessment
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {course?.courseName || 'Python Programming Mastery'} — Practice & Quizzes
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
              Test your understanding of lessons and topics in this course. Attempt practice tests created specifically by your course instructor to boost your retention and exam readiness.
            </p>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ERROR STATE */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* TESTS LIST GRID */}
        {filteredTests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              📝
            </div>
            <h3 className="text-base font-bold text-slate-800">No Practice Tests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tests published for category "<span className="font-semibold">{selectedCategory}</span>" in this course yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTests.map((test) => {
              const hasAttempted = (test.attemptsCount || 0) > 0;

              return (
                <div
                  key={test.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                        {test.testType || 'Course Test'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <FiHelpCircle size={14} className="text-indigo-500" />
                        {test.questionCount || 0} Questions
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {test.description || 'Test your knowledge on key topics from this course.'}
                      </p>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block">Duration</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                          <FiClock size={12} className="text-indigo-500" />
                          {test.duration}m
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block">Marks</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                          <FiAward size={12} className="text-amber-500" />
                          {test.totalMarks} pts
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block">Best Score</span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                          {test.bestScorePercentage !== null ? `${test.bestScorePercentage}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 font-medium">
                      <span>Attempts: <strong className="text-slate-800 font-bold">{test.attemptsCount || 0}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test/${test.id}`)}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                          hasAttempted
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                        }`}
                      >
                        {hasAttempted ? (
                          <>
                            <FiRefreshCw size={14} /> Retake Test
                          </>
                        ) : (
                          <>
                            <FiPlay size={14} /> Start Test →
                          </>
                        )}
                      </button>

                      {hasAttempted && test.latestAttemptId && (
                        <button
                          onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test/${test.id}/review/${test.latestAttemptId}`)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                          title="Review your latest completed attempt"
                        >
                          <FiBarChart2 size={14} /> Review Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
