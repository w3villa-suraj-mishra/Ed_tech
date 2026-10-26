import { apiConnector } from '../apiConnector';
import { announcementEndpoints } from '../apis';

export const getAdminAnnouncements = async (params = {}) => {
  const token = localStorage.getItem('adminToken');
  const queryParams = new URLSearchParams(params).toString();
  const url = `${announcementEndpoints.ADMIN_ANNOUNCEMENTS_API}${queryParams ? `?${queryParams}` : ''}`;
  return apiConnector('GET', url, null, {
    Authorization: `Bearer ${token}`
  });
};

export const getAdminAnnouncementById = async (id) => {
  const token = localStorage.getItem('adminToken');
  return apiConnector('GET', `${announcementEndpoints.ADMIN_ANNOUNCEMENTS_API}/${id}`, null, {
    Authorization: `Bearer ${token}`
  });
};

export const createAdminAnnouncement = async (data) => {
  const token = localStorage.getItem('adminToken');
  return apiConnector('POST', announcementEndpoints.ADMIN_ANNOUNCEMENTS_API, data, {
    Authorization: `Bearer ${token}`
  });
};

export const updateAdminAnnouncement = async (id, data) => {
  const token = localStorage.getItem('adminToken');
  return apiConnector('PUT', `${announcementEndpoints.ADMIN_ANNOUNCEMENTS_API}/${id}`, data, {
    Authorization: `Bearer ${token}`
  });
};

export const updateAdminAnnouncementStatus = async (id, status) => {
  const token = localStorage.getItem('adminToken');
  return apiConnector('PATCH', `${announcementEndpoints.ADMIN_ANNOUNCEMENTS_API}/${id}/status`, { status }, {
    Authorization: `Bearer ${token}`
  });
};

export const deleteAdminAnnouncement = async (id) => {
  const token = localStorage.getItem('adminToken');
  return apiConnector('DELETE', `${announcementEndpoints.ADMIN_ANNOUNCEMENTS_API}/${id}`, null, {
    Authorization: `Bearer ${token}`
  });
};

export const getActiveAnnouncement = async (userToken = null) => {
  const token = userToken || localStorage.getItem('token') || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null);
  const headers = token && token !== 'null' ? { Authorization: `Bearer ${token}` } : {};
  return apiConnector('GET', announcementEndpoints.GET_ACTIVE_ANNOUNCEMENT_API, null, headers, null, { skipAuthRedirect: true });
};

export const dismissAnnouncement = async (announcementId, userToken = null) => {
  const token = userToken || localStorage.getItem('token');
  const headers = token && token !== 'null' ? { Authorization: `Bearer ${token}` } : {};
  return apiConnector('POST', `${announcementEndpoints.DISMISS_ANNOUNCEMENT_API}/${announcementId}/dismiss`, null, headers, null, { skipAuthRedirect: true });
};
