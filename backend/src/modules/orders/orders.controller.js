import * as ordersService from "./orders.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/ApiError.js";

export const getAllOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    if (!vendorId) {
        throw new ApiError(401, "Authentication required");
    }

    const result = await ordersService.getAllOrders(vendorId, req.query);
    return ApiResponse.success(res, "Orders fetched successfully", result);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!vendorId) {
        throw new ApiError(401, "Authentication required");
    }

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const result = await ordersService.updateOrderStatus(vendorId, orderId, status);
    return ApiResponse.success(res, result.message, result);
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
    // Admin or Vendor can update payment status
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { payment_status } = req.body;

    if (!userId) {
        throw new ApiError(401, "Authentication required");
    }

    if (!payment_status) {
        throw new ApiError(400, "Payment status is required");
    }

    const result = await ordersService.updatePaymentStatus(userId, orderId, payment_status);
    return ApiResponse.success(res, result.message, result);
});
