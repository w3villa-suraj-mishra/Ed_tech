import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkInit, adminSetup } from '../../services/admin/adminAPI';
import toast from 'react-hot-toast';

export default function AdminSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkInit().then(({ data }) => {
      if (data.usersExist) navigate('/admin/login', { replace: true });
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.passwordConfirmation) e.passwordConfirmation = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await adminSetup(form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      toast.success('Superadmin account created!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
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
        {/* Card */}
        <div className="bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center mx-auto mb-4 text-3xl">⚡</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">First Time Setup</h1>
            <p className="text-sm text-gray-500">Create your Superadmin account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="John"
                  className={`w-full bg-white border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-purple-600`} />
                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Doe"
                  className={`w-full bg-white border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-purple-600`} />
                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="admin@example.com"
                className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-purple-600`} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters"
                className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-purple-600`} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
              <input type="password" value={form.passwordConfirmation} onChange={set('passwordConfirmation')} placeholder="Repeat password"
                className={`w-full bg-white border ${errors.passwordConfirmation ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:border-purple-600`} />
              {errors.passwordConfirmation && <p className="text-xs text-red-400 mt-1">{errors.passwordConfirmation}</p>}
            </div>

            <div className="bg-purple-600/5 border border-purple-600/20 rounded-xl p-3 text-xs text-gray-500">
              This account will be assigned the <strong className="text-purple-600">Superadmin</strong> role automatically.
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-[#FFEE32] transition-colors disabled:opacity-60">
              {loading ? 'Creating…' : 'Create Superadmin Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
