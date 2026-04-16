import api from "./axios";

export const getAdminReviewsApi = (params) => {
    return api.get("/admin-reviews", { params });
};
