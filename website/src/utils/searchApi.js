import apiService from "./api";

export const searchProducts = async (query) => {
    try {
        const response = await apiService.get(`/customers/search?search=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};