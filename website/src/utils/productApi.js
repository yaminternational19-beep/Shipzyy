import apiService from './api';
import { decodeId } from './crypto'; 

export const getProducts = async (page = 1, limit = 10) => {
  const response = await apiService.get(`/products`, {
    params: { page, limit }
  });
  return response.data;
};

export const getProductByCode = async (maskedKey, page = 1) => { 
  try {
    const originalId = decodeId(maskedKey); 
    
    if (!originalId) throw new Error("Invalid Product Code");

    const response = await apiService.get(`/customers/products/${originalId}?page=${page}&limit=10`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

