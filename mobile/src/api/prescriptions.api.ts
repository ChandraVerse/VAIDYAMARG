import apiClient from './client';

export const prescriptionsApi = {
  upload: (formData: FormData) =>
    apiClient.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  myList:   ()           => apiClient.get('/prescriptions/my'),
  detail:   (id: string) => apiClient.get(`/prescriptions/${id}`),
  triggerOcr: (id: string) => apiClient.post(`/prescriptions/${id}/ocr`),
};
