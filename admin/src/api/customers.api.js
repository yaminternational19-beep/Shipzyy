import api from "./axios";

export const getAllCustomersApi = (params) =>
    api.get("/customers", { params });

export const updateCustomerStatusApi = (id, status) =>
    api.patch(`/customers/${id}/status`, { status });

export const deleteCustomerApi = (id) =>
    api.delete(`/customers/${id}`);
