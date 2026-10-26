import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaRedo } from 'react-icons/fa';

export default function DailyQuiz() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionId }
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchQuiz();
    }
  }, [token]);

  // Timer Countdown
  useEffect(() => {
    if (loading || result || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, result, timeLeft]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_DAILY_QUIZ, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        const qData = res.data.data;
        setQuiz(qData);
        setQuestions(qData.questions || []);
        setTimeLeft((qData.duration || 10) * 60);
      }
    } catch (err) {
      toast.error('Failed to load Daily Quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || null
      }));

      const totalTimeSpent = (quiz?.duration || 10) * 60 - timeLeft;

      const res = await apiConnector('POST', practiceEndpoints.SUBMIT_ATTEMPT, {
        testId: quiz?.id || null,
        testType: 'Daily Quiz',
        answers: answersPayload,
        timeTaken: totalTimeSpent > 0 ? totalTimeSpent : 10
      }, { Authorization: `Bearer ${token}` });

      if (res.data?.success) {
        setResult(res.data.data);
        toast.success('Daily Quiz submitted!');
      }
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-richblack-900 text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3BA7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // RESULT VIEW
  if (result) {
    return (
      <div className="min-h-screen bg-richblack-900 text-white py-12 px-4 font-sans">
        <div className="max-w-2xl mx-auto bg-[#111422] border border-blue-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(37, 99, 235,0.15)] text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[#3BA7F2] text-3xl mx-auto">
            🏆
          </div>

          <div>
            <h1 className="text-3xl font-extrabold">Quiz Completed!</h1>
            <p className="text-xs text-richblack-300 mt-1">Here is your dynamic performance summary</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-richblack-300 block">Score</span>
              <span className="text-xl font-black text-[#FFD60A]">{result.score} / {result.totalMarks}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-richblack-300 block">Accuracy</span>
              <span className="text-xl font-black text-emerald-400">{result.accuracy}%</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-richblack-300 block">Correct</span>
              <span className="text-xl font-black text-emerald-400">{result.correctCount}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <span className="text-xs text-richblack-300 block">Wrong</span>
              <span className="text-xl font-black text-red-400">{result.wrongCount}</span>
            </div>
          </div>

          {result.analytics && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-left space-y-2">
              <h3 className="text-sm font-bold text-white mb-2">Analytics Breakdown</h3>
              <p className="text-xs text-richblack-300">
                <strong className="text-emerald-400">Strong Topics:</strong> {result.analytics.strongTopics?.join(', ') || 'General Knowledge'}
              </p>
              <p className="text-xs text-richblack-300">
                <strong className="text-amber-400">Recommended Practice:</strong> {result.analytics.recommendedPractice?.join(', ') || 'Topic Practice'}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/practice')}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-all"
            >
              Back to Practice Center
            </button>
            <button
              onClick={() => { setResult(null); setCurrentIndex(0); setSelectedAnswers({}); fetchQuiz(); }}
              className="flex-1 py-3 bg-[#3BA7F2] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <FaRedo /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-richblack-900 text-white font-sans py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-[#111422] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{quiz?.title || 'Daily Quiz'}</h1>
            <p className="text-xs text-richblack-300">Question {currentIndex + 1} of {questions.length}</p>
          </div>

          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-xl text-[#3BA7F2] text-xs font-mono font-bold">
            <FaClock />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQ ? (
          <div className="bg-[#111422] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentIndex + 1}. {currentQ.title}
            </h2>

            <div className="space-y-3">
              {(currentQ.options || []).map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#3BA7F2]/20 border-[#3BA7F2] text-white font-semibold shadow-[0_0_15px_rgba(37, 99, 235,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-richblack-200'
                    }`}
                  >
                    <span className="text-sm">{opt.optionText}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#3BA7F2] bg-[#3BA7F2]' : 'border-white/30'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-6 py-2.5 bg-[#3BA7F2] hover:bg-[#1d4ed8] text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <span>Next</span> <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#FFD60A] text-black font-extrabold text-xs rounded-xl shadow-lg hover:bg-[#e5c009] transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#111422] border border-white/10 rounded-2xl p-10 sm:p-14 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center text-2xl mx-auto">
              ⚡
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">No Daily Quiz Questions Available Right Now</h3>
              <p className="text-xs sm:text-sm text-richblack-300 max-w-md mx-auto">
                Today's quiz challenges are being refreshed. You can continue sharpening your skills with our Topic Practice or full-length Practice Tests!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/practice/topic')}
                className="px-5 py-2.5 bg-[#3BA7F2] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition shadow-md"
              >
                Start Topic Practice
              </button>
              <button
                onClick={() => navigate('/practice')}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition"
              >
                Back to Practice Center
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
