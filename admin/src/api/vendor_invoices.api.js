import api from "./axios";

export const getVendorInvoicesApi = (params) => {
    return api.get("/vendor/invoices", { params });
};
