import { create } from 'zustand';
import { api } from '@/services/api';

export interface AdminUser {
  id:    string;
  name:  string;
  email: string;
  role:  'ADMIN' | 'PHARMACIST';
}

interface AuthState {
  user:       AdminUser | null;
  token:      string | null;
  isLoading:  boolean;

  login:        (email: string, password: string) => Promise<void>;
  loadSession:  () => Promise<void>;
  logout:       () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:      null,
  token:     localStorage.getItem('admin_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      const { accessToken, user } = data.data;
      localStorage.setItem('admin_token', accessToken);
      set({ user, token: accessToken, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loadSession: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, token });
    } catch {
      localStorage.removeItem('admin_token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, token: null });
  },
}));
