import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15_000,
});

const token = localStorage.getItem('admin_token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
