import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import DeleteConfirm from '../../components/admin/DeleteConfirm';
import { AdminProtectedRoute, StatusBadge, Pagination, AdminInput, AdminSelect, TableSkeleton, EmptyState } from '../../components/admin/AdminUI';
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  return <AdminProtectedRoute><UsersInner /></AdminProtectedRoute>;
}

const ROLES = ['Student', 'Instructor', 'Admin', 'Superadmin'];
const adminUser = () => JSON.parse(localStorage.getItem('adminUser') || '{}');
const isSuperAdmin = () => adminUser().accountType === 'Superadmin';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '', accountType: 'Student' };

function UsersInner() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTP]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [status, setStatus]   = useState('');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null); // user obj
  const [resetModal, setResetModal]   = useState(null); // user obj
  const [delModal, setDelModal]       = useState(null); // user id

  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState({});
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newPass, setNewPass] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getUsers({ page, limit: 15, search, role, status })
      .then(({ data }) => {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setTP(data.data.totalPages);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, role, status]);

  useEffect(() => { load(); }, [load]);

  // debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const validateForm = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (createModal && (!form.password || form.password.length < 6)) e.password = 'Min 6 chars';
    if (createModal && form.password !== form.passwordConfirmation) e.passwordConfirmation = 'Passwords do not match';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErr(errs); return; }
    setSaving(true);
    try {
      await createUser(form);
      toast.success('User created');
      setCreateModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (Object.keys(errs).length) { setFormErr(errs); return; }
    setSaving(true);
    try {
      await updateUser(editModal.id, { firstName: form.firstName, lastName: form.lastName, accountType: form.accountType, active: form.active });
      toast.success('User updated');
      setEditModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(delModal);
      toast.success('User deleted');
      setDelModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setDeleting(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try {
      await resetPassword(resetModal.id, { newPassword: newPass });
      toast.success('Password reset');
      setResetModal(null);
      setNewPass('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const openEdit = (u) => {
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, accountType: u.accountType, active: u.active });
    setFormErr({});
    setEditModal(u);
  };

  const setF = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setFormErr(p => ({ ...p, [k]: '' })); };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total users</p>
        </div>
        {isSuperAdmin() && (
          <button onClick={() => { setForm(EMPTY_FORM); setFormErr({}); setCreateModal(true); }}
            className="px-4 py-2 bg-purple-700 text-white rounded-md font-bold text-sm hover:bg-purple-800 transition-colors">
            + Add User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search name or email…"
          className="flex-1 min-w-[200px] bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600" />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="w-40 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-purple-600">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-40 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-purple-600">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-8">
        <div className="px-4 py-3 bg-purple-700 text-white border-b border-gray-200">
          <h2 className="text-[15px] font-bold">User Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-wide bg-gray-50">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
                {isSuperAdmin() && <th className="text-right px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={8} cols={5} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="No users found." /></td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="font-medium text-gray-800">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.accountType} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.active} /></td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  {isSuperAdmin() && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)}
                          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs transition-colors">Edit</button>
                        <button onClick={() => setResetModal(u)}
                          className="px-3 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors">Reset PW</button>
                        <button onClick={() => setDelModal(u.id)}
                          className="px-3 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Create Modal */}
      <AdminModal isOpen={createModal} title="Create User" onClose={() => setCreateModal(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="First Name" value={form.firstName} onChange={setF('firstName')} error={formErr.firstName} />
            <AdminInput label="Last Name" value={form.lastName} onChange={setF('lastName')} error={formErr.lastName} />
          </div>
          <AdminInput label="Email" type="email" value={form.email} onChange={setF('email')} error={formErr.email} />
          <AdminInput label="Password" type="password" value={form.password} onChange={setF('password')} error={formErr.password} />
          <AdminInput label="Confirm Password" type="password" value={form.passwordConfirmation} onChange={setF('passwordConfirmation')} error={formErr.passwordConfirmation} />
          <AdminSelect label="Role" value={form.accountType} onChange={setF('accountType')}>
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
            <option value="Admin">Admin</option>
            <option value="Superadmin">Superadmin</option>
          </AdminSelect>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 disabled:opacity-60 transition-colors">{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Edit Modal */}
      <AdminModal isOpen={!!editModal} title="Edit User" onClose={() => setEditModal(null)}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="First Name" value={form.firstName} onChange={setF('firstName')} error={formErr.firstName} />
            <AdminInput label="Last Name" value={form.lastName} onChange={setF('lastName')} error={formErr.lastName} />
          </div>
          <AdminSelect label="Role" value={form.accountType} onChange={setF('accountType')}>
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
            <option value="Admin">Admin</option>
            <option value="Superadmin">Superadmin</option>
          </AdminSelect>
          <AdminSelect label="Status" value={String(form.active)} onChange={(e) => setForm(p => ({ ...p, active: e.target.value === 'true' }))}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </AdminSelect>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 disabled:opacity-60 transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Reset Password Modal */}
      <AdminModal isOpen={!!resetModal} title={`Reset Password — ${resetModal?.firstName}`} onClose={() => { setResetModal(null); setNewPass(''); }}>
        <form onSubmit={handleReset} className="space-y-4">
          <AdminInput label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setResetModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-purple-700 text-white font-bold text-sm hover:bg-purple-800 disabled:opacity-60 transition-colors">{saving ? 'Resetting…' : 'Reset Password'}</button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirm */}
      <DeleteConfirm isOpen={!!delModal} title="Delete User?" message="This will permanently delete the user and all their data." onClose={() => setDelModal(null)} onConfirm={handleDelete} loading={deleting} />
    </AdminLayout>
  );
}
