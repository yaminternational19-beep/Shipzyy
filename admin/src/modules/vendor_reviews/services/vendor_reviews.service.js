import { getVendorReviewsApi } from "../../../api/vendor_reviews.api";

export const fetchReviews = async (params) => {
    try {
        const response = await getVendorReviewsApi(params);
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || "Failed to fetch reviews");
    } catch (error) {
        console.error("Reviews Service Error:", error);
        throw error;
    }
};
