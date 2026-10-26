import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    Published:  'bg-emerald-50 text-emerald-700 border-emerald-300',
    Draft:      'bg-amber-50 text-amber-800 border-amber-300',
    Superadmin: 'bg-purple-50 text-purple-700 border-purple-300',
    Admin:      'bg-purple-50 text-purple-700 border-purple-300',
    Instructor: 'bg-sky-50 text-sky-800 border-sky-300',
    Student:    'bg-gray-100 text-gray-700 border-gray-300',
    Scheduled:  'bg-sky-50 text-sky-800 border-sky-300',
    Live:       'bg-rose-50 text-rose-700 border-rose-300',
    Ended:      'bg-gray-100 text-gray-600 border-gray-300',
    Active:     'bg-emerald-50 text-emerald-700 border-emerald-300',
    Inactive:   'bg-rose-50 text-rose-700 border-rose-300',
    true:       'bg-emerald-50 text-emerald-700 border-emerald-300',
    false:      'bg-rose-50 text-rose-700 border-rose-300',
  };
  const key = status === true ? 'true' : status === false ? 'false' : String(status);
  const cls = map[key] || 'bg-gray-100 text-gray-700 border-gray-300';
  const label = status === true ? 'Active' : status === false ? 'Inactive' : status;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
      >← Prev</button>
      <span className="text-xs font-medium text-gray-600">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
      >Next →</button>
    </div>
  );
}

export function AdminInput({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        {...props}
        className={`w-full bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function AdminSelect({ label, error, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        {...props}
        className={`w-full bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 text-gray-800 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function AdminTextarea({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors resize-none`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function AdminPanel({ title, children, variant = 'secondary', noPadding = false }) {
  const isPrimary = variant === 'primary';
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm mb-6 overflow-hidden">
      {title && (
        <div className={`px-4 py-2.5 ${isPrimary ? 'bg-purple-700 text-white border-b-0' : 'bg-white text-gray-800 border-b border-gray-200'}`}>
          <h2 className={`text-[15px] font-bold ${isPrimary ? 'text-white' : 'text-gray-700'}`}>{title}</h2>
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon, color = 'purple' }) {
  const colors = {
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    blue:   'bg-sky-50 text-sky-800 border-sky-200',
    sky:    'bg-sky-50 text-sky-800 border-sky-200',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    gray:   'bg-gray-50 text-gray-600 border-gray-100',
  };
  return (
    <div className={`border border-gray-200 rounded-2xl p-5 bg-white shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-[12px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <span className="text-3xl font-bold text-gray-800">{value ?? '—'}</span>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${colors[color] || colors.purple}`}>
        {icon}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message = 'No records found.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-gray-500 font-medium mb-4 text-sm">{message}</p>
      {action}
    </div>
  );
}

export function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('user') || '{}');

  if (!adminToken) {
    window.location.href = '/admin/login';
    return null;
  }
  
  if (user?.accountType !== 'Admin' && user?.accountType !== 'Superadmin') {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-3xl font-bold mb-4">✕</div>
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          You are currently logged in as a <strong>{user?.accountType || 'Student/Instructor'}</strong>. Please log in with an Admin account to manage articles.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
          }}
          className="px-5 py-2.5 bg-[#FFD60A] text-[#000814] rounded-xl font-bold text-xs"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return children;
}
