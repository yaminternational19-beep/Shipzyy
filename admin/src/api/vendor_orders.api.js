import api from "./axios";

export const getVendorOrdersApi = (params) =>
    api.get("/vendor/orders", { params });

export const updateVendorOrderStatusApi = (orderId, status) =>
    api.patch(`/vendor/orders/${orderId}/status`, { status });
