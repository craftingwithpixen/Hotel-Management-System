import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  staffLogin: async (email, password) => {
    const { data } = await api.post('/auth/staff-login', { email, password });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  register: async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    return data;
  },

  verifyOTP: async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = get().accessToken;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: meRes.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      get().clearAuth();
    }
  },
}));

export default useAuthStore;
