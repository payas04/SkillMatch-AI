import axios from "axios";
import useAuthStore from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Sends refreshToken cookie
});

/**
 * Axios interceptors for handling authentication and token refresh.
 * The request interceptor adds the access token to the Authorization header if it exists.
 * The response interceptor handles 401 Unauthorized errors by attempting to refresh the access token.
 * If the refresh fails, it clears the access token and redirects the user to the login page.
 */
api.interceptors.request.use(
  //config is the request configuration object that will be sent to the server.
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Return the modified config object to proceed with the request.
    return config;
  },
  //error is the error object that will be thrown if the request fails.
  (error) => {
    // If there is an error in the request configuration, we reject the promise with the error.
    return Promise.reject(error);
  },
);
/**
 * Response interceptor to handle 401 Unauthorized errors and refresh the access token.
 * If the refresh fails, it clears the access token and redirects the user to the login page.
 */
api.interceptors.response.use(
  //response is the response object that will be returned from the server.
  // If the response is successful, we simply return the response object.
  (response) => response,
  //error is the error object that will be thrown if the response fails.
  async (error) => {
    //originalRequest is the request configuration object that was sent to the server.
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized and the request has not been retried yet
    //error.response?.status is the status code of the response object that was returned from the server.
    //originalRequest._retry is a custom property that we add to the request configuration object to keep track of whether the request has been retried or not.
    // If the error is a 401 Unauthorized and the request has not been retried yet, we attempt to refresh the access token.

    // Do not attempt to refresh if the request was already an auth call
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh-token");
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      // Mark the request as retried to prevent infinite loops
      originalRequest._retry = true; // Mark as retried
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          { withCredentials: true },
        );
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        //originalRequest.headers is the headers object that will be sent to the server.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        // If the refresh fails, we clear the access token and redirect the user to the login page.
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    // If the error is not a 401 Unauthorized or the request has already been retried, we reject the promise with the error.
    return Promise.reject(error);
  },
);
