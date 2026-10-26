import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiLogOut } from 'react-icons/fi';
import { sidebarLinks } from '../../../data/dashboard-links';
import { logout } from '../../../services/operations/authAPI';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import ConfirmationModal from '../../Common/ConfirmationModal';
import SidebarLink from './SidebarLink';

const Sidebar = () => {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  const userRole = user?.accountType || user?.account_type;
  const isInstructor = userRole === ACCOUNT_TYPE.INSTRUCTOR;

  const visibleLinks = useMemo(() => sidebarLinks.filter((link) => {
    if (link.type === ACCOUNT_TYPE.STUDENT && isInstructor) return false;
    if (link.type === ACCOUNT_TYPE.INSTRUCTOR && !isInstructor) return false;
    return true;
  }), [isInstructor]);

  const primaryLinks = visibleLinks.filter((link) => !['Notifications', 'Help & Support', 'Articles'].includes(link.name));
  const resourceLinks = visibleLinks.filter((link) => ['Notifications', 'Help & Support', 'Articles'].includes(link.name));

  if (profileLoading || authLoading) {
    return <div className="dashboard-sidebar-loading"><div className="spinner mx-auto" /></div>;
  }

  const openLogoutConfirmation = () => setConfirmationModal({
    text1: 'Sign out of your workspace?',
    text2: 'You can sign back in anytime to continue where you left off.',
    btn1Text: 'Sign out',
    btn2Text: 'Stay here',
    btn1Handler: () => dispatch(logout(navigate)),
    btn2Handler: () => setConfirmationModal(null),
  });

  return (
    <>
      <aside className={`dashboard-sidebar ${isInstructor ? 'is-instructor' : 'is-learner'}`}>
        <nav className="dashboard-nav" aria-label="Workspace navigation">
          <p className="dashboard-nav-label"><FiGrid /> WORKSPACE</p>
          <div className="dashboard-nav-list">
            {primaryLinks.map((link) => <SidebarLink key={link.id} link={link} iconName={link.icon} />)}
          </div>
          <p className="dashboard-nav-label dashboard-nav-label-secondary">YOUR ACCOUNT</p>
          <div className="dashboard-nav-list">
            <SidebarLink link={{ name: 'My Profile', path: '/dashboard/my-profile' }} iconName="FiUser" />
            {resourceLinks.map((link) => <SidebarLink key={link.id} link={link} iconName={link.icon} />)}
            <SidebarLink link={{ name: 'Settings', path: '/dashboard/settings' }} iconName="FiSettings" />
          </div>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-plan-card">
            <span className="dashboard-plan-spark">✦</span>
            <div><strong>{isInstructor ? 'Creator studio' : 'Keep your streak'}</strong><small>{isInstructor ? 'Build your next course' : 'A little progress adds up'}</small></div>
          </div>
          <button type="button" onClick={openLogoutConfirmation} className="dashboard-logout"><FiLogOut /><span>Sign out</span></button>
        </div>
      </aside>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
};

export default Sidebar;
