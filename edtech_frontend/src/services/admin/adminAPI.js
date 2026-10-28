import axios from 'axios';

const BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
const inFlightGetRequests = new Map();

const getToken = () => localStorage.getItem('adminToken');

const api = axios.create({ baseURL: `${BASE}/admin` });

const get = (url, config = {}) => {
  const key = JSON.stringify({
    url,
    params: config.params || null,
    token: getToken()
  });
  const pending = inFlightGetRequests.get(key);
  if (pending) return pending;

  const request = api.get(url, config);
  inFlightGetRequests.set(key, request);
  request.then(
    () => inFlightGetRequests.delete(key),
    () => inFlightGetRequests.delete(key)
  );
  return request;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isLoginUrl = err.config?.url?.includes('/login');
    if (err.response?.status === 401 && !isLoginUrl) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const checkInit       = ()        => get('/check-init');
export const adminSetup      = (data)    => api.post('/setup', data);
export const adminLogin      = (data)    => api.post('/login', data);
export const adminGetMe      = ()        => get('/me');

// ── Dashboard ─────────────────────────────────────────
export const getDashboardStats = ()      => get('/dashboard/stats');

// ── Users ─────────────────────────────────────────────
export const getUsers        = (p)       => get('/users', { params: p });
export const getUser         = (id)      => get(`/users/${id}`);
export const createUser      = (data)    => api.post('/users', data);
export const updateUser      = (id, d)   => api.put(`/users/${id}`, d);
export const deleteUser      = (id)      => api.delete(`/users/${id}`);
export const resetPassword   = (id, d)   => api.put(`/users/${id}/reset-password`, d);

// ── Categories ────────────────────────────────────────
export const getCategories   = (p)       => get('/categories', { params: p });
export const createCategory  = (data)    => api.post('/categories', data);
export const updateCategory  = (id, d)   => api.put(`/categories/${id}`, d);
export const deleteCategory  = (id)      => api.delete(`/categories/${id}`);

// ── Courses ───────────────────────────────────────────
export const getCourses      = (p)       => get('/courses', { params: p });
export const getCourse       = (id)      => get(`/courses/${id}`);
export const updateCourse    = (id, fd)  => api.put(`/courses/${id}`, fd);
export const updateCourseStatus = (id, s) => api.put(`/courses/${id}/status`, { status: s });
export const unpublishAllCourses = () => api.patch('/courses/unpublish-all');
export const deleteAllCourses = () => api.delete('/courses/all');
export const updateCoursePricing = (id, d) => api.patch(`/courses/${id}/pricing`, d);
export const deleteCourse    = (id)      => api.delete(`/courses/${id}`);

// ── Enrollments ───────────────────────────────────────
export const getEnrollments  = (p)       => get('/enrollments', { params: p });
export const deleteEnrollment = (id)     => api.delete(`/enrollments/${id}`);

// ── Reviews ───────────────────────────────────────────
export const getReviews      = (p)       => get('/reviews', { params: p });
export const deleteReview    = (id)      => api.delete(`/reviews/${id}`);

// ── Live Sessions ─────────────────────────────────────
export const getLiveSessions    = (p)    => get('/live-sessions', { params: p });
export const createLiveSession  = (d)    => api.post('/live-sessions', d);
export const updateLiveSession  = (id,d) => api.put(`/live-sessions/${id}`, d);
export const deleteLiveSession  = (id)   => api.delete(`/live-sessions/${id}`);

// ── Sections ──────────────────────────────────────────
export const getSections        = (p)    => get('/sections', { params: p });
export const createSection      = (d)    => api.post('/sections', d);
export const updateSection      = (id,d) => api.put(`/sections/${id}`, d);
export const deleteSection      = (id)   => api.delete(`/sections/${id}`);

// ── SubSections ───────────────────────────────────────
export const getSubSections     = (p)    => get('/subsections', { params: p });
export const createSubSection   = (fd)   => api.post('/subsections', fd);
export const updateSubSection   = (id,fd)=> api.put(`/subsections/${id}`, fd);
export const deleteSubSection   = (id)   => api.delete(`/subsections/${id}`);

// ── Contact Submissions ────────────────────────────────
export const getContacts          = (p)    => get('/contacts', { params: p });
export const updateContactStatus   = (id,s)  => api.put(`/contacts/${id}/status`, { status: s });
export const deleteContact         = (id)   => api.delete(`/contacts/${id}`);

// ── Notifications ──────────────────────────────────────
export const getNotifications      = ()     => get('/notifications');

export default api;
