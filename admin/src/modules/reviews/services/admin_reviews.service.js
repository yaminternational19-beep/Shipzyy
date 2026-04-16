import { getAdminReviewsApi } from "../../../api/admin_reviews.api";

export const fetchAdminReviews = async (params) => {
    try {
        const response = await getAdminReviewsApi(params);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Failed to fetch reviews");
    } catch (error) {
        console.error("Admin Reviews Service Error:", error);
        throw error;
    }
};
