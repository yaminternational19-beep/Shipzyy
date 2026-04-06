import api from "./axios";

export const getAllCustomersApi = (params) =>
    api.get("/customers", { params });