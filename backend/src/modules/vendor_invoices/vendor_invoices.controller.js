import * as vendorInvoicesService from "./vendor_invoices.services.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";

/**
 * Get vendor invoice list
 */
export const getVendorInvoices = asyncHandler(async (req, res) => {
    const vendorId = req.user?.id; // Assuming req.user contains vendor info from middleware
    const result = await vendorInvoicesService.listVendorInvoices(vendorId, req.query);
    return ApiResponse.success(res, "Invoices fetched successfully", result);
});
