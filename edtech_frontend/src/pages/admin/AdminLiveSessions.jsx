import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, AdminInput, AdminSelect, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getLiveSessions, createLiveSession, updateLiveSession, deleteLiveSession, getCourses } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminLiveSessions() {
  return <AdminProtectedRoute><LiveSessionsInner /></AdminProtectedRoute>;
}

const EMPTY = { courseId: '', sessionName: '', startTime: '', endTime: '', status: 'Scheduled' };

function LiveSessionsInner() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [totalPages, setTP] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [delModal, setDelModal]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getLiveSessions({ page, limit: 15 })
      .then(({ data }) => { setSessions(data.data.sessions); setTotal(data.data.total); setTP(data.data.totalPages); })
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCourses({ limit: 200 }).then(({ data }) => setCourses(data.data.courses)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.sessionName) { toast.error('Course and session name required'); return; }
    setSaving(true);
    try { await createLiveSession(form); toast.success('Session created'); setCreateModal(false); setForm(EMPTY); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateLiveSession(editModal.id, form); toast.success('Session updated'); setEditModal(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteLiveSession(delModal); toast.success('Session deleted'); setDelModal(null); load(); }
    catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const openEdit = (s) => { setForm({ courseId: s.courseId, sessionName: s.sessionName, startTime: s.startTime?.slice(0,16) || '', endTime: s.endTime?.slice(0,16) || '', status: s.status }); setEditModal(s); };
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const SessionForm = ({ onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <AdminSelect label="Course" value={form.courseId} onChange={setF('courseId')}>
        <option value="">Select course</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
      </AdminSelect>
      <AdminInput label="Session Name" value={form.sessionName} onChange={setF('sessionName')} placeholder="e.g. Live Q&A Week 1" />
      <div className="grid grid-cols-2 gap-3">
        <AdminInput label="Start Time" type="datetime-local" value={form.startTime} onChange={setF('startTime')} />
        <AdminInput label="End Time" type="datetime-local" value={form.endTime} onChange={setF('endTime')} />
      </div>
      <AdminSelect label="Status" value={form.status} onChange={setF('status')}>
        <option value="Scheduled">Scheduled</option>
        <option value="Live">Live</option>
        <option value="Ended">Ended</option>
      </AdminSelect>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setCreateModal(false); setEditModal(null); }} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-[#FFEE32] disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>📹 Live Sessions</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Schedule and monitor live classes ({total} total sessions)
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY); setCreateModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>+ Schedule Session</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Upcoming & Past Sessions</h2>
            <span className="text-xs text-purple-200">{total} sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3.5">Session</th>
                  <th className="text-left px-5 py-3.5">Course</th>
                  <th className="text-left px-5 py-3.5">Start</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-6"><TableSkeleton rows={6} cols={5} /></td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12"><EmptyState message="No sessions found." /></td></tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900">{s.sessionName}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.Course?.courseName || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{s.startTime ? new Date(s.startTime).toLocaleString() : '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(s)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDelModal(s.id)}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>

        <AdminModal isOpen={createModal} title="Schedule Live Session" onClose={() => setCreateModal(false)}>
          <SessionForm onSubmit={handleCreate} />
        </AdminModal>
        <AdminModal isOpen={!!editModal} title="Edit Live Session" onClose={() => setEditModal(null)}>
          <SessionForm onSubmit={handleEdit} />
        </AdminModal>
        <DeleteConfirm isOpen={!!delModal} title="Delete Session?" message="This live session will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
      </div>
    </AdminLayout>
  );
}
