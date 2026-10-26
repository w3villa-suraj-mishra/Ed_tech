import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getReviews, deleteReview } from '../../services/admin/adminAPI';
import { BASE_URL } from '../../services/apis';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  return <AdminProtectedRoute><ReviewsInner /></AdminProtectedRoute>;
}

function ReviewsInner() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [delModal, setDelModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let combinedReviews = [];
    const seenIds = new Set();

    // 1. Fetch public course reviews
    try {
      const pubRes = await axios.get(`${BASE_URL}/course/getReviews`);
      const pubData = pubRes.data;
      const pubList = pubData?.data?.reviews || pubData?.data || pubData?.reviews || (Array.isArray(pubData) ? pubData : []);
      if (Array.isArray(pubList)) {
        pubList.forEach((r, idx) => {
          const key = r._id || r.id || `pub-${idx}-${r.user?.firstName || 'u'}`;
          if (!seenIds.has(String(key))) {
            seenIds.add(String(key));
            combinedReviews.push(r);
          }
        });
      }
    } catch (pubErr) {
      console.log('Failed to fetch public reviews:', pubErr);
    }

    // 2. Fetch admin route reviews
    try {
      const res = await getReviews({ page: 1, limit: 100 });
      const data = res.data;
      const revList = data?.data?.reviews || data?.reviews || (Array.isArray(data?.data) ? data.data : []);
      if (Array.isArray(revList)) {
        revList.forEach((r, idx) => {
          const key = r._id || r.id || `adm-${idx}`;
          if (!seenIds.has(String(key))) {
            seenIds.add(String(key));
            combinedReviews.push(r);
          }
        });
      }
    } catch (err) {
      console.log('Admin route reviews empty/failed:', err);
    }

    setReviews(combinedReviews);
    setTotal(combinedReviews.length);
    setTP(Math.ceil(combinedReviews.length / 15) || 1);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(delModal);
      toast.success('Review deleted');
      setDelModal(null);
      load();
    } catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Reviews & Ratings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} total reviews</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Reviews List</h2>
          <span className="text-xs text-purple-200">{total} reviews</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide bg-gray-50">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Rating</th>
                <th className="text-left px-5 py-3">Review</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
               : reviews.length === 0 ? <tr><td colSpan={6}><EmptyState message="No reviews found." /></td></tr>
               : reviews.map((r, idx) => {
                  const studentName = r.user 
                    ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || r.user.email
                    : (r.userName || 'Suraj Mishra');
                  const courseTitle = r.course?.courseName || r.Course?.courseName || r.courseName || '—';
                  const reviewId = r._id || r.id || idx;
                  const dateRaw = r.updatedAt || r.createdAt;
                  const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString() : new Date().toLocaleDateString();

                  return (
                    <tr key={reviewId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">{studentName}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[150px] truncate">{courseTitle}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-purple-600 text-xs">{stars(r.rating || 0)}</span>
                        <span className="text-gray-500 text-xs ml-1">({r.rating})</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">{r.review || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500">{dateStr}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setDelModal(reviewId)} className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer">Delete</button>
                      </td>
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
      <DeleteConfirm isOpen={!!delModal} title="Delete Review?" message="This review will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
