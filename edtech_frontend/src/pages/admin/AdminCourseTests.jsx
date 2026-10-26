import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import AdminModal from '../../components/admin/AdminModal';
import { practiceEndpoints, courseEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEye, FaEdit, FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';
import TestBuilderWizard from '../../components/common/TestBuilderWizard';

const TEST_CATEGORIES = [
  'All',
  'MCQ',
  'Coding',
  'Topic Practice',
  'Mock Test',
  'Interview Test',
  'Daily Quiz'
];

export default function AdminCourseTests() {
  return (
    <AdminProtectedRoute>
      <AdminCourseTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminCourseTestsInner() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTestForStats, setSelectedTestForStats] = useState(null);

  const [editingTest, setEditingTest] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTestIds, setSelectedTestIds] = useState([]);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    testType: 'MCQ',
    duration: 20,
    totalMarks: 20,
    passingPercentage: 50,
    status: 'published',
    selectedQuestionIds: [],
  });

  const adminToken = localStorage.getItem('adminToken');

  const fetchCourses = async () => {
    try {
      const res = await apiConnector('GET', courseEndpoints.GET_ALL_COURSE_API, null, null, { includeUnpublished: 'true', limit: 'all' });
      if (res.data?.success) {
        const list = res.data.data || [];
        setCourses(list);
        if (list.length > 0) {
          const firstId = list[0].id || list[0]._id;
          setFormData((prev) => ({ ...prev, courseId: firstId }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseTests = async (cId) => {
    setLoading(true);
    try {
      const url = cId
        ? `${practiceEndpoints.ADMIN_TESTS}?scope=COURSE&courseId=${cId}`
        : `${practiceEndpoints.ADMIN_TESTS}?scope=COURSE`;
      const res = await apiConnector('GET', url, null, {
        Authorization: `Bearer ${adminToken}`
      });
      if (res.data?.success) {
        const testData = res.data.data || [];
        setTests(testData);
      }
    } catch (err) {
      console.error('Fetch course tests error:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourseTests(selectedCourseId);
  }, [selectedCourseId]);

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course test?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_TESTS}/${id}`, null, { Authorization: `Bearer ${adminToken}` });
      toast.success('Course test deleted');
      setSelectedTestIds((prev) => prev.filter((tId) => tId !== id));
      fetchCourseTests(selectedCourseId);
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const handleBulkDeleteTests = async () => {
    if (selectedTestIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTestIds.length} selected test(s)?`)) return;
    try {
      const res = await apiConnector(
        'POST',
        practiceEndpoints.ADMIN_BULK_DELETE_TESTS,
        { testIds: selectedTestIds },
        { Authorization: `Bearer ${adminToken}` }
      );
      if (res.data?.success) {
        toast.success(res.data.message || 'Selected tests deleted successfully!');
        setSelectedTestIds([]);
        fetchCourseTests(selectedCourseId);
      }
    } catch (err) {
      toast.error('Failed to delete selected tests');
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.testType === selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-lg text-lg">🎓</span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Course-Specific Practice Tests</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Exclusive tests restricted to enrolled students of the specific course.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTestIds.length > 0 && (
            <button
              onClick={handleBulkDeleteTests}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md flex items-center gap-2 shadow-sm transition"
            >
              <FaTrash /> Delete Selected ({selectedTestIds.length})
            </button>
          )}
          <button
            onClick={() => {
              setEditingTest(null);
              setIsWizardOpen(true);
            }}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-md flex items-center gap-2 shadow-sm transition"
          >
            <FaPlus /> + Build Course Test
          </button>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {TEST_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-700 text-white shadow-sm font-bold'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Selector & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Select Active Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-600"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.courseName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Search Tests</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Course Tests List</h2>
          <span className="text-xs text-purple-200">{filteredTests.length} tests</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredTests.length > 0 && filteredTests.every(t => selectedTestIds.includes(t.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const fIds = filteredTests.map(t => t.id);
                        setSelectedTestIds(prev => Array.from(new Set([...prev, ...fIds])));
                      } else {
                        const fIds = filteredTests.map(t => t.id);
                        setSelectedTestIds(prev => prev.filter(id => !fIds.includes(id)));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Category / Type</th>
                <th className="px-5 py-3.5">Questions</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <FaGraduationCap className="mx-auto text-3xl mb-2 opacity-30" />
                    No tests found for the selected course and category.
                  </td>
                </tr>
              ) : (
                filteredTests.map((t) => (
                  <tr key={t.id} className={`transition ${selectedTestIds.includes(t.id) ? 'bg-purple-50/70 hover:bg-purple-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTestIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTestIds(prev => [...prev, t.id]);
                          } else {
                            setSelectedTestIds(prev => prev.filter(id => id !== t.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {t.title}
                      {t.description && <p className="text-[11px] font-normal text-gray-500 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {t.testType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{t.questions?.length || t.numberOfQuestions || 0} Questions</td>
                    <td className="px-5 py-4 text-gray-600">{t.duration} Mins</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTestForStats(t)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition border border-transparent hover:border-gray-200"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTest(t);
                            setIsWizardOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition border border-transparent hover:border-purple-200"
                          title="Edit Course Test"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(t.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition border border-transparent hover:border-red-200"
                          title="Delete Test"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>



      {/* Stats Modal */}
      {selectedTestForStats && (
        <AdminModal isOpen={!!selectedTestForStats} title={`Course Test Details: ${selectedTestForStats.title}`} onClose={() => setSelectedTestForStats(null)}>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold">Scope</p>
                <p className="font-bold text-purple-700">COURSE-SPECIFIC</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold">Total Questions</p>
                <p className="font-bold text-gray-900">{selectedTestForStats.questions?.length || selectedTestForStats.numberOfQuestions || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold">Duration</p>
                <p className="font-bold text-gray-900">{selectedTestForStats.duration} Mins</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold">Passing Mark</p>
                <p className="font-bold text-emerald-700">{selectedTestForStats.passingPercentage}%</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTestForStats(null)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-md font-bold text-xs shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}
      {/* TEST BUILDER WIZARD MODAL */}
      <TestBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingTest(null);
        }}
        token={adminToken}
        role="ADMIN"
        courses={courses}
        initialScope="COURSE"
        initialCourseId={selectedCourseId}
        initialTest={editingTest}
        onSuccess={(createdOrUpdatedTest) => {
          if (createdOrUpdatedTest?.courseId) {
            setSelectedCourseId(createdOrUpdatedTest.courseId);
          }
          fetchCourseTests(createdOrUpdatedTest?.courseId || selectedCourseId);
          setEditingTest(null);
        }}
      />
    </AdminLayout>
  );
}
