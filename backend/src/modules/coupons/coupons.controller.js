import ApiResponse from '../../utils/apiResponse.js';
import service from './coupons.service.js';

export const createCoupon = async (req, res) => {
  try {
    const coupon = await service.createCoupon(req.body);
    return ApiResponse.success(res, "Coupon created successfully", coupon);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to create coupon");
  }
};

export const getCoupons = async (req, res) => {
  try {
    const result = await service.getCoupons(req.query);
    return ApiResponse.success(res, "Coupons fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch coupons");
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await service.updateCoupon(req.params.id, req.body);
    return ApiResponse.success(res, "Coupon updated successfully", coupon);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to update coupon");
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await service.deleteCoupon(req.params.id);
    return ApiResponse.success(res, "Coupon deleted successfully", deleted);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to delete coupon");
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const result = await service.toggleStatus(req.params.id);
    return ApiResponse.success(res, "Coupon status updated successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to update status");
  }
};

export default { createCoupon, getCoupons, updateCoupon, deleteCoupon, toggleStatus };
