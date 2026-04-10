import api from "./axios";

export const getSettingsContentApi = () => api.get('/settings/content');
export const createSettingsContentApi = (data) => api.post('/settings/content', data);
export const updateSettingsContentApi = (key, data) => api.put(`/settings/content/${key}`, data);
export const deleteSettingsContentApi = (key) => api.delete(`/settings/content/${key}`);

// Help & Support APIs
export const getHelpSupportContactsApi = (role) => api.get('/help-support', { params: { role } });
export const updateHelpSupportContactsApi = (role, contacts) => api.put(`/help-support/${role}`, { contacts });

// Announcement APIs
export const getAnnouncementsApi = (params) => api.get('/announcements', { params });
export const createAnnouncementApi = (data) => api.post('/announcements', data);
export const updateAnnouncementApi = (id, data) => api.put(`/announcements/${id}`, data);
export const deleteAnnouncementApi = (id) => api.delete(`/announcements/${id}`);
export const resendAnnouncementApi = (id) => api.post(`/announcements/${id}/resend`);

// FAQ APIs
export const getFAQsApi = (category) => api.get('/faqs', { params: { category } });
export const createFAQApi = (data) => api.post('/faqs', data);
export const updateFAQApi = (id, data) => api.patch(`/faqs/${id}`, data);
export const deleteFAQApi = (id) => api.delete(`/faqs/${id}`);
