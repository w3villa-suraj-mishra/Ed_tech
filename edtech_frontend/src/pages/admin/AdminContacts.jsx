import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getContacts, updateContactStatus, deleteContact } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  return <AdminProtectedRoute><ContactsInner /></AdminProtectedRoute>;
}

function ContactsInner() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTP]     = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchInput, setSI]    = useState('');
  const [statusFilter, setSF]   = useState('');

  const [viewModal, setViewModal] = useState(null);
  const [delModal, setDelModal]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getContacts({ page, limit: 15, search, status: statusFilter })
      .then(({ data }) => {
        setContacts(data.data.contacts);
        setTotal(data.data.total);
        setTP(data.data.totalPages);
      })
      .catch(() => toast.error('Failed to load contact submissions'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400); return () => clearTimeout(t); }, [searchInput]);

  const handleStatusChange = async (contact, newStatus) => {
    try {
      await updateContactStatus(contact.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      load();
      if (viewModal?.id === contact.id) {
        setViewModal(p => ({ ...p, status: newStatus }));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContact(delModal);
      toast.success('Entry deleted');
      setDelModal(null);
      load();
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Contact Submissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <input
          value={searchInput}
          onChange={e => setSI(e.target.value)}
          placeholder="Search name, email or message…"
          className="flex-1 min-w-[200px] bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
        />
        <select
          value={statusFilter}
          onChange={e => { setSF(e.target.value); setPage(1); }}
          className="w-40 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-purple-600"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Ignored">Ignored</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 bg-purple-700 text-white border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Contact Inquiries</h2>
          <span className="text-xs text-purple-200">{contacts.length} inquiries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide bg-gray-50">
                <th className="text-left px-5 py-3">User Details</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Message</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No contact inquiries found." /></td></tr>
              ) : contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {c.phoneNo ? `${c.countrycode || ''} ${c.phoneNo}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-[240px] truncate">
                    {c.message}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewModal(c)} className="px-3 py-1 rounded text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer">
                        View
                      </button>
                      {c.status !== 'Resolved' && (
                        <button onClick={() => handleStatusChange(c, 'Resolved')} className="px-3 py-1 rounded text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer">
                          Resolve
                        </button>
                      )}
                      {isSA && (
                        <button onClick={() => setDelModal(c.id)} className="px-3 py-1 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-200">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* View Details Modal */}
      <AdminModal isOpen={!!viewModal} title="Inquiry Details" onClose={() => setViewModal(null)}>
        {viewModal && (
          <div className="space-y-4 text-sm text-gray-800">
            <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold">{viewModal.firstName} {viewModal.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold">{viewModal.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold">{viewModal.phoneNo ? `${viewModal.countrycode || ''} ${viewModal.phoneNo}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={viewModal.status} />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <div className="bg-white p-4 rounded-xl border border-gray-200 whitespace-pre-wrap leading-relaxed">
                {viewModal.message}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleStatusChange(viewModal, 'Pending')}
                className={`flex-1 py-2 rounded-md border text-xs font-bold transition-colors ${viewModal.status === 'Pending' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Mark Pending
              </button>
              <button
                onClick={() => handleStatusChange(viewModal, 'Resolved')}
                className={`flex-1 py-2 rounded-md border text-xs font-bold transition-colors ${viewModal.status === 'Resolved' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange(viewModal, 'Ignored')}
                className={`flex-1 py-2 rounded-md border text-xs font-bold transition-colors ${viewModal.status === 'Ignored' ? 'bg-gray-100 border-gray-400 text-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <DeleteConfirm isOpen={!!delModal} title="Delete Contact Entry?" message="This contact submission will be permanently removed." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
