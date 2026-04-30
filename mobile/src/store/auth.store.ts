import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/auth.api';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'PATIENT' | 'PHARMACIST' | 'ADMIN';
}

interface AuthState {
  user:           User | null;
  isLoading:      boolean;
  isAuthenticated:boolean;

  // Actions
  sendOtp:        (phone: string) => Promise<void>;
  verifyOtp:      (phone: string, otp: string) => Promise<void>;
  loadUser:       () => Promise<void>;
  logout:         () => Promise<void>;
  setUser:        (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,

  sendOtp: async (phone) => {
    await authApi.sendOtp(phone);
  },

  verifyOtp: async (phone, otp) => {
    const { data } = await authApi.verifyOtp(phone, otp);
    const { accessToken, refreshToken, user } = data.data;

    await SecureStore.setItemAsync('access_token',  accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);

    set({ user, isAuthenticated: true });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) { set({ isLoading: false }); return; }

      const { data } = await authApi.me();
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
