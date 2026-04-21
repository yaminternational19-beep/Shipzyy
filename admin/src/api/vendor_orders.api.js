import api from "./axios";

export const getVendorOrdersApi = (params) =>
    api.get("/vendor/orders", { params });

export const updateVendorOrderStatusApi = (orderId, status) =>
    api.patch(`/vendor/orders/${orderId}/status`, { status });

export const updateVendorOrderPaymentStatusApi = (orderId, payment_status) =>
    api.patch(`/vendor/orders/${orderId}/payment-status`, { payment_status });
