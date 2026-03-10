import api from "./axios";

export const getSubCategoriesApi = (params) =>
    api.get("/subcategories", { params });

export const createSubCategoryApi = (data) =>
    api.post("/subcategories", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateSubCategoryApi = (id, data) =>
    api.put(`/subcategories/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const toggleSubCategoryStatusApi = (id, status) =>
    api.patch(`/subcategories/${id}/status`, { status });

export const deleteSubCategoryApi = (id) =>
    api.delete(`/subcategories/${id}`);
