import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('partner_token') ?? '';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('partner_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const partnerAuthApi = {
  sendOtp:   (phone: string)            => api.post('/partner/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/partner/auth/verify-otp', { phone, otp }),
  me:        ()                         => api.get('/partner/auth/me'),
};

export const partnerOrdersApi = {
  list:   (params?: Record<string,string>) => api.get('/partner/orders', { params }),
  detail: (id: string)                     => api.get(`/partner/orders/${id}`),
  update: (id: string, status: string)     => api.patch(`/partner/orders/${id}/status`, { status }),
};

export const partnerRxApi = {
  pending: ()                                                   => api.get('/partner/prescriptions/pending'),
  verify:  (id: string, body: { status: string; notes?: string }) => api.patch(`/partner/prescriptions/${id}/verify`, body),
};

export const partnerMedicinesApi = {
  list:   (params?: Record<string,string>)             => api.get('/partner/medicines', { params }),
  update: (id: string, body: { stock: number })        => api.patch(`/partner/medicines/${id}/stock`, body),
};

export const partnerAnalyticsApi = {
  overview: () => api.get('/partner/analytics/overview'),
  earnings: () => api.get('/partner/analytics/earnings'),
};

export const partnerProfileApi = {
  get:    ()           => api.get('/partner/profile'),
  update: (body: any)  => api.patch('/partner/profile', body),
};

export default api;
