import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { apiConnector } from '../services/apiConnector';
import { practiceEndpoints } from '../services/apis';
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiRefreshCw,
  FiPlay,
  FiCode,
  FiAlertTriangle,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';

const SUPPORTED_LANGUAGES = [
  { name: 'Python', monaco: 'python', key: 'python' },
  { name: 'JavaScript', monaco: 'javascript', key: 'javascript' },
  { name: 'Java', monaco: 'java', key: 'java' },
  { name: 'C++', monaco: 'cpp', key: 'c++' },
  { name: 'C', monaco: 'c', key: 'c' },
  { name: 'Go', monaco: 'go', key: 'go' }
];

const getMonacoLang = (langStr) => {
  if (!langStr) return 'python';
  const l = langStr.toLowerCase();
  if (l.includes('py')) return 'python';
  if (l.includes('js') || l.includes('script')) return 'javascript';
  if (l.includes('java')) return 'java';
  if (l.includes('c++') || l.includes('cpp')) return 'cpp';
  if (l === 'c') return 'c';
  if (l.includes('go')) return 'go';
  return 'python';
};

const getCodingDetails = (q) => {
  if (!q || !q.codingDetails) return { testCases: [] };
  let cd = q.codingDetails;
  if (typeof cd === 'string') {
    try {
      cd = JSON.parse(cd);
    } catch (e) {
      return { testCases: [] };
    }
  }
  let tcs = cd.testCases;
  if (typeof tcs === 'string') {
    try {
      tcs = JSON.parse(tcs);
    } catch (e) {
      tcs = [];
    }
  }
  if (!Array.isArray(tcs)) {
    tcs = [];
  }
  return {
    ...cd,
    testCases: tcs
  };
};

