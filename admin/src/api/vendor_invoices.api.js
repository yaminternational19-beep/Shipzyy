import api from "./axios";

export const getVendorInvoicesApi = (params) => {
    return api.get("/vendor/invoices", { params });
};

export const downloadVendorInvoiceApi = (id) => {
    return api.get(`/vendor/invoices/download/${id}`, { responseType: 'blob' });
};
