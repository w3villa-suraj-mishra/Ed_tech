import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkInit } from '../../services/admin/adminAPI';

// Root /admin redirect — checks init state and routes accordingly
export default function AdminIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) { navigate('/admin/dashboard', { replace: true }); return; }
    checkInit()
      .then(({ data }) => {
        navigate(data.usersExist ? '/admin/login' : '/admin/signup', { replace: true });
      })
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
}
