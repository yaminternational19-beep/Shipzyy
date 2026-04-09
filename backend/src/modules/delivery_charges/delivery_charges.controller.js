import ApiResponse from '../../utils/apiResponse.js';
import service from './delivery_charges.service.js';

export const createDeliveryCharge = async (req, res) => {
  try {
    const charge = await service.createDeliveryCharge(req.body);
    return ApiResponse.success(res, "Delivery charge created successfully", charge);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to create delivery charge");
  }
};

export const getDeliveryCharges = async (req, res) => {
  try {
    const result = await service.getDeliveryCharges(req.query);
    return ApiResponse.success(res, "Delivery charges fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch delivery charges");
  }
};

export const updateDeliveryCharge = async (req, res) => {
  try {
    const charge = await service.updateDeliveryCharge(req.params.id, req.body);
    return ApiResponse.success(res, "Delivery charge updated successfully", charge);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to update delivery charge");
  }
};

export const deleteDeliveryCharge = async (req, res) => {
  try {
    const deleted = await service.deleteDeliveryCharge(req.params.id);
    return ApiResponse.success(res, "Delivery charge deleted successfully", deleted);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to delete delivery charge");
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const result = await service.toggleStatus(req.params.id);
    return ApiResponse.success(res, "Status updated successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to update status");
  }
};

export default { createDeliveryCharge, getDeliveryCharges, updateDeliveryCharge, deleteDeliveryCharge, toggleStatus };
