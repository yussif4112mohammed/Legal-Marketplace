import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach JWT from localStorage automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/auth')) {
        localStorage.removeItem('lm_token');
        localStorage.removeItem('lm_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

/* ─── Auth ─────────────────────────────────────────────────── */
export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me:       ()     => api.get('/api/auth/me'),
  logout:   ()     => { localStorage.removeItem('lm_token'); localStorage.removeItem('lm_user'); },
};

/* ─── Lawyers ───────────────────────────────────────────────── */
export const lawyersAPI = {
  search:       (params) => api.get('/api/lawyers', { params }),
  getById:      (id)     => api.get(`/api/lawyers/${id}`),
  getMyProfile: ()       => api.get('/api/lawyers/me'),
  updateProfile:(data)   => api.put('/api/lawyers/me', data),
};

/* ─── Bookings ──────────────────────────────────────────────── */
export const bookingsAPI = {
  getAll:  ()          => api.get('/api/bookings'),
  getById: (id)        => api.get(`/api/bookings/${id}`),
  create:  (data)      => api.post('/api/bookings', data),
  update:  (id, data)  => api.patch(`/api/bookings/${id}`, data),
};

/* ─── Messages ──────────────────────────────────────────────── */
export const messagesAPI = {
  getInbox:      ()              => api.get('/api/messages'),
  getThread:     (withUserId)    => api.get('/api/messages', { params: { with: withUserId } }),
  send:          (data)          => api.post('/api/messages', data),
  getUnreadCount:()              => api.get('/api/messages/unread-count'),
};

/* ─── Reviews ───────────────────────────────────────────────── */
export const reviewsAPI = {
  getForLawyer: (lawyerId) => api.get('/api/reviews', { params: { lawyerId } }),
  create:       (data)     => api.post('/api/reviews', data),
};

/* ─── Admin ─────────────────────────────────────────────────── */
export const adminAPI = {
  getStats:          ()    => api.get('/api/admin/stats'),
  getPendingLawyers: ()    => api.get('/api/admin/pending-lawyers'),
  approveLawyer:     (id)  => api.patch(`/api/admin/lawyers/${id}/approve`),
  rejectLawyer:      (id, reason) => api.patch(`/api/admin/lawyers/${id}/reject`, { reason }),
  getUsers:          ()    => api.get('/api/admin/users'),
  toggleUser:        (id)  => api.patch(`/api/admin/users/${id}/toggle`),
  getReviews:        ()    => api.get('/api/admin/reviews'),
  toggleReview:      (id)  => api.patch(`/api/admin/reviews/${id}/toggle`),
  getLogs:           ()    => api.get('/api/admin/logs'),
};

/* ─── Specializations ───────────────────────────────────────── */
export const specializationsAPI = {
  getAll: () => api.get('/api/specializations'),
};
