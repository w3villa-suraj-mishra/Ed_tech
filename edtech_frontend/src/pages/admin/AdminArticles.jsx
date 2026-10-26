import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, AdminInput, AdminTextarea, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getAdminArticles, createArticle, updateArticle, deleteArticle } from '../../services/operations/articleAPI';
import toast from 'react-hot-toast';

export default function AdminArticles() {
  return (
    <AdminProtectedRoute>
      <ArticlesInner />
    </AdminProtectedRoute>
  );
}

function ArticlesInner() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [delModal, setDelModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const [form, setForm] = useState({
    title: '',
    category: 'Engineering & Tech',
    readTime: '5 min read',
    author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
    summary: '',
    content: '',
    published: true,
  });

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await getAdminArticles(adminToken);
    setArticles(data || []);
    setLoading(false);
  }, [adminToken]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const setF = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error('Title, Summary, and Content are required.');
      return;
    }

    setSaving(true);
    const success = await createArticle(form, adminToken);
    setSaving(false);

    if (success) {
      setCreateModal(false);
      setForm({
        title: '',
        category: 'Engineering & Tech',
        readTime: '5 min read',
        author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
        summary: '',
        content: '',
        published: true,
      });
      loadArticles();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      toast.error('Title, Summary, and Content are required.');
      return;
    }

    setSaving(true);
    const success = await updateArticle(editModal.id, form, adminToken);
    setSaving(false);

    if (success) {
      setEditModal(null);
      loadArticles();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const success = await deleteArticle(delModal, adminToken);
    setDeleting(false);

    if (success) {
      setDelModal(null);
      loadArticles();
    }
  };

  const openEdit = (art) => {
    setForm({
      title: art.title || '',
      category: art.category || 'Engineering & Tech',
      readTime: art.readTime || '5 min read',
      author: art.author || 'Admin Team',
      summary: art.summary || '',
      content: art.content || '',
      published: art.published !== undefined ? art.published : true,
    });
    setEditModal(art);
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>📰 Articles Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Create, publish, and update frontend learn articles ({articles.length} total)
            </p>
          </div>
          <button
            onClick={() => {
              setForm({
                title: '',
                category: 'Engineering & Tech',
                readTime: '5 min read',
                author: `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim(),
                summary: '',
                content: '',
                published: true,
              });
              setCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>+ Create Article</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 flex items-center justify-between gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title or category..."
            className="w-full sm:w-80 bg-white border border-gray-300 rounded px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
          />
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={3} />
        ) : filteredArticles.length === 0 ? (
          <EmptyState
            message="No articles generated yet."
            action={
              <button
                onClick={() => setCreateModal(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-md shadow-sm"
              >
                Generate First Article
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                      {art.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        art.published
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {art.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                    <span className="font-medium">By {art.author}</span>
                    <span>{art.readTime}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(art)}
                      className="flex-1 py-1.5 rounded text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDelModal(art.id)}
                      className="flex-1 py-1.5 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE & EDIT MODALS */}
        {[
          { open: createModal, title: 'Generate New Article', onClose: () => setCreateModal(false), onSubmit: handleCreate },
          { open: !!editModal, title: 'Edit Article', onClose: () => setEditModal(null), onSubmit: handleEdit },
        ].map(({ open, title, onClose, onSubmit }) => (
          <AdminModal key={title} isOpen={open} title={title} onClose={onClose} size="lg">
            <form onSubmit={onSubmit} className="space-y-4">
              <AdminInput
                label="Article Title *"
                value={form.title}
                onChange={setF('title')}
                placeholder="e.g. Advanced System Design Patterns"
              />
              <div className="grid grid-cols-2 gap-3">
                <AdminInput
                  label="Category"
                  value={form.category}
                  onChange={setF('category')}
                  placeholder="e.g. Frontend / Backend"
                />
                <AdminInput
                  label="Read Time"
                  value={form.readTime}
                  onChange={setF('readTime')}
                  placeholder="e.g. 7 min read"
                />
              </div>
              <AdminInput
                label="Author Name"
                value={form.author}
                onChange={setF('author')}
                placeholder="e.g. Admin Team"
              />
              <AdminTextarea
                label="Short Summary *"
                value={form.summary}
                onChange={setF('summary')}
                placeholder="Enter brief teaser for the article card..."
                rows={2}
              />
              <AdminTextarea
                label="Full Article Content *"
                value={form.content}
                onChange={setF('content')}
                placeholder="Enter complete article text/markdown..."
                rows={6}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={setF('published')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="published" className="text-xs text-gray-800 cursor-pointer font-semibold">
                  Publish immediately to student dashboard
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </AdminModal>
        ))}

        <DeleteConfirm
          isOpen={!!delModal}
          title="Delete Article?"
          message="This article will be permanently deleted from the frontend."
          onClose={() => setDelModal(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      </div>
    </AdminLayout>
  );
}
