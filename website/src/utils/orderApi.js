

import apiService from "./api";
import { decodeId } from "./crypto"; 

export const getOrdersHistory = async (page = 1, limit = 10) => {
  try {
    const response = await apiService.get(`/customers/orders-list?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getOrderDetails = async (maskedKey, itemId) => { 
  try {
    const originalId = decodeId(maskedKey); 
    
    if (!originalId) throw new Error("Invalid Order Code");

    const url = itemId 
      ? `/customers/orders-list/${originalId}?item_id=${itemId}`
      : `/customers/orders-list/${originalId}`;
      
    const response = await apiService.get(url); 
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};