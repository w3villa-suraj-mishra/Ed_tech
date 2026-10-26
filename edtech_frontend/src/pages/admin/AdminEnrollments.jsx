import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getEnrollments, deleteEnrollment } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminEnrollments() {
  return <AdminProtectedRoute><EnrollmentsInner /></AdminProtectedRoute>;
}

function EnrollmentsInner() {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [delModal, setDelModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getEnrollments({ page, limit: 15 })
      .then(({ data }) => { setEnrollments(data.data.enrollments); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEnrollment(delModal);
      toast.success('Enrollment removed');
      setDelModal(null);
      load();
    } catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Enrollments</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} total enrollments</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Enrollment Details</h2>
          <span className="text-xs text-purple-200">{total} enrollments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide bg-gray-50">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Plan / Status</th>
                <th className="text-left px-5 py-3">Pricing</th>
                <th className="text-left px-5 py-3">Activated / Expires</th>
                {isSA && <th className="text-right px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
               : enrollments.length === 0 ? <tr><td colSpan={6}><EmptyState message="No enrollments found." /></td></tr>
               : enrollments.map(e => {
                const instructor = (e.course || e.Course)?.instructor;
                const planName = (e.plan || 'free').toUpperCase();
                const isExpired = e.plan === 'silver' && e.expiresAt && new Date(e.expiresAt) <= new Date();
                const statusLabel = isExpired ? 'EXPIRED' : (e.status || 'ACTIVE').toUpperCase();

                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">
                        {(e.user || e.User) ? `${(e.user || e.User).firstName || ''} ${(e.user || e.User).lastName || ''}` : '—'}
                      </p>
                      <p className="text-xs text-gray-500">{(e.user || e.User)?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <p className="font-medium text-gray-800">{(e.course || e.Course)?.courseName || '—'}</p>
                      <p className="text-xs text-gray-500">Instructor: {instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}` : '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          e.plan === 'gold' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                          e.plan === 'silver' ? 'bg-sky-50 text-sky-800 border border-sky-300' :
                          'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {planName}
                        </span>
                        <span className={`text-[10px] font-bold ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      <p>Paid: <strong className="text-gray-900 font-bold">₹{e.purchasePrice || 0}</strong></p>
                      <p className="text-[11px] text-gray-500">Course: ₹{e.coursePrice || (e.course || e.Course)?.price || 0}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      <p>Start: {new Date(e.activatedAt || e.createdAt).toLocaleDateString()}</p>
                      <p className={isExpired ? 'text-rose-600 font-semibold' : ''}>
                        Expires: {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : 'Never'}
                      </p>
                    </td>
                    {isSA && <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setDelModal(e.id)} className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer">Unenroll</button>
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-200">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
      <DeleteConfirm isOpen={!!delModal} title="Remove Enrollment?" message="The student will lose access to this course." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
