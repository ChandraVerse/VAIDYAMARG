import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function client() {
  const token = useAuthStore.getState().token;
  return axios.create({
    baseURL: base,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export const adminPartnersApi = {
  list: (status?: string) =>
    client().get('/admin/partners', { params: status ? { status } : {} }),

  get: (id: string) =>
    client().get(`/admin/partners/${id}`),

  review: (id: string, action: 'APPROVED' | 'REJECTED', reason?: string) =>
    client().patch(`/admin/partners/${id}/review`, { action, reason }),

  suspend: (id: string, reason: string) =>
    client().patch(`/admin/partners/${id}/suspend`, { reason }),

  reinstate: (id: string) =>
    client().patch(`/admin/partners/${id}/reinstate`),
};
