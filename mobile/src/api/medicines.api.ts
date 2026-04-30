import apiClient from './client';

export const medicinesApi = {
  search:    (query: string, page = 1)  => apiClient.get(`/medicines/search?q=${query}&page=${page}`),
  compare:   (brandName: string)        => apiClient.get(`/medicines/compare?brand=${encodeURIComponent(brandName)}`),
  detail:    (id: string)               => apiClient.get(`/medicines/${id}`),
  categories:()                         => apiClient.get('/medicines/categories'),
};
