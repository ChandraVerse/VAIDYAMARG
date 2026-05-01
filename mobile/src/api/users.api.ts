import apiClient from './client';

export const usersApi = {
  /**
   * GET /users/me
   * Returns the authenticated user's profile.
   */
  getProfile: () =>
    apiClient.get('/users/me'),

  /**
   * PATCH /users/me
   * Update name / phone / email.
   */
  updateProfile: (data: { name?: string; phone?: string; email?: string }) =>
    apiClient.patch('/users/me', data),

  /**
   * PATCH /users/me/fcm-token
   * Register or refresh the FCM push token for this device.
   * Called automatically by useNotifications() on app boot.
   */
  registerFcmToken: (token: string) =>
    apiClient.patch('/users/me/fcm-token', { token }),

  /**
   * GET /users/me/addresses
   */
  getAddresses: () =>
    apiClient.get('/users/me/addresses'),

  /**
   * POST /users/me/addresses
   */
  addAddress: (data: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) => apiClient.post('/users/me/addresses', data),

  /**
   * DELETE /users/me/addresses/:id
   */
  deleteAddress: (id: string) =>
    apiClient.delete(`/users/me/addresses/${id}`),
};
