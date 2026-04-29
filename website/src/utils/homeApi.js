import apiService from './api';

export const getHomeData = async (pageNo = 1, limit = 10) => {
  const response = await apiService.get(`/customers/home?page=${pageNo}&limit=${limit}`);
  return response.data; 
};