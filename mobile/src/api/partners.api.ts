import { apiClient } from './client';

export const partnersApi = {
  getMyPharmacy: () =>
    apiClient.get('/partners/me'),

  updateMyPharmacy: (payload: {
    operatingHours?: string;
    deliveryRadius?: number;
    address?:        string;
  }) => apiClient.patch('/partners/me', payload),

  getAnalytics: () =>
    apiClient.get('/partners/me/analytics'),

  getEarnings: (page = 1, limit = 20) =>
    apiClient.get(`/partners/me/earnings?page=${page}&limit=${limit}`),
};
