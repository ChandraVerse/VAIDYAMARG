import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/services/api';

export interface User {
  id:    string;
  phone: string;
  name:  string | null;
  email: string | null;
  role:  string;
}

interface AuthState {
  user:          User | null;
  isLoading:     boolean;
  isHydrated:    boolean;

  // Actions
  sendOtp:       (phone: string) => Promise<void>;
  verifyOtp:     (phone: string, otp: string) => Promise<void>;
  loadSession:   () => Promise<void>;
  logout:        () => Promise<void>;
  setUser:       (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isLoading:  false,
  isHydrated: false,

  sendOtp: async (phone) => {
    set({ isLoading: true });
    try {
      await authApi.sendOtp(phone);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      await SecureStore.setItemAsync('access_token',  data.data.accessToken);
      await SecureStore.setItemAsync('refresh_token', data.data.refreshToken);
      set({ user: data.data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) return;
      const { data } = await authApi.me();
      set({ user: data.data });
    } catch {
      // Token expired or invalid — clear it
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally {
      set({ isHydrated: true });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
