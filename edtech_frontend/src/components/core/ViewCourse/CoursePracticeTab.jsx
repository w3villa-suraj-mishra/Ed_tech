import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../../../services/apiConnector';
import { practiceEndpoints } from '../../../services/apis';
import { FaClock, FaCheckCircle, FaAward, FaPlay } from 'react-icons/fa';

export default function CoursePracticeTab() {
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);

  useEffect(() => {
    if (courseId && token) {
      fetchCourseTests();
    }
  }, [courseId, token]);

  const fetchCourseTests = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', `${practiceEndpoints.GET_COURSE_PRACTICE}/${courseId}`, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data?.success) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.error('Fetch course practice tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test) => {
    setSelectedTest(test);
    setAnswers({});
    setAttemptResult(null);
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmitTest = async () => {
    if (!selectedTest) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: optId
      }));

      const res = await apiConnector('POST', practiceEndpoints.SUBMIT_ATTEMPT, {
        testId: selectedTest.id,
        timeTakenSeconds: 300,
        answers: formattedAnswers
      }, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        setAttemptResult(res.data.data);
      }
    } catch (err) {
      console.error('Submit course test error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#FFD60A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Active Test View
  if (selectedTest && !attemptResult) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 text-white">
        <div className="flex justify-between items-center border-b border-richblack-700 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{selectedTest.title}</h2>
            <p className="text-xs text-richblack-400 mt-1">{selectedTest.description || 'Course Practice Test'}</p>
          </div>
          <button
            onClick={() => setSelectedTest(null)}
            className="px-3 py-1.5 bg-richblack-700 text-xs rounded-lg hover:bg-richblack-600 transition"
          >
            ← Exit Test
          </button>
        </div>

        <div className="space-y-6">
          {selectedTest.questions?.map((q, idx) => (
            <div key={q.id} className="bg-richblack-800 border border-richblack-700 p-5 rounded-2xl space-y-3">
              <p className="font-semibold text-sm">
                <span className="text-[#FFD60A] mr-2">Q{idx + 1}.</span> {q.title}
              </p>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {q.options?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(q.id, opt.id)}
                    className={`p-3 rounded-xl text-left text-xs font-medium border transition-all ${
                      answers[q.id] === opt.id
                        ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                        : 'bg-richblack-900 border-richblack-700 text-richblack-300 hover:bg-richblack-700'
                    }`}
                  >
                    {opt.optionText}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmitTest}
            disabled={submitting}
            className="px-6 py-2.5 bg-[#FFD60A] text-black font-bold text-sm rounded-xl shadow-lg hover:bg-yellow-400 transition"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    );
  }

  // Result View
  if (attemptResult) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-6 bg-richblack-800 border border-richblack-700 rounded-3xl mt-10 text-white">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl font-bold">Test Submitted!</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-richblack-900 rounded-xl border border-richblack-700">
            <p className="text-richblack-400">Score</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{attemptResult.score} / {attemptResult.totalMarks}</p>
          </div>
          <div className="p-4 bg-richblack-900 rounded-xl border border-richblack-700">
            <p className="text-richblack-400">Status</p>
            <p className={`text-xl font-bold mt-1 ${attemptResult.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
              {attemptResult.isPassed ? 'PASSED 🎯' : 'FAILED ❌'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setSelectedTest(null); setAttemptResult(null); fetchCourseTests(); }}
          className="w-full py-2.5 bg-[#FFD60A] text-black font-bold text-xs rounded-xl"
        >
          Back to Course Practice Tests
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-white font-sans">
      <div className="border-b border-richblack-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Course Practice & Tests 🎯
        </h2>
        <p className="text-xs text-richblack-400 mt-1">
          Exclusive tests and quizzes created specifically for this course by your instructor.
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="p-12 text-center bg-richblack-800 border border-richblack-700 rounded-2xl space-y-3">
          <div className="text-4xl">📝</div>
          <h3 className="text-base font-bold text-white">No Course Practice Tests Yet</h3>
          <p className="text-xs text-richblack-400">Your instructor has not published any tests for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 hover:border-blue-500/50 transition-all space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {test.testType}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{test.title}</h3>
                </div>
              </div>
              <p className="text-xs text-richblack-300 line-clamp-2">{test.description || 'Practice your course material'}</p>

              <div className="flex items-center justify-between pt-3 border-t border-richblack-700/50 text-xs text-richblack-400">
                <span className="flex items-center gap-1.5"><FaClock className="text-blue-400" /> {test.duration} Mins</span>
                <span className="flex items-center gap-1.5"><FaAward className="text-yellow-400" /> {test.totalMarks} Marks</span>
              </div>

              <button
                onClick={() => handleStartTest(test)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <FaPlay className="text-[10px]" /> Start Practice Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
