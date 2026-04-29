import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shipzyy.com/api/v1';

// 1. AXIOS INSTANCE
const api = axios.create({
  baseURL: BASE_URL,
});

// 2. REQUEST INTERCEPTOR 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. COMBINED RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // GLOBAL SERVER ERROR (500) & NETWORK DOWN HANDLER
    if (!error.response || error.response.status >= 500) {
      const event = new CustomEvent("server-error");
      window.dispatchEvent(event);
      return Promise.reject(error);
    }

    //  401 UNAUTHORIZED (TOKEN REFRESH) HANDLER
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const res = await axios.post(`${BASE_URL}/customers/refresh-token`, {
          token: refreshToken
        });
        
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest); // Retry the original request
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

// 4. API SERVICE EXPORT
const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default apiService;