import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiChevronRight, FiCompass } from 'react-icons/fi';
import Sidebar from '../components/core/Dashboard/Sidebar';
import { sidebarLinks } from '../data/dashboard-links';
import { ACCOUNT_TYPE } from '../utils/constants';

const Dashboard = () => {
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading, user } = useSelector((state) => state.profile);
  const location = useLocation();

  if (profileLoading || authLoading) {
    return <div className="dashboard-loading"><div className="spinner" /></div>;
  }

  const isInstructor = (user?.accountType || user?.account_type) === ACCOUNT_TYPE.INSTRUCTOR;
  const currentLink = sidebarLinks.find((link) => (
    link.path === location.pathname || location.pathname.startsWith(`${link.path}/`)
  ));
  const currentTitle = location.pathname === '/dashboard/my-profile'
    ? 'My Profile'
    : location.pathname === '/dashboard/settings'
      ? 'Settings'
      : location.pathname === '/dashboard'
        ? 'Dashboard'
      : currentLink?.name || 'Workspace';

  return (
    <div className={`dashboard-layout ${isInstructor ? 'dashboard-layout-instructor' : 'dashboard-layout-learner'}`}>
      <div className="dashboard-frame">
        <Sidebar />
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="dashboard-breadcrumb">
              <span>Workspace</span><FiChevronRight /><strong>{currentTitle}</strong>
            </div>
            <div className="dashboard-topbar-actions">
              <span className="dashboard-role-pill"><FiCompass />{isInstructor ? 'Instructor studio' : 'Learning space'}</span>
              <Link to="/dashboard/my-profile" className="dashboard-topbar-avatar" aria-label="Open profile">
                {user?.image ? <img src={user.image} alt="" /> : (user?.firstName || user?.first_name || user?.name || 'U').charAt(0).toUpperCase()}
              </Link>
            </div>
          </header>
          <section className="dashboard-content" key={location.pathname}>
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
