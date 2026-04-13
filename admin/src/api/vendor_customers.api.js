import api from "./axios";

export const getVendorCustomersApi = (params) => {
    return api.get("/vendor/customers", { params });
};

export const getVendorCustomerDetailsApi = (id) => {
    return api.get(`/vendor/customers/${id}`);
};
