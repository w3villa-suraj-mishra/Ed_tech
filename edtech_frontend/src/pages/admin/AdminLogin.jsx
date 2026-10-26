import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkInit, adminLogin } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If already logged in
    if (localStorage.getItem('adminToken')) { navigate('/admin/dashboard', { replace: true }); return; }
    checkInit().then(({ data }) => {
      if (!data.usersExist) navigate('/admin/signup', { replace: true });
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Required';
    if (!form.password) errs.password = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.firstName}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]: '' })); };

  if (checking) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin Portal</h1>
            <p className="text-sm text-gray-500">Sign in to manage your platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="admin@example.com"
                className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-purple-600 transition-colors`} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••"
                className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-purple-600 transition-colors`} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-[#FFEE32] transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Admin access only. Students &amp; Instructors use the{' '}
            <a href="/login" className="text-gray-500 hover:text-gray-800 underline">main portal</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
