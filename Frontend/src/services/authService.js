// services/authService.js
import { api } from "./api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: (credentials) =>
    api.post("/auth/login", credentials).then((res) => res.data),
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  verifyEmail: (data) =>
    api.post("/auth/verify-email", data).then((res) => res.data),
  resendVerification: (data) =>
    api.post("/auth/resend-verification", data).then((res) => res.data),
  getMe: () => api.get("/auth/get-me").then((res) => res.data),
  refresh: () =>
    axios
      .get(`${BASE_URL}/auth/refresh-token`, { withCredentials: true })
      .then((res) => res.data),
};
