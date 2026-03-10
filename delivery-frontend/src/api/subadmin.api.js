import api from "./axios";

export const getSubAdminsApi = (params) =>
    api.get("/subadmin", { params });

export const createSubAdminApi = (data) =>
    api.post("/subadmin", data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const updateSubAdminApi = (id, data) =>
    api.put(`/subadmin/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const toggleSubAdminStatusApi = (id) =>
    api.patch(`/subadmin/${id}/status`);

export const deleteSubAdminApi = (id) =>
    api.delete(`/subadmin/${id}`);

export const getAccessLogsApi = (params) =>
    api.get("/subadmin/logs", { params });

export const updateSubAdminPermissionsApi = (id, permissions) =>
    api.patch(`/subadmin/${id}/permissions`, { permissions });