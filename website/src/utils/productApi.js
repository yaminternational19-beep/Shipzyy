import apiService from './api';

export const getProducts = async (page = 1, limit = 10) => {
  const response = await apiService.get(`/products`, {
    params: { page, limit }
  });
  return response.data;
};

export const getProductById = async (id) => {
  try {
    const response = await apiService.get(`/customers/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};