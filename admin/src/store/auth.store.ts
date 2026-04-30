import { create } from 'zustand';
import api from '../api/axios';

interface AuthState {
  token: string | null;
  admin: any;
  login:  (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  admin: null,

  login: async (phone, otp) => {
    const { data } = await api.post('/auth/admin/verify-otp', { phone, otp });
    const { token, user } = data.data;
    localStorage.setItem('admin_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    set({ token, admin: user });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    set({ token: null, admin: null });
  },
}));
