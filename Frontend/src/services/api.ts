import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (from localStorage)
api.interceptors.request.use(
  (config) => {
    // Only add JWT token if Authorization header is not already set
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Added JWT token to request');
      }
    } else {
      console.log('[API Interceptor] Authorization header already set:', config.headers.Authorization?.substring(0, 30));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for GitHub repositories endpoint - let the page handle it
      const isGitHubRepoEndpoint = error.config?.url?.includes('/github/repositories');
      
      if (!isGitHubRepoEndpoint) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };
