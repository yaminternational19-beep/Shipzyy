import axios from './axios';

export const getCouponsApi = (params) => axios.get('/coupons', { params });
export const createCouponApi = (data) => axios.post('/coupons', data);
export const updateCouponApi = (id, data) => axios.put(`/coupons/${id}`, data);
export const deleteCouponApi = (id) => axios.delete(`/coupons/${id}`);
export const toggleCouponStatusApi = (id) => axios.patch(`/coupons/${id}/status`);
