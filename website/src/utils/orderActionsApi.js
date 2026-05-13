import apiService from "./api";

export const cancelOrderItem = async (data) => {
    try {
        const response = await apiService.put("/customers/cancel-item", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const returnOrderItem = async (formData) => {
    try {
        const response = await apiService.post("/customers/return-item", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};