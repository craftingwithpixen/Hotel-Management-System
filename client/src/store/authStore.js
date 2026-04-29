import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  // ── Auth Actions ──────────────────────────────────────────────
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

  // ── checkAuth: called once on app mount ──────────────────────
  // Strategy: try in-memory token first → fall back to /auth/refresh
  // (which uses the httpOnly refresh cookie) → give up and clear auth.
  checkAuth: async () => {
    const token = get().accessToken;

    // 1. Try with existing in-memory access token
    if (token) {
      try {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return;
      } catch {
        // Token may be expired — fall through to refresh
      }
    }

    // 2. Try silent refresh using httpOnly refresh cookie
    try {
      const { data } = await api.post('/auth/refresh');
      if (data.accessToken) {
        set({ accessToken: data.accessToken });

        // Fetch user with fresh token
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        set({ user: meRes.data.user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      // Refresh token also invalid / not present
    }

    // 3. Fully unauthenticated
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  // ── updateToken: called by Axios interceptor after silent refresh ──
  updateToken: (accessToken) => set({ accessToken }),
}));

export default useAuthStore;
