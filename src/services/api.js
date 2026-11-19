import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vopro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto logout if on login screen
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('vopro_token');
        localStorage.removeItem('vopro_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
