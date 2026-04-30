import apiClient from './client';

export const authApi = {
  sendOtp:   (phone: string)              => apiClient.post('/auth/send-otp',    { phone }),
  verifyOtp: (phone: string, otp: string) => apiClient.post('/auth/verify-otp',  { phone, otp }),
  refresh:   (refreshToken: string)       => apiClient.post('/auth/refresh',     { refreshToken }),
  me:        ()                           => apiClient.get('/auth/me'),
};
