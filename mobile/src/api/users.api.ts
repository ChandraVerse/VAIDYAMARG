import apiClient from './client';

export const usersApi = {
  profile:        ()           => apiClient.get('/users/profile'),
  updateProfile:  (data: any)  => apiClient.patch('/users/profile', data),
  dashboard:      ()           => apiClient.get('/users/dashboard'),
  getAddresses:   ()           => apiClient.get('/users/addresses'),
  addAddress:     (data: any)  => apiClient.post('/users/addresses', data),
  setDefault:     (id: string) => apiClient.patch(`/users/addresses/${id}/default`),
  deleteAddress:  (id: string) => apiClient.delete(`/users/addresses/${id}`),
  getHealthRecords:()          => apiClient.get('/users/health-records'),
  addHealthRecord:(data: any)  => apiClient.post('/users/health-records', data),
};
