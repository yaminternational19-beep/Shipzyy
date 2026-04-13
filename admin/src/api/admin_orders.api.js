import api from "./axios";

export const getAdminOrdersApi = (params) =>
    api.get("/admin-orders", { params });

export const getAdminOrderByIdApi = (id) =>
    api.get(`/admin-orders/${id}`);
