import api from "./axios";

export const getVendorStaffApi = (params) =>
    api.get("/vendor-staff", { params });

export const createVendorStaffApi = (data) =>
    api.post("/vendor-staff", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateVendorStaffApi = (id, data) =>
    api.put(`/vendor-staff/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const toggleVendorStaffStatusApi = (id) =>
    api.patch(`/vendor-staff/${id}/status`);

export const deleteVendorStaffApi = (id) =>
    api.delete(`/vendor-staff/${id}`);

export const updateVendorStaffPermissionsApi = (id, permissions) =>
    api.patch(`/vendor-staff/${id}/permissions`, { permissions });

