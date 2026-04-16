import api from "./axios";

export const getVendorReviewsApi = (params) => {
    return api.get("/vendor/reviews", { params });
};
