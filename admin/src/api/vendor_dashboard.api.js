import api from "./axios";

export const getVendorDashboardData = async (vendorId, params) => {
    try {
        // Use params object for all query parameters including vendorId
        const queryParams = { ...params };
        if (vendorId) {
            queryParams.vendorId = vendorId;
        }
        
        const res = await api.get("/vendor/dashboard/data", { params: queryParams });
        return res.data;
    } catch (error) {
        console.error("Dashboard API Error:", error);
        throw error;
    }
};
