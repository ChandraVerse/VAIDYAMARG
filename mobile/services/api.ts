import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore not available (web) — silently continue
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      } catch { /* noop */ }
      // Signal to the auth store that the session has expired
      // (the store listens via a custom event or re-checks on next request)
    }
    return Promise.reject(error);
  },
);

// ── Typed API helpers ────────────────────────────────────────────────────────
export const authApi = {
  sendOtp:   (phone: string)                         => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string)            => api.post('/auth/verify-otp', { phone, otp }),
  refresh:   (refreshToken: string)                  => api.post('/auth/refresh', { refreshToken }),
  me:        ()                                      => api.get('/auth/me'),
};

export const medicinesApi = {
  search:    (q: string, page = 1, limit = 20)       => api.get('/medicines/search', { params: { q, page, limit } }),
  detail:    (id: string)                            => api.get(`/medicines/${id}`),
  compare:   (ids: string[])                         => api.post('/medicines/compare', { ids }),
  categories:()                                      => api.get('/medicines/categories'),
};

export const ordersApi = {
  list:      (page = 1)                              => api.get('/orders', { params: { page } }),
  detail:    (id: string)                            => api.get(`/orders/${id}`),
  create:    (body: Record<string, unknown>)         => api.post('/orders', body),
  cancel:    (id: string)                            => api.patch(`/orders/${id}/cancel`),
  verifyPayment: (body: Record<string, unknown>)     => api.post('/orders/verify-payment', body),
};

export const prescriptionsApi = {
  upload:    (formData: FormData)                    => api.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list:      ()                                      => api.get('/prescriptions/my'),
  detail:    (id: string)                            => api.get(`/prescriptions/${id}`),
  triggerOcr:(id: string)                            => api.post(`/prescriptions/${id}/ocr`),
};

export const notificationsApi = {
  list:         ()                                   => api.get('/notifications'),
  unreadCount:  ()                                   => api.get('/notifications/unread-count'),
  markRead:     (id: string)                         => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()                                   => api.patch('/notifications/read-all'),
  registerFcm:  (token: string)                      => api.post('/notifications/fcm-token', { token }),
};

export const usersApi = {
  profile:      ()                                   => api.get('/users/profile'),
  updateProfile:(body: Record<string, unknown>)      => api.patch('/users/profile', body),
  addAddress:   (body: Record<string, unknown>)      => api.post('/users/addresses', body),
  listAddresses:()                                   => api.get('/users/addresses'),
};
