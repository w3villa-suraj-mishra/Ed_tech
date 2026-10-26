import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminProtectedRoute, StatCard, TableSkeleton } from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/AdminUI';
import { getDashboardStats } from '../../services/admin/adminAPI';

export default function AdminDashboard() {
  return <AdminProtectedRoute><DashboardInner /></AdminProtectedRoute>;
}

function DashboardInner() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => {
        if (!data?.success || !data?.data) {
          throw new Error(data?.message || 'The dashboard returned an invalid response.');
        }
        setStats(data.data);
        setLoadError('');
      })
      .catch((error) => {
        setLoadError(error.response?.data?.message || error.message || 'Could not load admin dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n?.toLocaleString() ?? '—';

  return (
    <AdminLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, <span className="text-purple-600">{adminUser.firstName}</span> 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening on your platform today.</p>
      </div>

      {loadError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard data: {loadError}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Users"      value={fmt(stats?.totalUsers)}       icon="👥" color="blue" />
            <StatCard label="Students"         value={fmt(stats?.totalStudents)}     icon="🎓" color="blue" />
            <StatCard label="Instructors"      value={fmt(stats?.totalInstructors)}  icon="👨‍🏫" color="green" />
            <StatCard label="Admins"           value={fmt(stats?.totalAdmins)}       icon="🛡️"  color="yellow" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Courses"    value={fmt(stats?.totalCourses)}      icon="📚" color="blue" />
            <StatCard label="Published"        value={fmt(stats?.publishedCourses)}  icon="✅" color="green" />
            <StatCard label="Enrollments"      value={fmt(stats?.totalEnrollments)}  icon="📋" color="blue" />
            <StatCard label="Reviews"          value={fmt(stats?.totalReviews)}      icon="⭐" color="yellow" />
          </div>
        </>
      )}

      {/* Recent rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Courses</h2>
            <Link to="/admin/courses" className="text-xs text-purple-600 hover:underline font-semibold">View all →</Link>
          </div>
          {loading ? <TableSkeleton rows={5} cols={3} /> : (
            <div className="space-y-3">
              {(stats?.recentCourses || []).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-700 truncate">{c.courseName}</p>
                    <p className="text-xs text-gray-500">
                      {c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : '—'}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {!stats?.recentCourses?.length && <p className="text-sm text-gray-500">No courses yet.</p>}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Users</h2>
            <Link to="/admin/users" className="text-xs text-purple-600 hover:underline font-semibold">View all →</Link>
          </div>
          {loading ? <TableSkeleton rows={5} cols={3} /> : (
            <div className="space-y-3">
              {(stats?.recentUsers || []).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-700 truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <StatusBadge status={u.accountType} />
                </div>
              ))}
              {!stats?.recentUsers?.length && <p className="text-sm text-gray-500">No users yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
