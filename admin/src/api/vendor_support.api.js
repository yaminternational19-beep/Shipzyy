import api from "./axios";

export const getVendorFaqsApi = (params) =>
    api.get("/vendor/support", { params });

export const getVendorSupportApi = (data) =>
    api.get("/vendor/support/help", data);
