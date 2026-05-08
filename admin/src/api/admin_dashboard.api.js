import API from './axios';

export const getAdminStats = async () => {
    try {
        const response = await API.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAdminActivities = async () => {
    try {
        const response = await API.get('/admin/dashboard/activities');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAdminAnalytics = async (params) => {
    try {
        const response = await API.get('/admin/dashboard/analytics', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAdminTopEntities = async () => {
    try {
        const response = await API.get('/admin/dashboard/top-entities');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
