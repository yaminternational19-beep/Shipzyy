import { getVendorOrdersApi, updateVendorOrderStatusApi } from "../../../api/vendor_orders.api";

export const fetchOrders = async (params) => {
    try {
        const response = await getVendorOrdersApi(params);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Failed to fetch orders");
    } catch (error) {
        console.error("Orders Service Error:", error);
        throw error;
    }
};

export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await updateVendorOrderStatusApi(orderId, newStatus);
        if (response.data.success) {
            return response.data;
        }
        throw new Error(response.data.message || "Failed to update order status");
    } catch (error) {
        console.error("Orders Service Error:", error);
        throw error;
    }
};

export const bulkUpdateStatus = async (orderIds, status) => {
    const promises = orderIds.map(id => updateVendorOrderStatusApi(id, status));
    return Promise.all(promises);
};
