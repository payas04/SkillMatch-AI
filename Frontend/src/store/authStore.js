// store/authStore.js
import { create } from "zustand";
import { authService } from "../services/authService";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  login: async (credentials) => {
    const data = await authService.login(credentials);
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  register: async (credentials) => {
    const data = await authService.register(credentials);
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null, accessToken: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // 1. Get initial access token from refresh cookie
      const { accessToken } = await authService.refresh();
      set({ accessToken });

      // 2. Fetch authenticated user profile
      const { user } = await authService.getMe();
      set({ user });
    } catch {
      set({ user: null, accessToken: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
