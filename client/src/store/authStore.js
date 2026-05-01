import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: true,
      isAuthenticated: false,
      hasHydrated: false,
      preferredLang: 'en',

      setAuth: (user, accessToken) =>
        set((state) => ({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
          preferredLang: user?.preferredLang || state.preferredLang || 'en',
        })),

      setPreferredLang: (preferredLang) =>
        set((state) => ({
          preferredLang,
          user: state.user ? { ...state.user, preferredLang } : state.user,
        })),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      // ── Auth Actions ──────────────────────────────────────────────
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set((state) => ({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          preferredLang: data.user?.preferredLang || state.preferredLang || 'en',
        }));
        return data;
      },

      staffLogin: async (email, password) => {
        const { data } = await api.post('/auth/staff-login', { email, password });
        set((state) => ({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          preferredLang: data.user?.preferredLang || state.preferredLang || 'en',
        }));
        return data;
      },

      register: async (name, email, password, phone) => {
        const { data } = await api.post('/auth/register', { name, email, password, phone });
        return data;
      },

      verifyOTP: async (email, otp) => {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        set((state) => ({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          preferredLang: data.user?.preferredLang || state.preferredLang || 'en',
        }));
        return data;
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      // ── checkAuth: called once on app mount ──────────────────────
      // Strategy: try persisted token first → fall back to /auth/refresh
      // (which uses the httpOnly refresh cookie) → give up and clear auth.
      checkAuth: async () => {
        set({ isLoading: true });
        const token = get().accessToken;

        // 1. Try with existing token (persisted/in-memory)
        if (token) {
          try {
            const { data } = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            set((state) => ({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              preferredLang: data.user?.preferredLang || state.preferredLang || 'en',
            }));
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
            set((state) => ({
              user: meRes.data.user,
              isAuthenticated: true,
              isLoading: false,
              preferredLang: meRes.data.user?.preferredLang || state.preferredLang || 'en',
            }));
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
    }),
    {
      name: 'hospitality-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        preferredLang: state.preferredLang,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
