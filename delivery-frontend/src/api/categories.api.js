import api from "./axios";

export const getCategoriesApi = (params) =>
    api.get("/categories", { params });

export const createCategoryApi = (data) =>
    api.post("/categories", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateCategoryApi = (id, data) =>
    api.put(`/categories/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const toggleCategoryStatusApi = (id, status) =>
    api.patch(`/categories/${id}/status`, { status });

export const deleteCategoryApi = (id) =>
    api.delete(`/categories/${id}`);
