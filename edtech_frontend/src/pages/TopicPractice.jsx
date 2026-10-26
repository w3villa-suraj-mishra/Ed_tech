import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { practiceEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaFilter, FaArrowRight, FaRedo } from 'react-icons/fa';

export default function TopicPractice() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const fetchCategories = async () => {
    try {
      const res = await apiConnector('GET', practiceEndpoints.GET_PRACTICE_CATEGORIES);
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchQuestions = async () => {
    setLoading(true);
    setResult(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    try {
      let url = `${practiceEndpoints.GET_TOPIC_QUESTIONS}?difficulty=${selectedDifficulty}&`;
      if (selectedCategory) url += `categoryId=${selectedCategory}&`;
      if (selectedTopic) url += `topicId=${selectedTopic}&`;

      const res = await apiConnector('GET', url, null, { Authorization: `Bearer ${token}` });
      if (res.data?.success) {
        setQuestions(res.data.data);
        if (res.data.data.length === 0) {
          toast.error('No published questions found for selected criteria');
        }
      }
    } catch (err) {
      toast.error('Failed to load topic questions');
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

  const handleSubmitTopicPractice = async () => {
    try {
      const answersPayload = questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || null
      }));

      const res = await apiConnector('POST', practiceEndpoints.SUBMIT_ATTEMPT, {
        testType: 'Topic Practice',
        answers: answersPayload,
        timeTaken: 120
      }, { Authorization: `Bearer ${token}` });

      if (res.data?.success) {
        setResult(res.data.data);
        toast.success('Practice submitted!');
      }
    } catch (err) {
      toast.error('Failed to submit attempt');
    }
  };

  const selectedCategoryObj = categories.find(c => String(c.id) === String(selectedCategory));

  return (
    <div className="min-h-screen bg-richblack-900 text-white font-sans py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header & Filter Card */}
        <div className="bg-[#111422] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FaFilter className="text-[#3BA7F2] text-xl" />
            <div>
              <h1 className="text-xl font-bold text-white">Topic Practice</h1>
              <p className="text-xs text-richblack-300">Select Category → Topic → Difficulty to start practicing free</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-richblack-300 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedTopic(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3BA7F2]"
              >
                <option value="" className="bg-[#111422]">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-[#111422]">{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-richblack-300 mb-1">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3BA7F2]"
              >
                <option value="" className="bg-[#111422]">All Topics</option>
                {selectedCategoryObj?.topics?.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#111422]">{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-richblack-300 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3BA7F2]"
              >
                <option value="Easy" className="bg-[#111422]">Easy</option>
                <option value="Medium" className="bg-[#111422]">Medium</option>
                <option value="Hard" className="bg-[#111422]">Hard</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleFetchQuestions}
            className="w-full py-2.5 bg-[#3BA7F2] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Load Questions
          </button>
        </div>

        {/* RESULT VIEW */}
        {result ? (
          <div className="bg-[#111422] border border-blue-500/30 rounded-3xl p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold">Practice Completed!</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl"><span className="block text-xs text-richblack-300">Score</span><span className="text-lg font-black text-[#FFD60A]">{result.score}</span></div>
              <div className="bg-white/5 p-4 rounded-2xl"><span className="block text-xs text-richblack-300">Accuracy</span><span className="text-lg font-black text-emerald-400">{result.accuracy}%</span></div>
              <div className="bg-white/5 p-4 rounded-2xl"><span className="block text-xs text-richblack-300">Correct</span><span className="text-lg font-black text-emerald-400">{result.correctCount} / {result.totalQuestions}</span></div>
            </div>
            <button
              onClick={() => handleFetchQuestions()}
              className="px-6 py-2.5 bg-[#3BA7F2] text-white font-bold text-xs rounded-xl"
            >
              Practice More
            </button>
          </div>
        ) : (
          questions.length > 0 && questions[currentIndex] && (
            <div className="bg-[#111422] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center text-xs text-richblack-300">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="font-bold text-[#3BA7F2]">{questions[currentIndex].difficulty}</span>
              </div>

              <h2 className="text-lg font-bold">{questions[currentIndex].title}</h2>

              <div className="space-y-3">
                {(questions[currentIndex].options || []).map(opt => {
                  const isSelected = selectedAnswers[questions[currentIndex].id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(questions[currentIndex].id, opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer ${
                        isSelected ? 'bg-[#3BA7F2]/20 border-[#3BA7F2] text-white font-bold' : 'bg-white/5 border-white/10 text-richblack-200'
                      }`}
                    >
                      {opt.optionText}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-white/10">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="px-4 py-2 bg-white/5 disabled:opacity-30 rounded-xl text-xs"
                >
                  Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-5 py-2 bg-[#3BA7F2] text-white font-bold text-xs rounded-xl"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTopicPractice}
                    className="px-5 py-2 bg-[#FFD60A] text-black font-extrabold text-xs rounded-xl"
                  >
                    Submit Practice
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
