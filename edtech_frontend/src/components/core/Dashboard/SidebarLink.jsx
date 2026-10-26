import React from 'react';
import * as VscIcons from 'react-icons/vsc';
import * as FiIcons from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { resetCourseState } from '../../../services/slices/courseSlice';

const SidebarLink = ({ link, iconName, onClick }) => {
  const Icon = FiIcons[iconName] || VscIcons[iconName] || FiIcons.FiBookOpen;
  const dispatch = useDispatch();
  const isNotification = link.name?.toLowerCase().includes('notification');

  const handleClick = (event) => {
    dispatch(resetCourseState());
    onClick?.(event);
  };

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      end={link.path === '/dashboard/global'}
      className={({ isActive }) => `dashboard-nav-link${isActive ? ' active' : ''}${onClick ? ' dashboard-drawer-link' : ''}`}
    >
      <span className="dashboard-nav-icon"><Icon /></span>
      <span className="dashboard-nav-text">{link.name}</span>
      {isNotification && <span className="dashboard-nav-dot" aria-label="Notifications" />}
    </NavLink>
  );
};

export default SidebarLink;
