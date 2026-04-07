import api from "./axios";

export const getAllCustomersApi = (params) =>
    api.get("/admin-customers", { params });

export const updateCustomerStatusApi = (id, status) =>
    api.patch(`/admin-customers/${id}/status`, { status });

export const deleteCustomerApi = (id) =>
    api.delete(`/admin-customers/${id}`);
