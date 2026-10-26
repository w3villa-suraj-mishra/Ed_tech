import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import AdminModal from '../../components/admin/AdminModal';
import { practiceEndpoints, courseEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaFilter, FaFileImport } from 'react-icons/fa';

export default function AdminPracticeBank() {
  return (
    <AdminProtectedRoute>
      <AdminPracticeBankInner />
    </AdminProtectedRoute>
  );
}

function AdminPracticeBankInner() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Selection & Bulk Actions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Question Form State
  const [formData, setFormData] = useState({
    title: '',
    testCategory: 'MCQ',
    type: 'MCQ',
    scope: 'GLOBAL',
    courseId: '',
    categoryId: '',
    topicId: '',
    difficulty: 'Easy',
    explanation: '',
    marks: 1,
    negativeMarks: 0,
    status: 'published',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    answerDetails: {
      acceptedAnswer: '',
    },
    codingDetails: {
      language: 'javascript',
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      starterCode: 'function solution() {\n  // Write code here\n}',
      testCases: '',
    },
    interviewDetails: {
      sampleAnswer: '',
      keyPoints: '',
    }
  });

  // Category/Topic Form State
  const [catName, setCatName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [selectedCatForTopic, setSelectedCatForTopic] = useState('');

  // Bulk CSV Text
  const [csvText, setCsvText] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = `${practiceEndpoints.ADMIN_QUESTIONS}?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (categoryFilter) url += `testCategory=${categoryFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;

      const res = await apiConnector('GET', url, null, { Authorization: `Bearer ${adminToken}` });
      if (res.data?.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchCourses = async () => {
    try {
      const res = await apiConnector('GET', courseEndpoints.GET_ALL_COURSE_API, null, null, { includeUnpublished: 'true', limit: 'all' });
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
    fetchCourses();
  }, [search, categoryFilter, typeFilter, difficultyFilter]);

  const handleOpenCreateModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        title: q.title || '',
        testCategory: q.testCategory || 'MCQ',
        type: q.type || 'MCQ',
        scope: q.scope || 'GLOBAL',
        courseId: q.courseId || '',
        categoryId: q.categoryId || '',
        topicId: q.topicId || '',
        difficulty: q.difficulty || 'Easy',
        explanation: q.explanation || '',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        status: q.status || 'published',
        options: q.options && q.options.length > 0 ? q.options.map(o => ({ text: o.optionText, isCorrect: o.isCorrect })) : [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        answerDetails: q.answerDetails || { acceptedAnswer: '' },
        codingDetails: q.codingDetails || {
          language: 'javascript',
          problemStatement: '',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          starterCode: 'function solution() {\n  // Write code here\n}',
          testCases: '',
        },
        interviewDetails: q.interviewDetails || {
          sampleAnswer: '',
          keyPoints: '',
        }
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        title: '',
        testCategory: 'MCQ',
        type: 'MCQ',
        scope: 'GLOBAL',
        courseId: '',
        categoryId: '',
        topicId: '',
        difficulty: 'Easy',
        explanation: '',
        marks: 1,
        negativeMarks: 0,
        status: 'published',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        answerDetails: { acceptedAnswer: '' },
        codingDetails: {
          language: 'javascript',
          problemStatement: '',
          inputFormat: '',
          outputFormat: '',
          constraints: '',
          starterCode: 'function solution() {\n  // Write code here\n}',
          testCases: '',
        },
        interviewDetails: {
          sampleAnswer: '',
          keyPoints: '',
        }
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleTypeChange = (newType) => {
    let newOptions = formData.options;
    if (newType === 'True/False') {
      newOptions = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ];
    } else if ((newType === 'MCQ' || newType === 'Multiple Select') && formData.options.length < 2) {
      newOptions = [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    }
    setFormData({ ...formData, type: newType, options: newOptions });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (formData.scope === 'COURSE' && !formData.courseId) {
      toast.error('Please select a course for Course Question');
      return;
    }

    try {
      const payload = {
        ...formData,
        courseId: formData.scope === 'GLOBAL' ? null : formData.courseId,
        options: ['MCQ', 'Multiple Select', 'True/False'].includes(formData.type) ? formData.options : undefined
      };

      if (editingQuestion) {
        await apiConnector('PUT', `${practiceEndpoints.ADMIN_QUESTIONS}/${editingQuestion.id}`, payload, {
          Authorization: `Bearer ${adminToken}`
        });
        toast.success('Question updated successfully');
      } else {
        await apiConnector('POST', practiceEndpoints.ADMIN_QUESTIONS, payload, {
          Authorization: `Bearer ${adminToken}`
        });
        toast.success('Question created successfully');
      }

      setIsQuestionModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_QUESTIONS}/${id}`, null, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success('Question deleted');
      setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestionIds(questions.map((q) => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestionIds.length} selected question(s)?`)) return;

    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_BULK_DELETE_QUESTIONS, { ids: selectedQuestionIds }, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success(`${selectedQuestionIds.length} question(s) deleted`);
      setSelectedQuestionIds([]);
      fetchQuestions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete selected questions');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_CATEGORIES, { name: catName }, {
        Authorization: `Bearer ${adminToken}`
      });
      toast.success('Category created');
      setCatName('');
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await apiConnector('POST', practiceEndpoints.ADMIN_TOPICS, {
        name: topicName,
        categoryId: selectedCatForTopic
      }, { Authorization: `Bearer ${adminToken}` });
      toast.success('Topic created');
      setTopicName('');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to create topic');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      const lines = csvText.split('\n').filter(l => l.trim());
      const parsedQuestions = lines.map(line => {
        const parts = line.split(',');
        return {
          title: parts[0]?.trim(),
          type: parts[1]?.trim() || 'MCQ',
          difficulty: parts[2]?.trim() || 'Easy',
          explanation: parts[3]?.trim() || '',
          options: [
            { text: parts[4]?.trim() || 'Option A', isCorrect: true },
            { text: parts[5]?.trim() || 'Option B', isCorrect: false },
            { text: parts[6]?.trim() || 'Option C', isCorrect: false },
            { text: parts[7]?.trim() || 'Option D', isCorrect: false },
          ]
        };
      });

      await apiConnector('POST', practiceEndpoints.ADMIN_BULK_QUESTIONS, { questions: parsedQuestions }, {
        Authorization: `Bearer ${adminToken}`
      });

      toast.success(`Uploaded ${parsedQuestions.length} questions`);
      setIsBulkModalOpen(false);
      setCsvText('');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to bulk upload');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-purple-700 rounded-lg text-lg">⚡</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Practice Question Bank</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage global & course-specific questions, test categories, and dynamic question types.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedQuestionIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-md flex items-center gap-2 shadow-sm hover:bg-red-700 transition"
              >
                <FaTrash /> Delete Selected ({selectedQuestionIds.length})
              </button>
            )}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-gray-300 text-gray-700 hover:text-gray-900 font-semibold text-xs rounded-md shadow-sm transition-colors hover:bg-gray-50"
            >
              Manage Categories
            </button>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 bg-purple-700 text-white font-bold text-xs rounded-md flex items-center gap-2 shadow-sm hover:bg-purple-800 transition"
            >
              <FaPlus /> + Add Question
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded pl-9 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-purple-600"
            >
              <option value="">All Test Categories</option>
              <option value="MCQ">MCQ</option>
              <option value="Coding">Coding</option>
              <option value="Topic Practice">Topic Practice</option>
              <option value="Mock Test">Mock Test</option>
              <option value="Interview Test">Interview Test</option>
              <option value="Daily Quiz">Daily Quiz</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-purple-600"
            >
              <option value="">All Question Types</option>
              <option value="MCQ">MCQ</option>
              <option value="Multiple Select">Multiple Select</option>
              <option value="True/False">True/False</option>
              <option value="Short Answer">Short Answer</option>
              <option value="Fill in the Blank">Fill in the Blank</option>
              <option value="Coding">Coding</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-purple-600"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Questions List</h2>
            <span className="text-xs text-purple-200">{questions.length} questions</span>
          </div>

          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={questions.length > 0 && selectedQuestionIds.length === questions.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3.5">Question Title</th>
                    <th className="px-5 py-3.5">Scope</th>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="px-5 py-3.5">Test Category</th>
                    <th className="px-5 py-3.5">Question Type</th>
                    <th className="px-5 py-3.5">Difficulty</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-500">
                        No questions found. Click "Add Question" to create one.
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q.id} className={`hover:bg-gray-50 transition-colors ${selectedQuestionIds.includes(q.id) ? 'bg-purple-50/60' : ''}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => handleSelectOne(q.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4 font-medium max-w-sm truncate text-gray-900">{q.title}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            q.scope === 'COURSE' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {q.scope === 'COURSE' ? 'Course' : 'Global'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {q.scope === 'COURSE' ? (q.course?.courseName || courses.find(c => String(c.id || c._id) === String(q.courseId))?.courseName || '—') : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {q.testCategory || 'MCQ'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            q.type === 'MCQ' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                            q.type === 'Coding' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {q.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Question */}
                            <button
                              onClick={() => handleOpenCreateModal(q)}
                              className="p-1.5 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                              title="Edit Question"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                              title="Delete Question"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isQuestionModalOpen && (
        <AdminModal isOpen={isQuestionModalOpen} title={editingQuestion ? 'Edit Question' : 'Create Question'} onClose={() => setIsQuestionModalOpen(false)}>
          <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Question Title / Statement *</label>
              <textarea
                required
                rows={3}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-purple-600"
                placeholder="Enter title or question statement..."
              />
            </div>

            <div className="bg-[#f4f5f8] p-3.5 border border-gray-200 rounded-xl space-y-3">
              <div>
                <label className="block text-purple-600 font-bold mb-2 uppercase tracking-wide text-[11px]">Question Scope *</label>
                <div className="flex items-center gap-6 text-gray-800 font-medium">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="questionScope"
                      value="GLOBAL"
                      checked={formData.scope === 'GLOBAL'}
                      onChange={() => setFormData({ ...formData, scope: 'GLOBAL', courseId: '' })}
                      className="accent-[#FFD60A] w-4 h-4"
                    />
                    <span>Global Question</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="questionScope"
                      value="COURSE"
                      checked={formData.scope === 'COURSE'}
                      onChange={() => setFormData({ ...formData, scope: 'COURSE' })}
                      className="accent-[#FFD60A] w-4 h-4"
                    />
                    <span>Course Question</span>
                  </label>
                </div>
              </div>

              {formData.scope === 'COURSE' && (
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-slate-300 font-semibold mb-1">Select Course *</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-600 font-bold mb-1">1. TEST CATEGORY *</label>
                <select
                  required
                  value={formData.testCategory}
                  onChange={(e) => setFormData({ ...formData, testCategory: e.target.value })}
                  className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="Coding">Coding</option>
                  <option value="Topic Practice">Topic Practice</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Interview Test">Interview Test</option>
                  <option value="Daily Quiz">Daily Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-purple-600 font-bold mb-1">2. QUESTION TYPE *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="MCQ">MCQ (Single Answer)</option>
                  <option value="Multiple Select">Multiple Select</option>
                  <option value="True/False">True / False</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Fill in the Blank">Fill in the Blank</option>
                  <option value="Coding">Coding Problem</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Marks</label>
                <input
                  type="number"
                  min={1}
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {formData.type === 'MCQ' && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="block text-slate-300 font-semibold">Answer Options (Select Exactly 1 Correct Answer)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOpts = formData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="accent-[#FFD60A]"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].text = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="flex-1 bg-[#f4f5f8] border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                ))}
              </div>
            )}

            {formData.type === 'Multiple Select' && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="block text-slate-300 font-semibold">Answer Options (Check all Correct Answers)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].isCorrect = e.target.checked;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="accent-[#FFD60A]"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[idx].text = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      className="flex-1 bg-[#f4f5f8] border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                ))}
              </div>
            )}

            {formData.type === 'True/False' && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="block text-slate-300 font-semibold">Select Correct Choice</label>
                <div className="flex gap-6">
                  {formData.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-gray-800 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="trueFalseChoice"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const newOpts = formData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                          setFormData({ ...formData, options: newOpts });
                        }}
                        className="accent-[#FFD60A]"
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(formData.type === 'Short Answer' || formData.type === 'Fill in the Blank') && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="block text-slate-300 font-semibold">Accepted Correct Answer *</label>
                <input
                  type="text"
                  required
                  placeholder="Exact string answer expected from student..."
                  value={formData.answerDetails?.acceptedAnswer || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    answerDetails: { ...formData.answerDetails, acceptedAnswer: e.target.value }
                  })}
                  className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            )}

            {formData.type === 'Coding' && (
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Programming Language</label>
                    <select
                      value={formData.codingDetails.language}
                      onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, language: e.target.value } })}
                      className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Constraints</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 <= N <= 10^5"
                      value={formData.codingDetails.constraints}
                      onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, constraints: e.target.value } })}
                      className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Problem Statement</label>
                  <textarea
                    rows={3}
                    value={formData.codingDetails.problemStatement}
                    onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, problemStatement: e.target.value } })}
                    className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starter Code</label>
                  <textarea
                    rows={3}
                    value={formData.codingDetails.starterCode}
                    onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, starterCode: e.target.value } })}
                    className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 font-mono text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Test Cases (JSON or text)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Input: [1,2], Output: 3"
                    value={formData.codingDetails.testCases}
                    onChange={(e) => setFormData({ ...formData, codingDetails: { ...formData.codingDetails, testCases: e.target.value } })}
                    className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800 font-mono text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Explanation / Solution</label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full bg-[#f4f5f8] border border-gray-200 rounded-xl p-2.5 text-gray-800"
                placeholder="Explain the correct answer..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md text-xs shadow-sm transition-colors"
              >
                Save Question
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* CATEGORIES / TOPICS MODAL */}
      {isCategoryModalOpen && (
        <AdminModal isOpen={isCategoryModalOpen} title="Manage Categories & Topics" onClose={() => setIsCategoryModalOpen(false)}>
          <div className="space-y-6 text-xs">
            {/* Create Category */}
            <form onSubmit={handleCreateCategory} className="space-y-2 border-b border-gray-200 pb-4">
              <label className="block text-gray-700 font-semibold">Create New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. JavaScript, Python, Data Structures"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                />
                <button type="submit" className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md text-xs shadow-sm">Add</button>
              </div>
            </form>

            {/* Create Topic */}
            <form onSubmit={handleCreateTopic} className="space-y-2">
              <label className="block text-gray-700 font-semibold">Create New Topic under Category</label>
              <select
                value={selectedCatForTopic}
                onChange={(e) => setSelectedCatForTopic(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 mb-2 focus:outline-none focus:border-purple-600"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Promises, Async/Await"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:border-purple-600"
                />
                <button type="submit" className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md text-xs shadow-sm">Add Topic</button>
              </div>
            </form>
          </div>
        </AdminModal>
      )}

      {/* BULK CSV MODAL */}
      {isBulkModalOpen && (
        <AdminModal isOpen={isBulkModalOpen} title="Bulk Upload Questions (CSV Format)" onClose={() => setIsBulkModalOpen(false)}>
          <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
            <p className="text-gray-500">Paste CSV lines formatted as: <br/><code className="text-purple-600 font-semibold">Question Title,Type,Difficulty,Explanation,OptA,OptB,OptC,OptD</code></p>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="What is closure in JS?,MCQ,Easy,Closure retains scope,A function with scope,An object,A loop,A string"
              className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-800 font-mono text-xs focus:outline-none focus:border-purple-600"
            />
            <button type="submit" className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-md text-xs shadow-sm">Upload Questions</button>
          </form>
        </AdminModal>
      )}
      </div>
    </AdminLayout>
  );
}
