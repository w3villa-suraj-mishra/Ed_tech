import React, { useState, useEffect } from 'react';
import { apiConnector } from '../../services/apiConnector';
import { practiceEndpoints } from '../../services/apis';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaPlus, FaSearch, FaTrash, FaEdit, FaArrowLeft, FaArrowRight,
  FaFileAlt, FaListUl, FaGlobe, FaBookOpen, FaTimes, FaLayerGroup, FaQuestionCircle,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';

export default function TestBuilderWizard({
  isOpen,
  onClose,
  token,
  role = 'INSTRUCTOR', // 'ADMIN' | 'INSTRUCTOR'
  courses = [],
  initialScope = 'COURSE',
  initialCourseId = '',
  initialTest = null,
  onSuccess
}) {
  // Active Step: 1 = Details, 2 = Questions, 3 = Review
  const [step, setStep] = useState(1);

  // Step 1 Form Data
  const [testForm, setTestForm] = useState({
    id: null,
    title: '',
    description: '',
    testType: 'MCQ',
    scope: role === 'ADMIN' ? initialScope : 'COURSE',
    courseId: initialCourseId || (courses.length > 0 ? (courses[0].id || courses[0]._id) : ''),
    duration: 20,
    passingPercentage: 50,
    status: 'published'
  });

  // Step 2 Question Management
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Question Bank Picker Modal State
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState('All');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('All');
  const [pickerSelectedIds, setPickerSelectedIds] = useState([]);

  // Inline Question Creation & Editing Drawer/Modal State
  const [isInlineDrawerOpen, setIsInlineDrawerOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);
  const [qForm, setQForm] = useState({
    title: '',
    type: 'MCQ',
    difficulty: 'Easy',
    marks: 1,
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false }
    ],
    codingDetails: {
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      language: 'python',
      starterCode: 'def solve():\n    # Write your solution here\n    pass',
      testCases: [
        { input: '', expectedOutput: '', isHidden: false }
      ]
    },
    interviewDetails: { expectedAnswer: '', keyPoints: '' }
  });

  const [submittingTest, setSubmittingTest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialTest) {
        setTestForm({
          id: initialTest.id,
          title: initialTest.title || '',
          description: initialTest.description || '',
          testType: initialTest.testType || 'MCQ',
          scope: initialTest.scope || (role === 'ADMIN' ? initialScope : 'COURSE'),
          courseId: initialTest.courseId || initialCourseId || (courses.length > 0 ? (courses[0].id || courses[0]._id) : ''),
          duration: initialTest.duration || 20,
          passingPercentage: initialTest.passingPercentage || 50,
          status: initialTest.status || 'published'
        });
        setSelectedQuestions(initialTest.questions || []);
      } else {
        setTestForm({
          id: null,
          title: '',
          description: '',
          testType: 'MCQ',
          scope: role === 'ADMIN' ? initialScope : 'COURSE',
          courseId: initialCourseId || (courses.length > 0 ? (courses[0].id || courses[0]._id) : ''),
          duration: 20,
          passingPercentage: 50,
          status: 'published'
        });
        setSelectedQuestions([]);
      }
      setIsInlineDrawerOpen(false);
      setIsBankOpen(false);
      setQForm({
        title: '',
        type: 'MCQ',
        difficulty: 'Easy',
        marks: 1,
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false }
        ],
        codingDetails: { language: 'javascript', problemStatement: '', starterCode: '', testCases: '' },
        interviewDetails: { expectedAnswer: '', keyPoints: '' }
      });
    }
  }, [isOpen, role, initialScope, initialCourseId, courses, initialTest]);

  useEffect(() => {
    if (courses.length > 0 && !testForm.courseId) {
      setTestForm(prev => ({ ...prev, courseId: courses[0].id || courses[0]._id }));
    }
  }, [courses]);

  // Compute total marks dynamically
  const calculatedTotalMarks = selectedQuestions.reduce((sum, q) => sum + Number(q.marks || 1), 0);

  // ----------------------------------------------------
  // QUESTION BANK PICKER
  // ----------------------------------------------------
  const fetchQuestionBank = async () => {
    setBankLoading(true);
    try {
      let endpoint = '';
      if (role === 'ADMIN') {
        endpoint = testForm.scope === 'GLOBAL'
          ? `${practiceEndpoints.ADMIN_QUESTIONS}?scope=GLOBAL`
          : `${practiceEndpoints.ADMIN_QUESTIONS}?scope=COURSE&courseId=${testForm.courseId}`;
      } else {
        endpoint = `${practiceEndpoints.INSTRUCTOR_GET_QUESTIONS}?courseId=${testForm.courseId}`;
      }

      const res = await apiConnector('GET', endpoint, null, { Authorization: `Bearer ${token}` });
      if (res.data?.success) {
        setBankQuestions(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch Question Bank error:', err);
      toast.error('Failed to load Question Bank');
    } finally {
      setBankLoading(false);
    }
  };

  const handleOpenQuestionBank = () => {
    if (testForm.scope === 'COURSE' && !testForm.courseId) {
      toast.error('Please select a course first');
      return;
    }
    fetchQuestionBank();
    setPickerSelectedIds(selectedQuestions.map(q => q.id));
    setIsBankOpen(true);
  };

  const handleAddSelectedFromBank = () => {
    const chosen = bankQuestions.filter(q => pickerSelectedIds.includes(q.id));
    setSelectedQuestions(chosen);
    setIsBankOpen(false);
    toast.success(`Attached ${chosen.length} questions to test`);
  };

  // ----------------------------------------------------
  // INLINE QUESTION CREATION
  // ----------------------------------------------------
  const handleQuestionTypeChange = (newType) => {
    if (newType === 'True / False' || newType === 'True/False') {
      setQForm(prev => ({
        ...prev,
        type: newType,
        options: [
          { optionText: 'True', isCorrect: true },
          { optionText: 'False', isCorrect: false }
        ]
      }));
    } else if (newType === 'MCQ') {
      setQForm(prev => ({
        ...prev,
        type: newType,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false }
        ]
      }));
    } else if (newType === 'Multiple Select') {
      setQForm(prev => ({
        ...prev,
        type: newType,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false }
        ]
      }));
    } else {
      setQForm(prev => ({ ...prev, type: newType, options: [] }));
    }
  };

  const handleAddMcqOption = () => {
    setQForm(prev => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }]
    }));
  };

  const handleRemoveMcqOption = (idx) => {
    if (qForm.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    const updated = qForm.options.filter((_, i) => i !== idx);
    if (!updated.some(o => o.isCorrect) && updated.length > 0) {
      updated[0].isCorrect = true;
    }
    setQForm(prev => ({ ...prev, options: updated }));
  };

  const validateInlineQuestion = () => {
    if (!qForm.title.trim()) {
      toast.error('Question title is required');
      return false;
    }
    if (!qForm.marks || qForm.marks <= 0) {
      toast.error('Valid marks required');
      return false;
    }
    if (['MCQ', 'Multiple Select'].includes(qForm.type)) {
      if (qForm.options.length < 2) {
        toast.error('At least 2 options required');
        return false;
      }
      for (let i = 0; i < qForm.options.length; i++) {
        if (!qForm.options[i].optionText.trim()) {
          toast.error(`Option ${i + 1} text cannot be empty`);
          return false;
        }
      }
      const correctCount = qForm.options.filter(o => o.isCorrect).length;
      if (qForm.type === 'MCQ' && correctCount !== 1) {
        toast.error('MCQ requires exactly 1 correct answer');
        return false;
      }
      if (qForm.type === 'Multiple Select' && correctCount < 1) {
        toast.error('Multiple Select requires at least 1 correct answer');
        return false;
      }
    }
    return true;
  };

  const handleEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQForm({
      title: q.title || '',
      type: q.type || 'MCQ',
      difficulty: q.difficulty || 'Easy',
      marks: q.marks || 1,
      explanation: q.explanation || '',
      options: Array.isArray(q.options) && q.options.length > 0 
        ? q.options.map(opt => ({ optionText: opt.optionText || opt.text || '', isCorrect: Boolean(opt.isCorrect) }))
        : (q.type === 'True / False' || q.type === 'True/False' ? [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false }
          ] : [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false }
          ]),
      codingDetails: q.codingDetails || {
        problemStatement: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        language: 'python',
        starterCode: 'def solve():\n    # Write your solution here\n    pass',
        testCases: [{ input: '', expectedOutput: '', isHidden: false }]
      },
      interviewDetails: q.interviewDetails || { expectedAnswer: '', keyPoints: '' }
    });
    setIsInlineDrawerOpen(true);
  };

  const saveInlineQuestion = async (shouldAddAnother = false) => {
    if (isSubmittingQ) return;
    if (!validateInlineQuestion()) return;

    setIsSubmittingQ(true);
    try {
      const isEditingQ = Boolean(editingQuestionId);
      let endpoint = '';
      let method = isEditingQ ? 'PUT' : 'POST';

      if (isEditingQ) {
        endpoint = role === 'ADMIN'
          ? `${practiceEndpoints.ADMIN_QUESTIONS}/${editingQuestionId}`
          : `${practiceEndpoints.INSTRUCTOR_GET_QUESTIONS}/${editingQuestionId}`;
      } else {
        endpoint = role === 'ADMIN'
          ? practiceEndpoints.ADMIN_QUESTIONS
          : practiceEndpoints.INSTRUCTOR_GET_QUESTIONS;
      }

      const payload = {
        ...qForm,
        scope: testForm.scope,
        courseId: testForm.scope === 'COURSE' ? Number(testForm.courseId) : null
      };

      const res = await apiConnector(method, endpoint, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        const savedQ = res.data.data;
        toast.success(isEditingQ ? 'Question updated successfully! 🎯' : 'Question saved to Question Bank & attached! 🎯');

        if (isEditingQ) {
          setSelectedQuestions(prev => prev.map(q => (q.id === editingQuestionId ? savedQ : q)));
        } else {
          setSelectedQuestions(prev => [...prev, savedQ]);
        }

        setEditingQuestionId(null);

        // Reset Question Form
        setQForm({
          title: '',
          type: qForm.type,
          difficulty: 'Easy',
          marks: 1,
          explanation: '',
          options: qForm.type === 'True / False' ? [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false }
          ] : [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false }
          ],
          codingDetails: { language: 'javascript', problemStatement: '', starterCode: '', testCases: '' },
          interviewDetails: { expectedAnswer: '', keyPoints: '' }
        });

        if (!shouldAddAnother) {
          setIsInlineDrawerOpen(false);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmittingQ(false);
    }
  };

  // Move Question Up/Down in list
  const handleMoveQuestion = (index, direction) => {
    const updated = [...selectedQuestions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSelectedQuestions(updated);
  };

  const handleRemoveQuestion = (qId) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== qId));
  };

  // ----------------------------------------------------
  // STEP 3: PUBLISH / SAVE DRAFT
  // ----------------------------------------------------
  const handleFinalSubmit = async (targetStatus = 'published') => {
    if (submittingTest) return;

    if (!testForm.title.trim()) {
      toast.error('Test title is required');
      setStep(1);
      return;
    }

    if (testForm.scope === 'COURSE' && !testForm.courseId) {
      toast.error('Course selection is required for Course tests');
      setStep(1);
      return;
    }

    if (targetStatus === 'published' && selectedQuestions.length === 0) {
      toast.error('Select or create at least 1 question to publish');
      setStep(2);
      return;
    }

    setSubmittingTest(true);
    try {
      const qIds = selectedQuestions.map(q => q.id);
      let method = 'POST';
      let endpoint = '';
      let payload = {};

      const isEditing = Boolean(initialTest?.id || testForm.id);
      const testId = initialTest?.id || testForm.id;

      if (isEditing) {
        method = 'PUT';
        endpoint = role === 'ADMIN' 
          ? `${practiceEndpoints.ADMIN_TESTS}/${testId}`
          : `${practiceEndpoints.INSTRUCTOR_TOGGLE_TEST_STATUS}${testId}`;
        payload = {
          title: testForm.title,
          description: testForm.description,
          testType: testForm.testType,
          scope: testForm.scope,
          courseId: testForm.scope === 'COURSE' ? Number(testForm.courseId) : null,
          duration: Number(testForm.duration),
          passingPercentage: Number(testForm.passingPercentage),
          totalMarks: calculatedTotalMarks || 10,
          numberOfQuestions: qIds.length,
          status: targetStatus,
          questionIds: qIds
        };
      } else if (role === 'ADMIN') {
        method = 'POST';
        endpoint = practiceEndpoints.ADMIN_TESTS;
        payload = {
          title: testForm.title,
          description: testForm.description,
          testType: testForm.testType,
          scope: testForm.scope,
          courseId: testForm.scope === 'COURSE' ? Number(testForm.courseId) : null,
          duration: Number(testForm.duration),
          passingPercentage: Number(testForm.passingPercentage),
          totalMarks: calculatedTotalMarks || 10,
          numberOfQuestions: qIds.length,
          status: targetStatus,
          questionIds: qIds
        };
      } else {
        method = 'POST';
        endpoint = practiceEndpoints.INSTRUCTOR_CREATE_COURSE_TEST;
        payload = {
          courseId: Number(testForm.courseId),
          title: testForm.title,
          description: testForm.description,
          testType: testForm.testType,
          duration: Number(testForm.duration),
          passingPercentage: Number(testForm.passingPercentage),
          totalMarks: calculatedTotalMarks || 10,
          status: targetStatus,
          questionIds: qIds
        };
      }

      const res = await apiConnector(method, endpoint, payload, {
        Authorization: `Bearer ${token}`
      });

      if (res.data?.success) {
        toast.success(`Test ${isEditing ? 'Updated' : (targetStatus === 'published' ? 'Published' : 'Saved as Draft')} Successfully! 🚀`);
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save test');
    } finally {
      setSubmittingTest(false);
    }
  };

  if (!isOpen) return null;

  const isEditingTest = Boolean(initialTest?.id || testForm.id);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto ${role === 'INSTRUCTOR' ? 'test-builder-light' : ''}`}>
      <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Inter',sans-serif]">
        
        {/* HEADER & STEP WIZARD PROGRESS */}
        <div className="bg-[#090D16] border-b border-[#2C333F] p-5 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isEditingTest ? '✏️' : '📝'}</span> {isEditingTest ? 'Edit Practice Test / Quiz' : 'Create Practice Test / Quiz'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Professional EdTech Test Builder</p>
          </div>

          {/* Step Progress Bar */}
          <div className="flex items-center gap-2 bg-[#161D29] p-1.5 rounded-xl border border-[#2C333F] text-xs">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                step === 1 ? 'bg-[#FFD60A] text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Details
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                step === 2 ? 'bg-[#FFD60A] text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Questions ({selectedQuestions.length})
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                step === 3 ? 'bg-[#FFD60A] text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Review
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-[#161D29] border border-[#2C333F]"
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY CONTENT BY STEP */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-200">
          
          {/* STEP 1: TEST DETAILS */}
          {step === 1 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Test Type *</label>
                  <select
                    value={testForm.testType}
                    onChange={(e) => setTestForm({ ...testForm, testType: e.target.value })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Coding">Coding</option>
                    <option value="Topic Practice">Topic Practice</option>
                    <option value="Mock Test">Mock Test</option>
                    <option value="Interview Test">Interview Test</option>
                    <option value="Daily Quiz">Daily Quiz</option>
                  </select>
                </div>

                {role === 'ADMIN' ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Scope *</label>
                    <select
                      value={testForm.scope}
                      onChange={(e) => setTestForm({ ...testForm, scope: e.target.value })}
                      className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                    >
                      <option value="GLOBAL">Global Test (Available to all students)</option>
                      <option value="COURSE">Course Test (Attached to specific course)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Scope</label>
                    <div className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-indigo-400 font-bold">
                      Course Test (Owned Courses Only)
                    </div>
                  </div>
                )}
              </div>

              {testForm.scope === 'COURSE' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Associated Course *</label>
                  <select
                    value={testForm.courseId}
                    onChange={(e) => setTestForm({ ...testForm, courseId: e.target.value })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none font-bold"
                  >
                    {courses.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.courseName || c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="e.g. Python Fundamentals Mock Quiz #1"
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Provide test instructions, topics covered, or notes..."
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    min={1}
                    value={testForm.duration}
                    onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Passing Percentage (%) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={testForm.passingPercentage}
                    onChange={(e) => setTestForm({ ...testForm, passingPercentage: Number(e.target.value) })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-white focus:border-[#FFD60A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Marks</label>
                  <div className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-3 text-emerald-400 font-bold">
                    {calculatedTotalMarks} Marks (Auto-summed)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADD & MANAGE QUESTIONS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#090D16] p-4 rounded-xl border border-[#2C333F]">
                <div>
                  <h3 className="font-bold text-white text-sm">Test Questions ({selectedQuestions.length})</h3>
                  <p className="text-slate-400 text-xs">Total Marks: <strong className="text-emerald-400">{calculatedTotalMarks}</strong></p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setEditingQuestionId(null);
                      setQForm({
                        title: '',
                        type: 'MCQ',
                        difficulty: 'Easy',
                        marks: 1,
                        explanation: '',
                        options: [
                          { optionText: '', isCorrect: true },
                          { optionText: '', isCorrect: false }
                        ],
                        codingDetails: {
                          problemStatement: '',
                          inputFormat: '',
                          outputFormat: '',
                          constraints: '',
                          language: 'python',
                          starterCode: 'def solve():\n    # Write your solution here\n    pass',
                          testCases: [{ input: '', expectedOutput: '', isHidden: false }]
                        },
                        interviewDetails: { expectedAnswer: '', keyPoints: '' }
                      });
                      setIsInlineDrawerOpen(true);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-md"
                  >
                    <FaPlus /> Create New Question
                  </button>
                  <button
                    onClick={handleOpenQuestionBank}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#2C333F] hover:bg-[#3d4554] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-600"
                  >
                    <FaBookOpen /> Add From Question Bank
                  </button>
                </div>
              </div>

              {/* Selected Questions List */}
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[#2C333F] rounded-2xl bg-[#090D16]/50">
                  <FaQuestionCircle className="mx-auto text-4xl text-slate-600 mb-3" />
                  <h4 className="font-bold text-slate-300">No questions added to this test yet.</h4>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                    Click <strong>Create New Question</strong> to build one inline, or select reusable questions from your <strong>Question Bank</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="bg-[#090D16] border border-[#2C333F] rounded-xl p-4 flex items-start justify-between gap-4 hover:border-slate-600 transition">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-xs">{q.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                              {q.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold text-[10px]">
                              {q.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              {q.marks} Marks
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          className="p-2 text-slate-400 hover:text-white bg-[#161D29] rounded-lg disabled:opacity-30"
                          title="Move Up"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          disabled={idx === selectedQuestions.length - 1}
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          className="p-2 text-slate-400 hover:text-white bg-[#161D29] rounded-lg disabled:opacity-30"
                          title="Move Down"
                        >
                          <FaArrowDown />
                        </button>
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/10 bg-[#161D29] rounded-lg transition"
                          title="Edit Question"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Remove from test"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REVIEW & PUBLISH */}
          {step === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#090D16] border border-[#2C333F] rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-[#2C333F] pb-3">Test Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Title</span>
                    <p className="font-bold text-white">{testForm.title || 'Untitled Test'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Type</span>
                    <p className="font-bold text-blue-400">{testForm.testType}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Duration</span>
                    <p className="font-bold text-white">{testForm.duration} Mins</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Passing %</span>
                    <p className="font-bold text-emerald-400">{testForm.passingPercentage}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Scope</span>
                    <p className="font-bold text-blue-400">{testForm.scope}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Questions</span>
                    <p className="font-bold text-white">{selectedQuestions.length} Questions</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Total Marks</span>
                    <p className="font-bold text-emerald-400">{calculatedTotalMarks} Marks</p>
                  </div>
                </div>
              </div>

              {/* Review Questions List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">Questions in this test:</h4>
                {selectedQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-[#090D16] border border-[#2C333F] rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-white truncate max-w-md">
                      <strong>{idx + 1}.</strong> {q.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">[{q.type}]</span>
                      <span className="text-emerald-400 font-bold text-[10px]">{q.marks}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-[#090D16] border-t border-[#2C333F] p-4 shrink-0 flex items-center justify-between gap-4">
          <button
            disabled={step === 1}
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-[#161D29] hover:bg-[#2C333F] text-white font-bold rounded-xl transition border border-[#2C333F] disabled:opacity-30"
          >
            ← Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !testForm.title.trim()) {
                  toast.error('Test title is required');
                  return;
                }
                setStep(prev => Math.min(3, prev + 1));
              }}
              className="px-6 py-2.5 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold rounded-xl shadow-lg transition"
            >
              Next Step →
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                disabled={submittingTest}
                onClick={() => handleFinalSubmit('draft')}
                className="px-5 py-2.5 bg-[#2C333F] hover:bg-[#3d4554] text-yellow-400 font-bold rounded-xl transition border border-slate-600 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                disabled={submittingTest}
                onClick={() => handleFinalSubmit('published')}
                className="px-6 py-2.5 bg-[#FFD60A] hover:bg-yellow-400 text-black font-extrabold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                {submittingTest ? 'Publishing...' : 'Publish Test 🚀'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INLINE QUESTION DRAWER MODAL */}
      {isInlineDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-['Inter',sans-serif]">
            <div className="bg-[#090D16] p-4 border-b border-[#2C333F] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>{editingQuestionId ? '✏️' : '➕'}</span> {editingQuestionId ? 'Edit Question Details' : 'Create New Question & Add to Test'}
              </h3>
              <button onClick={() => setIsInlineDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Type *</label>
                  <select
                    value={qForm.type}
                    onChange={(e) => handleQuestionTypeChange(e.target.value)}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Multiple Select">Multiple Select</option>
                    <option value="True / False">True / False</option>
                    <option value="Coding">Coding</option>
                    <option value="Short Answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Marks *</label>
                  <input
                    type="number"
                    min={1}
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: Number(e.target.value) })}
                    className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question / Prompt *</label>
                <textarea
                  rows={3}
                  value={qForm.title}
                  onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                  placeholder="Enter problem statement or question title..."
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white focus:border-[#FFD60A] outline-none"
                />
              </div>

              {/* MCQ & Multiple Select Options Editor */}
              {['MCQ', 'Multiple Select', 'True / False'].includes(qForm.type) && (
                <div className="space-y-2 pt-2 border-t border-[#2C333F]">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-semibold">Options & Correct Answer</label>
                    {qForm.type !== 'True / False' && (
                      <button
                        type="button"
                        onClick={handleAddMcqOption}
                        className="text-yellow-400 font-bold text-[11px] hover:underline"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  {qForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type={qForm.type === 'Multiple Select' ? 'checkbox' : 'radio'}
                        name="correct-option"
                        checked={opt.isCorrect}
                        onChange={() => {
                          if (qForm.type === 'Multiple Select') {
                            const updated = [...qForm.options];
                            updated[idx].isCorrect = !updated[idx].isCorrect;
                            setQForm({ ...qForm, options: updated });
                          } else {
                            const updated = qForm.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                            setQForm({ ...qForm, options: updated });
                          }
                        }}
                        className="accent-[#FFD60A]"
                      />
                      <input
                        type="text"
                        disabled={qForm.type === 'True / False'}
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...qForm.options];
                          updated[idx].optionText = e.target.value;
                          setQForm({ ...qForm, options: updated });
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-[#090D16] border border-[#2C333F] rounded-xl p-2 text-white"
                      />
                      {qForm.type !== 'True / False' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMcqOption(idx)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CODING PROBLEM BUILDER */}
              {qForm.type === 'Coding' && (
                <div className="space-y-4 pt-2 border-t border-[#2C333F]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-yellow-400 text-xs">💻 Coding Problem Details</h4>
                    <div>
                      <label className="text-slate-300 text-[11px] font-semibold mr-2">Language:</label>
                      <select
                        value={qForm.codingDetails?.language || 'python'}
                        onChange={(e) => setQForm({
                          ...qForm,
                          codingDetails: { ...qForm.codingDetails, language: e.target.value }
                        })}
                        className="bg-[#090D16] border border-[#2C333F] rounded-lg p-1.5 text-white text-xs"
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Problem Statement *</label>
                    <textarea
                      rows={3}
                      value={qForm.codingDetails?.problemStatement || ''}
                      onChange={(e) => setQForm({
                        ...qForm,
                        codingDetails: { ...qForm.codingDetails, problemStatement: e.target.value }
                      })}
                      placeholder="Describe the coding challenge..."
                      className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white outline-none focus:border-[#FFD60A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Input Format</label>
                      <textarea
                        rows={2}
                        value={qForm.codingDetails?.inputFormat || ''}
                        onChange={(e) => setQForm({
                          ...qForm,
                          codingDetails: { ...qForm.codingDetails, inputFormat: e.target.value }
                        })}
                        placeholder="e.g. Two space-separated integers A and B"
                        className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Output Format</label>
                      <textarea
                        rows={2}
                        value={qForm.codingDetails?.outputFormat || ''}
                        onChange={(e) => setQForm({
                          ...qForm,
                          codingDetails: { ...qForm.codingDetails, outputFormat: e.target.value }
                        })}
                        placeholder="e.g. Single integer representing sum"
                        className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Constraints</label>
                    <input
                      type="text"
                      value={qForm.codingDetails?.constraints || ''}
                      onChange={(e) => setQForm({
                        ...qForm,
                        codingDetails: { ...qForm.codingDetails, constraints: e.target.value }
                      })}
                      placeholder="e.g. 1 <= N <= 10^5"
                      className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Starter Code / Boilerplate</label>
                    <textarea
                      rows={4}
                      value={qForm.codingDetails?.starterCode || ''}
                      onChange={(e) => setQForm({
                        ...qForm,
                        codingDetails: { ...qForm.codingDetails, starterCode: e.target.value }
                      })}
                      placeholder="Provide starter code function..."
                      className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 font-mono text-xs text-emerald-400 outline-none"
                    />
                  </div>

                  {/* TEST CASES SECTION */}
                  <div className="space-y-3 pt-2 border-t border-[#2C333F]">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-300 font-semibold">Test Cases ({qForm.codingDetails?.testCases?.length || 0})</label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentCases = qForm.codingDetails?.testCases || [];
                          setQForm({
                            ...qForm,
                            codingDetails: {
                              ...qForm.codingDetails,
                              testCases: [...currentCases, { input: '', expectedOutput: '', isHidden: false }]
                            }
                          });
                        }}
                        className="text-yellow-400 font-bold text-xs hover:underline"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    {(qForm.codingDetails?.testCases || []).map((tc, idx) => (
                      <div key={idx} className="bg-[#090D16] border border-[#2C333F] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-400 text-[11px]">Test Case #{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!tc.isHidden}
                                onChange={(e) => {
                                  const updatedCases = [...qForm.codingDetails.testCases];
                                  updatedCases[idx].isHidden = e.target.checked;
                                  setQForm({
                                    ...qForm,
                                    codingDetails: { ...qForm.codingDetails, testCases: updatedCases }
                                  });
                                }}
                                className="accent-yellow-400"
                              />
                              Hidden Test Case
                            </label>
                            {qForm.codingDetails.testCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedCases = qForm.codingDetails.testCases.filter((_, i) => i !== idx);
                                  setQForm({
                                    ...qForm,
                                    codingDetails: { ...qForm.codingDetails, testCases: updatedCases }
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-[11px]"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] text-slate-400 mb-1">Input</span>
                            <textarea
                              rows={2}
                              value={tc.input}
                              onChange={(e) => {
                                const updatedCases = [...qForm.codingDetails.testCases];
                                updatedCases[idx].input = e.target.value;
                                setQForm({
                                  ...qForm,
                                  codingDetails: { ...qForm.codingDetails, testCases: updatedCases }
                                });
                              }}
                              placeholder="Input data"
                              className="w-full bg-[#161D29] border border-[#2C333F] rounded-lg p-2 font-mono text-[11px] text-white"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 mb-1">Expected Output</span>
                            <textarea
                              rows={2}
                              value={tc.expectedOutput}
                              onChange={(e) => {
                                const updatedCases = [...qForm.codingDetails.testCases];
                                updatedCases[idx].expectedOutput = e.target.value;
                                setQForm({
                                  ...qForm,
                                  codingDetails: { ...qForm.codingDetails, testCases: updatedCases }
                                });
                              }}
                              placeholder="Expected output"
                              className="w-full bg-[#161D29] border border-[#2C333F] rounded-lg p-2 font-mono text-[11px] text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Explanation / Solution (Optional)</label>
                <textarea
                  rows={2}
                  value={qForm.explanation}
                  onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                  placeholder="Explain why the answer is correct..."
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="bg-[#090D16] p-4 border-t border-[#2C333F] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsInlineDrawerOpen(false);
                  setEditingQuestionId(null);
                }}
                className="px-4 py-2 bg-[#161D29] text-slate-300 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              {!editingQuestionId && (
                <button
                  type="button"
                  disabled={isSubmittingQ}
                  onClick={() => saveInlineQuestion(true)}
                  className="px-4 py-2 bg-[#2C333F] hover:bg-[#3d4554] text-yellow-400 font-bold rounded-xl transition disabled:opacity-50"
                >
                  Save & Add Another
                </button>
              )}
              <button
                type="button"
                disabled={isSubmittingQ}
                onClick={() => saveInlineQuestion(false)}
                className="px-5 py-2 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold rounded-xl transition disabled:opacity-50"
              >
                {isSubmittingQ
                  ? 'Saving...'
                  : editingQuestionId
                  ? 'Update Question 🎯'
                  : 'Save & Add to Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION BANK PICKER MODAL */}
      {isBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#161D29] border border-[#2C333F] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-['Inter',sans-serif]">
            <div className="bg-[#090D16] p-4 border-b border-[#2C333F] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📚</span> Select Questions from Question Bank
              </h3>
              <button onClick={() => setIsBankOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="p-4 bg-[#090D16]/50 border-b border-[#2C333F] flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-slate-500 text-xs" />
                <input
                  type="text"
                  placeholder="Search question bank..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full bg-[#090D16] border border-[#2C333F] rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
              {bankLoading ? (
                <p className="text-center text-slate-400 py-8">Loading question bank...</p>
              ) : bankQuestions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No questions found in Question Bank for this context.</p>
              ) : (
                bankQuestions
                  .filter(q => q.title?.toLowerCase().includes(bankSearch.toLowerCase()))
                  .map((q) => {
                    const isChecked = pickerSelectedIds.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                          isChecked ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-[#090D16] border-[#2C333F] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPickerSelectedIds(prev => [...prev, q.id]);
                              } else {
                                setPickerSelectedIds(prev => prev.filter(id => id !== q.id));
                              }
                            }}
                            className="accent-[#FFD60A]"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{q.title}</p>
                            <span className="text-[10px] text-slate-400">[{q.type}] • {q.difficulty} • {q.marks} Marks</span>
                          </div>
                        </div>
                      </label>
                    );
                  })
              )}
            </div>

            <div className="bg-[#090D16] p-4 border-t border-[#2C333F] flex items-center justify-between">
              <span className="text-xs text-slate-400">{pickerSelectedIds.length} Selected</span>
              <button
                onClick={handleAddSelectedFromBank}
                className="px-5 py-2 bg-[#FFD60A] hover:bg-yellow-400 text-black font-bold rounded-xl text-xs"
              >
                Add Selected Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
