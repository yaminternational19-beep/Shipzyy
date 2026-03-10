import axios from "axios";

const BASE_URL = "http://localhost:9000/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach access token automatically
api.interceptors.request.use((config) => {
    // Skip authorization header for login and refresh calls
    const isAuthPath = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh-token');

    if (!isAuthPath) {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
    refreshQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    refreshQueue = [];
};

// ... (request interceptor remains same)

// Refresh token interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) throw new Error("No refresh token available");

                const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = res.data.data;

                localStorage.setItem("accessToken", accessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                processQueue(null, accessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                console.error("Session expired. Please login again.");
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
