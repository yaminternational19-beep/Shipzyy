import axios from './axios';

export const getDeliveryChargesApi = (params) => axios.get('/delivery-charges', { params });
export const createDeliveryChargeApi = (data) => axios.post('/delivery-charges', data);
export const updateDeliveryChargeApi = (id, data) => axios.put(`/delivery-charges/${id}`, data);
export const deleteDeliveryChargeApi = (id) => axios.delete(`/delivery-charges/${id}`);
export const toggleDeliveryChargeStatusApi = (id) => axios.patch(`/delivery-charges/${id}/status`);
