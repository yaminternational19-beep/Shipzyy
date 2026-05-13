import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shipzyy.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

// 1. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const longLifeToken = localStorage.getItem('refreshToken');
    
    if (longLifeToken) {
      config.headers.Authorization = `Bearer ${longLifeToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    if (response.data?.data?.is_logged_in === false && localStorage.getItem('refreshToken')) {
      handleAuthCleanup();
    }
    return response;
  },
  async (error) => {
    //  No Internet / Server Down
    if (!error.response || error.response.status >= 500) {
      window.dispatchEvent(new CustomEvent("server-error"));
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      handleAuthCleanup();
    }
    
    return Promise.reject(error);
  }
);

const handleAuthCleanup = () => {
  if (!localStorage.getItem('refreshToken')) return;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default apiService;