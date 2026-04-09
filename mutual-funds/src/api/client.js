import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5331/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT — reads from localStorage (same place AuthContext saves it)
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finvest_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('finvest_token');
      localStorage.removeItem('finvest_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
