import { create } from 'zustand';
import { partnerAuthApi } from '@/services/api';

interface Pharmacy {
  id:     string;
  name:   string;
  city:   string;
  status: string;
}

interface User {
  id:       string;
  name:     string;
  phone:    string;
  role:     string;
  pharmacy?: Pharmacy;
}

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  verifyOtp:       (phone: string, otp: string) => Promise<void>;
  logout:          () => void;
  loadSession:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isAuthenticated: false,
  isLoading:       false,

  verifyOtp: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const res = await partnerAuthApi.verifyOtp(phone, otp);
      const { token, user } = res.data.data ?? res.data;
      sessionStorage.setItem('partner_token', token);
      set({ user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    sessionStorage.removeItem('partner_token');
    set({ user: null, isAuthenticated: false });
  },

  loadSession: async () => {
    const token = sessionStorage.getItem('partner_token');
    if (!token) return;
    try {
      const res = await partnerAuthApi.me();
      const user = res.data.data ?? res.data;
      set({ user, isAuthenticated: true });
    } catch {
      sessionStorage.removeItem('partner_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
