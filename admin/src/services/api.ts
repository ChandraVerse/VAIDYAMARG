import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Dashboard ──────────────────────────────────────────────────────────────
// Backend routes (AdminDashboardController):
//   GET /admin/dashboard/stats         → { totalUsers, totalOrders, totalRevenue,
//                                          totalMedicines, pendingOrders,
//                                          pendingPrescriptions,  ← (not pendingRx)
//                                          totalGenericSavings, activePharmacies,
//                                          newUsersToday, ordersToday }
//   GET /admin/dashboard/revenue       → [{ label, date, revenue, orders }]
//   GET /admin/dashboard/orders-chart  → [{ label, date, ...statusCounts, total }]
export const dashboardApi = {
  stats:        () => api.get('/admin/dashboard/stats'),
  revenueChart: () => api.get('/admin/dashboard/revenue'),
  orderChart:   () => api.get('/admin/dashboard/orders-chart'), // was '/admin/dashboard/orders' — 404
};

// ── Orders ─────────────────────────────────────────────────────────────────
export const adminOrdersApi = {
  list:   (params?: Record<string, unknown>) => api.get('/admin/orders',        { params }),
  detail: (id: string)                       => api.get(`/admin/orders/${id}`),
  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/admin/orders/${id}`, body),
};

// ── Prescriptions ──────────────────────────────────────────────────────────
export const adminPrescriptionsApi = {
  pending: (params?: Record<string, unknown>) =>
    api.get('/prescriptions/admin/pending', { params }),
  detail:  (id: string) => api.get(`/prescriptions/${id}`),
  verify:  (id: string, body: Record<string, unknown>) =>
    api.patch(`/prescriptions/${id}/verify`, body),
};

// ── Medicines ──────────────────────────────────────────────────────────────
export const adminMedicinesApi = {
  list:   (params?: Record<string, unknown>) => api.get('/medicines',        { params }),
  detail: (id: string)                       => api.get(`/medicines/${id}`),
  create: (body: Record<string, unknown>)    => api.post('/medicines',       body),
  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/medicines/${id}`, body),
  delete: (id: string) => api.delete(`/medicines/${id}`),
};

// ── Users ──────────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list:   (params?: Record<string, unknown>) => api.get('/admin/users',      { params }),
  detail: (id: string)                       => api.get(`/admin/users/${id}`),
};
