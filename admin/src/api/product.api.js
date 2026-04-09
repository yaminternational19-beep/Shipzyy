import api from "./axios";

export const fetchProducts = (params) =>
    api.get("/products", { params });

export const createProductAPI = (data) =>
    api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateProductAPI = (id, data) =>
    api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const toggleProductLiveAPI = (id, isLive) =>
    api.patch(`/products/${id}/toggle-live`, { isLive });

export const updateStockAPI = (data) =>
    api.put(`/products/update-stock`, data);

export const deleteProductAPI = (id) =>
    api.delete(`/products/${id}`);

export const bulkCreateProductAPI = (data) =>
    api.post("/products/bulk-create", data);

