import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, TableSkeleton } from '../../components/admin/AdminUI';
import { practiceEndpoints } from '../../services/apis';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import TestBuilderWizard from '../../components/common/TestBuilderWizard';

export default function AdminPracticeTests() {
  return (
    <AdminProtectedRoute>
      <AdminPracticeTestsInner />
    </AdminProtectedRoute>
  );
}

function AdminPracticeTestsInner() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const adminToken = localStorage.getItem('adminToken');

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await apiConnector('GET', practiceEndpoints.ADMIN_TESTS, null, { Authorization: `Bearer ${adminToken}` });
      if (res.data?.success) {
        setTests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await apiConnector('DELETE', `${practiceEndpoints.ADMIN_TESTS}/${id}`, null, { Authorization: `Bearer ${adminToken}` });
      toast.success('Test deleted');
      fetchTests();
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Practice Test Builder 📝</h1>
          <p className="text-xs text-gray-500 mt-1">Create and manage Daily Quizzes, Mock Tests, and Topic Tests.</p>
        </div>
        <button
          onClick={() => {
            setEditingTest(null);
            setIsWizardOpen(true);
          }}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-sm transition"
        >
          <FaPlus /> + Build New Test
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Practice Tests List</h2>
          <span className="text-xs text-purple-200">{tests.length} tests</span>
        </div>
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
              <tr>
                <th className="px-5 py-3.5">Test Title</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Questions</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">No tests created yet.</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{t.title}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        {t.testType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{t.questions?.length || t.numberOfQuestions || 0} Questions</td>
                    <td className="px-5 py-4 text-gray-600">{t.duration} Mins</td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingTest(t);
                          setIsWizardOpen(true);
                        }}
                        className="p-1.5 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition border border-transparent hover:border-purple-200"
                        title="Edit Test"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTest(t.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition border border-transparent hover:border-red-200"
                        title="Delete Test"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <TestBuilderWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingTest(null);
        }}
        token={adminToken}
        role="ADMIN"
        initialScope="GLOBAL"
        initialTest={editingTest}
        onSuccess={() => {
          fetchTests();
          setEditingTest(null);
        }}
      />
    </AdminLayout>
  );
}
