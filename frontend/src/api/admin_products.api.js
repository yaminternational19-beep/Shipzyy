import api from "./axios";

export const getProductsApi = (params) =>
    api.get("/admin-products", { params });

export const getProductByIdApi = (id) =>
    api.get(`/admin-products/${id}`);

export const updateProductStatusApi = (id, data) =>
    api.patch(`/admin-products/${id}/approval`, data);

