import apiService from "../utils/api";

// 1. Add Address
export const addAddress = async (addressData) => {
  try {
    const response = await apiService.post("/customers/profile/address", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

// 2. Update Address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await apiService.put(`/customers/profile/address/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Error updating address ${addressId}:`, error);
    throw error;
  }
};

// 3. Delete Address
export const deleteAddress = async (addressId) => {
  try {
    const response = await apiService.delete(`/customers/profile/address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error);
    throw error;
  }
};