import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Setup request interceptor to attach Clerk bearer token
 */
export const setupInterceptors = (getToken) => {
  api.interceptors.request.use(async (config) => {
    try {
      if (getToken) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Failed to attach Clerk token to request:', error);
    }
    return config;
  });
};

export default api;
