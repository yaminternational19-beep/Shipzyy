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
