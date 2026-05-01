import { apiClient } from './client';

export const remindersApi = {
  getAll: () =>
    apiClient.get('/reminders'),

  create: (payload: {
    medicineId:   string;
    medicineName: string;
    reminderTime: string;
    frequency:    string;
  }) => apiClient.post('/reminders', payload),

  update: (id: string, payload: { isActive?: boolean; reminderTime?: string; frequency?: string }) =>
    apiClient.patch(`/reminders/${id}`, payload),

  remove: (id: string) =>
    apiClient.delete(`/reminders/${id}`),
};
