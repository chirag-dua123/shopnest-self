import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for handling response and auto-refreshing expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 unauthorized and not already retried and not an auth endpoint
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/token/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await axios.post('/api/token/refresh', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid; user needs to re-login
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