export default function StudentCourseTestRunner() {
  const { courseId, testId, attemptId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Active Test Answers, Selected Languages & Timer State
  const [answers, setAnswers] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Result & Review State
  const [attemptResult, setAttemptResult] = useState(null);
  const [detailedAttempt, setDetailedAttempt] = useState(null);

  // Code Execution State
  const [codeRunning, setCodeRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'output' | 'errors'
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (courseId && testId && attemptId) {
      loadAttemptDetails(attemptId);
    } else if (courseId && testId) {
      loadCourseTest();
    }
  }, [courseId, testId, attemptId, token]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!test || attemptResult || timeLeftSeconds <= 0 || attemptId) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, attemptResult, timeLeftSeconds, attemptId]);

  const loadCourseTest = async () => {
    setLoading(true);
    setNotEnrolled(false);
    setErrorMessage('');
    try {
      const isCourseSpecific = courseId && courseId !== 'global' && !isNaN(Number(courseId));
      const url = isCourseSpecific
        ? `${practiceEndpoints.GET_COURSE_PRACTICE}/${courseId}?testId=${testId}`
        : `${practiceEndpoints.GET_PRACTICE_TESTS}?id=${testId}`;

      const res = await apiConnector(
        'GET',
        url,
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        const rawData = res.data.data;
        const testsList = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
        if (testsList.length === 0) {
          setErrorMessage('Practice Test not found or not published.');
        } else {
          const currentTest = testsList[0];
          setTest(currentTest);
          setQuestions(currentTest.questions || []);
          setTimeLeftSeconds((currentTest.duration || 15) * 60);

          // Pre-populate default starter code and languages for coding questions
          const initialAnswers = {};
          const initialLangs = {};
          (currentTest.questions || []).forEach(q => {
            if (q.type === 'Coding' && q.codingDetails) {
              initialAnswers[q.id] = q.codingDetails.starterCode || '';
              initialLangs[q.id] = q.codingDetails.language || 'Python';
            }
          });
          setAnswers(initialAnswers);
          setSelectedLanguages(initialLangs);
        }
      }
    } catch (err) {
      console.error('Load practice test error:', err);
      if (err.response?.status === 403 && err.response?.data?.notEnrolled) {
        setNotEnrolled(true);
      } else {
        setErrorMessage(err.response?.data?.message || 'Unauthorized or test access failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttemptDetails = async (targetAttemptId) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const isCourseSpecific = courseId && courseId !== 'global' && !isNaN(Number(courseId));
      const url = isCourseSpecific
        ? `${practiceEndpoints.GET_ATTEMPT_DETAILS}${targetAttemptId}?courseId=${courseId}&testId=${testId}`
        : `${practiceEndpoints.GET_ATTEMPT_DETAILS}${targetAttemptId}`;

      const res = await apiConnector(
        'GET',
        url,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (res.data?.success) {
        const data = res.data.data;
        setDetailedAttempt(data);
        if (data.test) setTest(data.test);
      }
    } catch (err) {
      console.error('Fetch review answers error:', err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setErrorMessage(serverMsg);
      } else if (err.response?.status === 403) {
        setErrorMessage('Access Denied: You do not have permission to view this review.');
      } else {
        setErrorMessage('Unable to load test review.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleRunCode = async (question) => {
    if (codeRunning) return;
    setCodeRunning(true);
    setRunResult(null);
    setActiveConsoleTab('testcases');

    try {
      const currentCode = answers[question.id] !== undefined ? answers[question.id] : (question.codingDetails?.starterCode || '');
      const currentLang = selectedLanguages[question.id] || question.codingDetails?.language || 'python';

      const res = await apiConnector('POST', practiceEndpoints.RUN_CODE_API, {
        questionId: question.id,
        language: currentLang,
        sourceCode: currentCode
      }, { Authorization: `Bearer ${token}` });

      if (res.data) {
        setRunResult(res.data);
      }
    } catch (err) {
      console.error('Run Code API Error:', err);
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 429) {
        setRunResult({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          status: 'RATE_LIMIT_EXCEEDED',
          message: data?.message || 'Too many code executions. Please wait a moment and try again.'
        });
      } else {
        setRunResult({
          success: false,
          code: 'CODE_EXECUTOR_UNAVAILABLE',
          status: 'CODE_EXECUTOR_UNAVAILABLE',
          message: data?.message || 'Code execution is currently unavailable. Please try again later.'
        });
      }
    } finally {
      setCodeRunning(false);
    }
  };

  const handleResetCode = (question) => {
    const defaultCode = question.codingDetails?.starterCode || '';
    setAnswers(prev => ({ ...prev, [question.id]: defaultCode }));
    setShowResetConfirm(false);
    setRunResult(null);
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!test || submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, userVal]) => {
        const qObj = questions.find(q => String(q.id) === String(qId));
        if (qObj && qObj.type === 'Coding') {
          const qLang = selectedLanguages[qId] || qObj.codingDetails?.language || 'python';
          return {
            questionId: Number(qId),
            userCode: String(userVal),
            language: qLang
          };
        }
        return {
          questionId: Number(qId),
          selectedOptionId: Number(userVal)
        };
      });

      const totalDuration = (test.duration || 15) * 60;
      const timeTakenSeconds = Math.max(1, totalDuration - timeLeftSeconds);

      const res = await apiConnector(
        'POST',
        practiceEndpoints.SUBMIT_ATTEMPT,
        {
          testId: test.id,
          courseId: Number(courseId),
          testType: test.testType || 'Course Test',
          answers: formattedAnswers,
          timeTaken: Math.round(timeTakenSeconds / 60)
        },
        { Authorization: `Bearer ${token}` }
      );

      if (res.data?.success) {
        setAttemptResult(res.data.data);
      } else {
        alert(res.data?.message || 'Failed to submit test');
      }
    } catch (err) {
      console.error('Submit test error:', err);
      alert(err.response?.data?.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewClick = () => {
    const targetAttemptId = attemptResult?.id || attemptResult?.attemptId;
    if (targetAttemptId) {
      navigate(`/s/courses/${courseId}/take/pratice-test/${testId}/review/${targetAttemptId}`);
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3 font-['Inter',sans-serif]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Preparing Practice Workspace...</p>
      </div>
    );
  }

  // Security Guard Check
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

  // ================= ANSWER REVIEW ROUTE / VIEW =================
  if (attemptId || detailedAttempt) {
    if (errorMessage) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter',sans-serif]">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900">Review Unavailable</h2>
            <p className="text-xs text-slate-600">{errorMessage}</p>
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition font-bold"
            >
              Back to Course Practice
            </button>
          </div>
        </div>
      );
    }

    const testTitle = test?.title || detailedAttempt?.test?.title || 'Practice Test';

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="p-2 rounded-lg hover:bg-slate-100 text-indigo-700 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <FiArrowLeft size={16} /> Back to Course Practice
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="font-bold text-sm text-slate-900">
              Answer Review — {testTitle}
            </h1>
          </div>
        </header>

        <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
          {/* TOP METRICS STRIP */}
          {detailedAttempt && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Score</span>
                <p className="text-base font-black text-slate-900">{detailedAttempt.score} / {detailedAttempt.totalMarks}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Percentage</span>
                <p className="text-base font-black text-indigo-600">{detailedAttempt.percentage}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 block uppercase">Correct</span>
                <p className="text-base font-bold text-emerald-700">{detailedAttempt.correctCount}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-600 block uppercase">Incorrect</span>
                <p className="text-base font-bold text-red-700">{detailedAttempt.wrongCount}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {detailedAttempt?.answers?.map((ans, idx) => {
              const q = ans.question || {};
              const selectedOpt = ans.selectedOption || {};
              const isCorrect = ans.isCorrect;
              const isUnanswered = !ans.selectedOptionId && !ans.userCode && !ans.userInterviewAnswer;

              return (
                <div
                  key={ans.id || idx}
                  className={`bg-white border rounded-2xl p-6 space-y-4 shadow-sm ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isUnanswered
                      ? 'border-amber-200 bg-amber-50/10'
                      : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-500">Question {idx + 1}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : isUnanswered
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isCorrect ? <FiCheckCircle size={12} /> : isUnanswered ? <FiHelpCircle size={12} /> : <FiXCircle size={12} />}
                      {isCorrect
                        ? `CORRECT (+${ans.marksAwarded || q.marks || 1})`
                        : isUnanswered
                        ? 'NOT ANSWERED'
                        : `INCORRECT (${ans.marksAwarded || 0} / ${q.marks || 1})`}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{q.title}</h3>

                  {q.type === 'Coding' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500">Submitted Language:</span>
                        <span className="px-2.5 py-1 bg-slate-800 text-yellow-400 font-mono font-bold rounded uppercase">
                          {q.codingDetails?.language || 'Python'}
                        </span>
                        <span className="text-slate-400 font-medium">
                          • Marks Awarded: <strong className="text-slate-800">{ans.marksAwarded || 0} / {q.marks || 1}</strong>
                        </span>
                      </div>

                      {ans.userCode ? (
                        <div>
                          <span className="block text-[11px] font-bold text-slate-600 mb-1">Submitted Source Code:</span>
                          <div className="border border-slate-800 rounded-xl overflow-hidden shadow">
                            <Editor
                              height="220px"
                              language={getMonacoLang(q.codingDetails?.language)}
                              value={ans.userCode}
                              theme="vs-dark"
                              options={{
                                readOnly: true,
                                fontSize: 12,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                lineNumbers: 'on'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No code submitted.</p>
                      )}
                    </div>
                  )}

                  {/* OPTIONS REVIEW FOR MCQ */}
                  {q.type !== 'Coding' && q.options && (
                    <div className="space-y-2 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedOpt?.id === opt.id;
                        const isOptCorrect = opt.isCorrect || opt.is_correct;

                        let styleClass = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isOptCorrect) {
                          styleClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isSelected && !isOptCorrect) {
                          styleClass = 'bg-red-100 border-red-500 text-red-900 font-bold';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${styleClass}`}
                          >
                            <span>{opt.optionText}</span>
                            <div className="flex items-center gap-2 text-[10px] font-extrabold">
                              {isSelected && !isOptCorrect && (
                                <span className="text-red-700 bg-red-200/60 px-2 py-0.5 rounded">
                                  Student Answer ❌
                                </span>
                              )}
                              {isSelected && isOptCorrect && (
                                <span className="text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                                  Student Answer ✓
                                </span>
                              )}
                              {!isSelected && isOptCorrect && (
                                <span className="text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                                  Correct Answer ✓
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* EXPLANATION */}
                  {q.explanation && (
                    <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                      <span className="font-bold block text-indigo-700">💡 Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================= TEST COMPLETED SUMMARY PAGE =================
  if (attemptResult) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FiAward size={36} />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Test Completed!</h2>
            <p className="text-xs text-slate-500 font-medium">{test?.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Score</span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {attemptResult.score || 0} / {attemptResult.totalMarks || test?.totalMarks || 10}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Percentage</span>
              <p className="text-xl font-black text-indigo-600 mt-1">
                {attemptResult.percentage ?? Math.round(((attemptResult.score || 0) / (attemptResult.totalMarks || 10)) * 100)}%
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Correct</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">
                {attemptResult.correctAnswers ?? attemptResult.correctCount ?? 0}
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">Incorrect</span>
              <p className="text-lg font-bold text-red-700 mt-0.5">
                {attemptResult.incorrectAnswers ?? attemptResult.wrongCount ?? 0}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReviewClick}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Review Answers
            </button>
            <button
              onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition border border-slate-200"
            >
              Back to Course Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= ACTIVE TEST TAKING PAGE =================
  const currentQuestion = questions[currentQuestionIndex];
  const activeCodingDetails = getCodingDetails(currentQuestion);
  const visibleExampleCases = (activeCodingDetails.testCases || []).filter(tc => !tc.isHidden);
  const currentCode = currentQuestion ? (answers[currentQuestion.id] !== undefined ? answers[currentQuestion.id] : (activeCodingDetails.starterCode || '')) : '';
  const currentLang = currentQuestion ? (selectedLanguages[currentQuestion.id] || activeCodingDetails.language || 'Python') : 'Python';

  return (
    <div className="h-screen bg-slate-50 text-slate-800 font-['Inter',sans-serif] flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-sm select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/s/courses/${courseId}/take/pratice-test`)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition text-xs font-bold flex items-center gap-1"
          >
            <FiArrowLeft size={16} /> Exit
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="font-bold text-sm text-slate-900 line-clamp-1 max-w-sm">
            {test.title}
          </h1>
        </div>

        {/* TIMER */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border shadow-sm ${
              timeLeftSeconds < 180
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <FiClock size={14} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => handleSubmitTest(false)}
            disabled={submitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* TEST RUNNER MAIN AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* QUESTION CONTENT AREA */}
        <main className={`flex-1 p-3 md:p-4 w-full max-w-none flex flex-col min-h-0 ${currentQuestion?.type === 'Coding' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {currentQuestion ? (
            currentQuestion.type === 'Coding' ? (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full min-h-0 w-full overflow-hidden mb-2">
                    {/* LEFT: PROBLEM DETAILS */}
                    <div className="w-full lg:w-5/12 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-y-auto space-y-4 text-xs h-full">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="font-bold text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-indigo-100 text-indigo-700 text-[10px]">Coding ({currentQuestion.marks || 1} Marks)</span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900">{currentQuestion.title}</h2>

                      {activeCodingDetails.problemStatement && (
                        <div>
                          <h4 className="font-bold text-slate-700 mb-1">Problem Statement</h4>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{activeCodingDetails.problemStatement}</p>
                        </div>
                      )}

                      {activeCodingDetails.inputFormat && (
                        <div>
                          <h4 className="font-bold text-slate-700 mb-1">Input Format</h4>
                          <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{activeCodingDetails.inputFormat}</p>
                        </div>
                      )}

                      {activeCodingDetails.outputFormat && (
                        <div>
                          <h4 className="font-bold text-slate-700 mb-1">Output Format</h4>
                          <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{activeCodingDetails.outputFormat}</p>
                        </div>
                      )}

                      {activeCodingDetails.constraints && (
                        <div>
                          <h4 className="font-bold text-slate-700 mb-1">Constraints</h4>
                          <code className="text-slate-700 bg-slate-100 px-2 py-1 rounded">{activeCodingDetails.constraints}</code>
                        </div>
                      )}

                      {visibleExampleCases.length > 0 && (
                        <div>
                          <h4 className="font-bold text-slate-700 mb-2">Visible Example Test Cases</h4>
                          <div className="space-y-2">
                            {visibleExampleCases.map((tc, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 font-mono text-[11px]">
                                <span className="font-bold text-slate-500 block text-[10px]">Sample #{idx + 1}</span>
                                <div><span className="text-slate-400">Input:</span> <span className="text-slate-800 font-bold">{tc.input !== undefined && tc.input !== null && String(tc.input).trim() !== '' ? String(tc.input) : '(none)'}</span></div>
                                <div><span className="text-slate-400">Expected Output:</span> <span className="text-slate-800 font-bold">{tc.output !== undefined && tc.output !== null && String(tc.output).trim() !== '' ? String(tc.output) : (tc.expectedOutput !== undefined && tc.expectedOutput !== null && String(tc.expectedOutput).trim() !== '' ? String(tc.expectedOutput) : '(none)')}</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                {/* RIGHT: REAL MONACO CODE EDITOR & EXECUTION CONSOLE */}
                <div className="w-full lg:w-7/12 flex flex-col h-full min-h-0 overflow-hidden">
                  <div className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 shadow-lg overflow-hidden min-h-0">
                    {/* EDITOR HEADER */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <FiCode className="text-yellow-400" />
                        <span className="text-slate-400 font-bold text-xs">Language:</span>
                        <select
                          value={currentLang}
                          onChange={(e) => setSelectedLanguages(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                          className="bg-slate-800 text-yellow-400 font-mono text-xs px-3 py-1 rounded-lg outline-none cursor-pointer border border-slate-700 font-bold"
                        >
                          {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.key} value={lang.name}>{lang.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <FiRefreshCw size={12} /> Reset Code
                        </button>
                        <button
                          onClick={() => handleRunCode(currentQuestion)}
                          disabled={codeRunning}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs shadow transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {codeRunning ? (
                            <>
                              <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <FiPlay size={12} /> Run Code
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* MONACO CODE EDITOR WORKSPACE */}
                    <div className={`relative rounded-xl overflow-hidden border border-slate-800 transition-all duration-300 ${
                      isConsoleExpanded ? 'h-[160px] shrink-0 min-h-0' : 'flex-1 min-h-[220px]'
                    }`}>
                      <Editor
                        height="100%"
                        language={getMonacoLang(currentLang)}
                        value={currentCode}
                        onChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val || '' }))}
                        theme="vs-dark"
                        options={{
                          fontSize: 13,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          padding: { top: 12 },
                          scrollbar: {
                            vertical: 'hidden',
                            horizontal: 'hidden',
                            handleMouseWheel: true,
                            verticalHasArrows: false,
                            horizontalHasArrows: false,
                            verticalScrollbarSize: 0,
                            horizontalScrollbarSize: 0
                          }
                        }}
                      />
                    </div>

                    {/* EXECUTION CONSOLE & TEST CASES DISPLAY */}
                    <div className={`mt-3 border-t border-slate-800 pt-3 flex flex-col transition-all duration-300 ${
                      isConsoleExpanded ? 'flex-1 h-full min-h-0 overflow-hidden space-y-2' : 'shrink-0 max-h-[200px] space-y-2'
                    }`}>
                      <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <button
                            onClick={() => setActiveConsoleTab('testcases')}
                            className={`px-3 py-1 rounded-lg transition ${activeConsoleTab === 'testcases' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            Test Cases
                          </button>
                          <button
                            onClick={() => setActiveConsoleTab('output')}
                            className={`px-3 py-1 rounded-lg transition ${activeConsoleTab === 'output' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            Output & Logs
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {runResult && runResult.status && (
                            <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                              runResult.allPassed || runResult.status === 'ACCEPTED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {runResult.status}
                            </span>
                          )}

                          <button
                            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition flex items-center gap-1.5 text-xs font-bold border border-slate-700 shadow-sm"
                            title={isConsoleExpanded ? "Restore Editor Workspace" : "Expand Console Logs Upwards"}
                          >
                            {isConsoleExpanded ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
                            <span>{isConsoleExpanded ? "Collapse Logs" : "Expand Logs"}</span>
                          </button>
                        </div>
                      </div>

                      {/* CONSOLE CONTENT */}
                      {!runResult && !codeRunning && (
                        <p className="text-[11px] text-slate-500 italic p-2">Click "Run Code" to execute solution against visible test cases.</p>
                      )}

                      {codeRunning && (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                          Executing code securely in sandboxed runtime...
                        </div>
                      )}

                      {runResult && (
                        <div className={`p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3 font-mono text-[11px] overflow-y-auto ${
                          isConsoleExpanded ? 'flex-1 h-full max-h-none' : 'max-h-[150px]'
                        }`}>
                          {/* RATE LIMIT EXCEEDED ERROR */}
                          {runResult.code === 'RATE_LIMIT_EXCEEDED' && (
                            <div className="p-3 bg-amber-950/80 border border-amber-800 rounded-xl text-amber-300 flex items-center gap-2">
                              <FiAlertTriangle size={18} className="shrink-0 text-amber-400" />
                              <div className="space-y-0.5">
                                <span className="font-bold block text-xs">Rate Limit Exceeded</span>
                                <p className="text-[11px]">{runResult.message || 'Too many code executions. Please wait a moment and try again.'}</p>
                              </div>
                            </div>
                          )}

                          {/* EXECUTOR UNAVAILABLE ERROR */}
                          {runResult.code === 'CODE_EXECUTOR_UNAVAILABLE' && (
                            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 flex items-center gap-2">
                              <FiXCircle size={18} className="shrink-0 text-red-400" />
                              <div className="space-y-0.5">
                                <span className="font-bold block text-xs">Executor Unavailable</span>
                                <p className="text-[11px]">{runResult.message || 'Code execution is temporarily unavailable. Please try again later.'}</p>
                              </div>
                            </div>
                          )}

                          {/* DEDICATED COMPILATION ERROR PANEL */}
                          {runResult.success && runResult.status === 'COMPILATION_ERROR' && (
                            <div className="p-3 bg-amber-950/90 border border-amber-800 rounded-xl text-amber-200 space-y-2">
                              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 border-b border-amber-800/80 pb-1.5">
                                <FiAlertTriangle size={16} /> Compilation Error
                              </div>
                              <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-amber-100 bg-amber-950/50 p-2.5 rounded-lg border border-amber-900 overflow-x-auto">
                                {runResult.compileOutput || runResult.stderr || 'Syntax or Compilation Error occurred.'}
                              </pre>
                            </div>
                          )}

                          {/* DEDICATED RUNTIME ERROR PANEL */}
                          {runResult.success && runResult.status === 'RUNTIME_ERROR' && (
                            <div className="p-3 bg-red-950/90 border border-red-800 rounded-xl text-red-200 space-y-2">
                              <div className="flex items-center gap-2 font-bold text-xs text-red-400 border-b border-red-800/80 pb-1.5">
                                <FiXCircle size={16} /> Runtime Error
                              </div>
                              <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-red-100 bg-red-950/50 p-2.5 rounded-lg border border-red-900 overflow-x-auto">
                                {runResult.stderr || 'Runtime Exception Occurred'}
                              </pre>
                            </div>
                          )}

                          {/* DEDICATED TIME LIMIT EXCEEDED PANEL */}
                          {runResult.success && runResult.status === 'TIME_LIMIT_EXCEEDED' && (
                            <div className="p-3 bg-amber-950/90 border border-amber-800 rounded-xl text-amber-200 space-y-2">
                              <div className="flex items-center gap-2 font-bold text-xs text-amber-400 border-b border-amber-800/80 pb-1.5">
                                <FiClock size={16} /> Time Limit Exceeded
                              </div>
                              <p className="text-[11px] text-amber-200">
                                Your program exceeded the maximum execution time limit. Please optimize any loops or recursion.
                              </p>
                            </div>
                          )}

                          {/* NORMAL TEST CASES RESULTS */}
                          {runResult.success && activeConsoleTab === 'testcases' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                                <span>Summary: <strong className={runResult.allPassed ? 'text-emerald-400' : 'text-amber-400'}>{runResult.passedTests} / {runResult.totalTests} Passed</strong></span>
                                {runResult.executionTime > 0 && <span>Time: {runResult.executionTime}s</span>}
                              </div>
                              {runResult.testResults?.map((tc, idx) => (
                                <div key={idx} className={`p-3 rounded-xl border space-y-1.5 ${tc.passed ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-red-950/30 border-red-800/60'}`}>
                                  <div className="flex items-center justify-between font-bold">
                                    <span className={tc.passed ? 'text-emerald-400' : 'text-red-400'}>
                                      {tc.passed ? '✓' : '✗'} Test Case #{tc.testCaseIndex}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{tc.status === 'NO_OUTPUT' ? 'NO OUTPUT' : tc.status} • {tc.executionTime ? `${tc.executionTime}s` : '0.01s'}</span>
                                  </div>
                                  <div className="text-slate-300 flex items-start gap-2 text-[11px]">
                                    <span className="text-slate-400 font-semibold shrink-0 pt-0.5">Input:</span>
                                    <code className="text-emerald-300 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800 break-all whitespace-pre-wrap flex-1">
                                      {tc.input !== undefined && tc.input !== null && String(tc.input).trim() !== '' ? String(tc.input) : '(none)'}
                                    </code>
                                  </div>
                                  <div className="text-slate-300 flex items-start gap-2 text-[11px]">
                                    <span className="text-slate-400 font-semibold shrink-0 pt-0.5">Expected Output:</span>
                                    <code className="text-emerald-300 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800 break-all whitespace-pre-wrap flex-1">
                                      {tc.expectedOutput !== undefined && tc.expectedOutput !== null && String(tc.expectedOutput).trim() !== ''
                                        ? String(tc.expectedOutput)
                                        : (tc.output !== undefined && tc.output !== null && String(tc.output).trim() !== '' ? String(tc.output) : '(none)')}
                                    </code>
                                  </div>
                                  <div className="text-slate-300 flex items-start gap-2 text-[11px]">
                                    <span className="text-slate-400 font-semibold shrink-0 pt-0.5">Actual Output:</span>
                                    <code className={`font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800 break-all whitespace-pre-wrap flex-1 ${
                                      (tc.actualOutput !== undefined && tc.actualOutput !== null && String(tc.actualOutput).trim() !== '') || (tc.stdout !== undefined && tc.stdout !== null && String(tc.stdout).trim() !== '')
                                        ? (tc.passed ? 'text-emerald-300' : 'text-red-300')
                                        : 'text-amber-400/90 italic'
                                    }`}>
                                      {tc.actualOutput !== undefined && tc.actualOutput !== null && String(tc.actualOutput).trim() !== ''
                                        ? String(tc.actualOutput)
                                        : (tc.stdout !== undefined && tc.stdout !== null && String(tc.stdout).trim() !== '' ? String(tc.stdout) : '(no output)')}
                                    </code>
                                  </div>

                                  {tc.stderr && (
                                    <div className="mt-2 p-2.5 bg-red-950/80 border border-red-800/80 rounded-lg text-red-200 font-mono text-[11px]">
                                      <span className="font-bold text-red-400 block mb-1">Runtime Exception / Traceback:</span>
                                      <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] text-red-100">{tc.stderr}</pre>
                                    </div>
                                  )}

                                  {tc.compileOutput && (
                                    <div className="mt-2 p-2.5 bg-amber-950/80 border border-amber-800/80 rounded-lg text-amber-200 font-mono text-[11px]">
                                      <span className="font-bold text-amber-400 block mb-1">Compilation Output:</span>
                                      <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] text-amber-100">{tc.compileOutput}</pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* RAW STDOUT / STDERR OUTPUT */}
                          {runResult.success && activeConsoleTab === 'output' && (
                            <div className="space-y-3">
                              {runResult.testResults?.map((tc, idx) => (
                                <div key={idx} className="space-y-1.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                                  <span className="text-slate-400 font-bold text-[10px]">Test Case #{tc.testCaseIndex} Logs:</span>
                                  <div>
                                    <span className="text-slate-500 text-[10px] block">stdout:</span>
                                    <pre className="bg-[#0D1117] p-2 rounded text-emerald-400 text-[10px] overflow-x-auto whitespace-pre-wrap">
                                      {tc.stdout || tc.actualOutput || '(no stdout)'}
                                    </pre>
                                  </div>
                                  {tc.stderr && (
                                    <div>
                                      <span className="text-red-400 text-[10px] block">stderr:</span>
                                      <pre className="bg-red-950/40 p-2 rounded text-red-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                                        {tc.stderr}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RESET CONFIRMATION MODAL */}
                {showResetConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
                      <h3 className="font-bold text-base text-slate-900">Reset Code to Starter Template?</h3>
                      <p className="text-xs text-slate-500">Your currently typed code for this question will be lost.</p>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResetCode(currentQuestion)}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                        >
                          Reset Code
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MCQ QUESTION CONTAINER */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="font-bold text-xs text-slate-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-700 text-xs">
                    {currentQuestion.type || 'MCQ'} ({currentQuestion.marks || 1} Mark)
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.title}
                </h2>

                <div className="space-y-3 pt-2">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                        className={`w-full p-4 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.optionText}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">No question selected.</div>
          )}

          {/* PREVIOUS / NEXT NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-1"
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            <span className="text-xs font-bold text-slate-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>

            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 flex items-center gap-1 shadow-sm"
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* RIGHT SIDEBAR QUESTION NAVIGATION PALETTE */}
        <aside className="w-64 bg-white border-l border-slate-200 p-5 shrink-0 hidden lg:flex flex-col justify-between select-none">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
              Question Navigator
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isCurrent) {
                  btnClass = 'bg-indigo-600 text-white font-black shadow';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Current Question
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-100 inline-block" /> Unanswered
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
