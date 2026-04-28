import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import * as service from "./vendor_returns.service.js";

export const getVendorReturns = asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const filters = req.query;
  const data = await service.getVendorReturns(vendorId, filters);
  return ApiResponse.success(res, "Vendor returns fetched successfully", data);
});

export const updateReturnStatus = asyncHandler(async (req, res) => {
  const vendorId = req.user.id;
  const { returnId } = req.params;
  const { status, vendor_notes } = req.body;
  const data = await service.updateReturnStatus(vendorId, returnId, status, vendor_notes);
  return ApiResponse.success(res, "Return status updated successfully", data);
});
