import apiService from "./api";

export const addReview = async (formData) => {
    try {
        const response = await apiService.post("/customers/reviews", formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateReview = async (reviewId, formData) => {
    try {
        const response = await apiService.put(`/customers/reviews/${reviewId}`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const response = await apiService.delete(`/customers/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};