import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import service from "./vendor_support.service.js";

const getFaqs = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor_id;
  const result = await service.getFaqs(vendorId, req.query);
  return ApiResponse.success(res, "Vendor FAQs fetched successfully", result);
});

const getHelp = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor_id;
  const result = await service.getHelp(vendorId);
  return ApiResponse.success(res, "Vendor help contacts fetched successfully", result);
});

const createTicket = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor_id;
  const { subject, message, supportContactId } = req.body;
  if (!subject || !message) {
    throw new ApiError(400, "Subject and message are required");
  }
  if (!supportContactId) {
    throw new ApiError(400, "Support contact ID is required");
  }
  await service.createTicket(
    vendorId,
    subject,
    message,
    supportContactId
  );
  return ApiResponse.success(res, "Support ticket created successfully");
});

export default { getFaqs, getHelp, createTicket };
