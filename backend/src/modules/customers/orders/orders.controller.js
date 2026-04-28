import * as ordersService from "./orders.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import ApiError from "../../../utils/ApiError.js";

export const getCheckoutSummary = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;

  if (!customerId) {
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const { address_id, coupon_code } = { ...req.query, ...req.body };
  const result = await ordersService.getCheckoutSummary(customerId, { address_id, coupon_code });

  return ApiResponse.success(res, "Order summary fetched successfully", result);
});

export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;

  if (!customerId) {
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const { address_id, coupon_code, payment_method } = req.body;

  if (!address_id) {
    throw new ApiError(400, "Address is required", "ADDRESS_REQUIRED");
  }

  if (!payment_method) {
    throw new ApiError(400, "Payment method is required", "PAYMENT_METHOD_REQUIRED");
  }

  const result = await ordersService.placeOrder(customerId, { address_id, coupon_code, payment_method });

  return ApiResponse.success(res, "Order placed successfully", result);
});

export const getOrderHistory = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  const result = await ordersService.getOrderHistory(customerId, req.query);

  return ApiResponse.success(res, "Order history fetched successfully", result);
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  const { orderId } = req.params;
  const { item_id } = req.query;

  const result = await ordersService.getOrderDetails(customerId, orderId, item_id);

  return ApiResponse.success(res, "Order details fetched successfully", result);
});

export const cancelOrderItem = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  const { order_id, item_id } = req.body;

  if (!customerId) {
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const result = await ordersService.cancelOrderItem(customerId, order_id, item_id);

  return ApiResponse.success(res, "Item cancelled successfully", result);
});

export const returnOrderItem = asyncHandler(async (req, res) => {
  const customerId = req.user?.id;
  const { order_id, item_id, reason } = req.body;

  if (!customerId) {
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");
  }

  const result = await ordersService.returnOrderItem(customerId, order_id, item_id, reason, req.files);

  return ApiResponse.success(res, "Return requested successfully", result);
});
