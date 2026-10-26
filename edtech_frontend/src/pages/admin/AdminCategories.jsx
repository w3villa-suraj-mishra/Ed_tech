import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, AdminInput, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  return <AdminProtectedRoute><CategoriesInner /></AdminProtectedRoute>;
}

function CategoriesInner() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchInput, setSI]  = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [delModal, setDelModal]       = useState(null);
  const [form, setForm]               = useState({ name: '', description: '' });
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const isSA = JSON.parse(localStorage.getItem('adminUser') || '{}').accountType === 'Superadmin';

  const load = useCallback(() => {
    setLoading(true);
    getCategories({ search })
      .then(({ data }) => setCats(data.data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(t); }, [searchInput]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await createCategory(form);
      toast.success('Category created');
      setCreateModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      await updateCategory(editModal.id, form);
      toast.success('Category updated');
      setEditModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(delModal);
      toast.success('Category deleted');
      setDelModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditModal(c); };
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>🏷️ Course Categories</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage category taxonomy ({cats.length} total categories)
            </p>
          </div>
          <button
            onClick={() => { setForm({ name: '', description: '' }); setCreateModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>+ Add Category</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex items-center justify-between gap-4">
          <input
            value={searchInput}
            onChange={e => setSI(e.target.value)}
            placeholder="Search categories…"
            className="w-full sm:w-80 bg-white border border-gray-300 rounded px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
          />
        </div>

        {loading ? <TableSkeleton rows={6} cols={3} /> : cats.length === 0 ? (
          <EmptyState message="No categories found." action={
            <button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-md shadow-sm">
              Create First Category
            </button>
          } />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      {c.courseCount || 0} courses
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4 line-clamp-2">{c.description || 'No description provided'}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(c)}
                    className="flex-1 py-1.5 rounded text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  {isSA && (
                    <button
                      onClick={() => setDelModal(c.id)}
                      className="flex-1 py-1.5 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit shared form */}
        {[{ open: createModal, title: 'Create Category', onClose: () => setCreateModal(false), onSubmit: handleCreate },
          { open: !!editModal, title: 'Edit Category', onClose: () => setEditModal(null), onSubmit: handleEdit }
        ].map(({ open, title, onClose, onSubmit }) => (
          <AdminModal key={title} isOpen={open} title={title} onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-4">
              <AdminInput label="Name" value={form.name} onChange={setF('name')} placeholder="e.g. Web Development" />
              <AdminTextarea label="Description (optional)" value={form.description} onChange={setF('description')} placeholder="Brief description…" rows={3} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </AdminModal>
        ))}

        <DeleteConfirm isOpen={!!delModal} title="Delete Category?" message="Courses in this category may also be affected." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
      </div>
    </AdminLayout>
  );
}
