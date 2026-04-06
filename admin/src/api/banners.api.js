import api from "./axios";

export const getBannersApi = (params) => api.get("/banners", { params });

export const createBannerApi = (data) => api.post("/banners", data, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const updateBannerApi = (id, data) => api.put(`/banners/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const deleteBannerApi = (id) => api.delete(`/banners/${id}`);
