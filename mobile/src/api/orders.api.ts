import apiClient from './client';

export const ordersApi = {
  place:          (data: any)    => apiClient.post('/orders', data),
  verifyPayment:  (data: any)    => apiClient.post('/orders/verify-payment', data),
  history:        ()             => apiClient.get('/orders/history'),
  track:          (id: string)   => apiClient.get(`/orders/track/${id}`),
  detail:         (id: string)   => apiClient.get(`/orders/${id}`),
  cancel:         (id: string)   => apiClient.patch(`/orders/${id}/cancel`),
};
