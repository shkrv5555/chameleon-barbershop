import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('chamilion_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Public ──────────────────────────────────────────────────────
export const getSlots = date => api.get(`/reservations/slots?date=${date}`);
export const createReservation = data => api.post('/reservations', data);
export const getMyReservation = token => api.get(`/reservations/my/${token}`);
export const cancelReservation = token => api.delete(`/reservations/cancel/${token}`);
export const getServices = () => api.get('/services');
export const getBlogPosts = () => api.get('/blog');
export const getBlogPost = id => api.get(`/blog/${id}`);

// ── Admin Auth ──────────────────────────────────────────────────
export const adminLogin = password => api.post('/auth/login', { password });
export const adminChangePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword });

// ── Admin Reservations ──────────────────────────────────────────
export const adminGetReservations = params => api.get('/admin/reservations', { params });
export const adminAddReservation = data => api.post('/admin/reservations/add', data);
export const adminCancelReservation = id => api.delete(`/admin/reservations/${id}`);

// ── Admin Services ──────────────────────────────────────────────
export const adminGetServices = () => api.get('/admin/services');
export const adminAddService = data => api.post('/admin/services', data);
export const adminUpdateService = (id, data) => api.put(`/admin/services/${id}`, data);
export const adminDeleteService = id => api.delete(`/admin/services/${id}`);

// ── Admin Blog ──────────────────────────────────────────────────
export const adminGetBlog = () => api.get('/admin/blog');
export const adminAddPost = data => api.post('/admin/blog', data);
export const adminUpdatePost = (id, data) => api.put(`/admin/blog/${id}`, data);
export const adminDeletePost = id => api.delete(`/admin/blog/${id}`);
