import * as adminInvoicesService from "./admin_invoices.services.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import axios from "axios";

/**
 * Get vendor invoice list for admin
 */
export const getVendorInvoices = asyncHandler(async (req, res) => {
    const result = await adminInvoicesService.listVendorInvoices(req.query);
    return ApiResponse.success(res, "Vendor invoices fetched successfully", result);
});

/**
 * Get invoice history for a specific vendor
 */
export const getVendorInvoiceHistory = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const result = await adminInvoicesService.getVendorInvoiceHistory(vendorId, req.query);
    return ApiResponse.success(res, "Vendor invoice history fetched successfully", result);
});

/**
 * Get customer invoice list for admin
 */
export const getCustomerInvoices = asyncHandler(async (req, res) => {
    const result = await adminInvoicesService.listCustomerInvoices(req.query);
    return ApiResponse.success(res, "Customer invoices fetched successfully", result);
});

/**
 * Get invoice history for a specific customer
 */
export const getCustomerInvoiceHistory = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const result = await adminInvoicesService.getCustomerInvoiceHistory(customerId, req.query);
    return ApiResponse.success(res, "Customer invoice history fetched successfully", result);
});

/**
 * Download vendor invoice
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const invoice = await adminInvoicesService.getInvoiceById(id);
    
    if (!invoice || !invoice.invoice_url) {
        return res.status(404).json({ success: false, message: "Invoice not found or URL missing" });
    }

    try {
        const response = await axios({
            method: 'get',
            url: invoice.invoice_url,
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoice_id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        
        response.data.pipe(res);
    } catch (error) {
        console.error("Error streaming invoice:", error);
        return res.status(500).json({ success: false, message: "Failed to download invoice" });
    }
});

/**
 * Download customer invoice
 */
export const downloadCustomerInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const invoice = await adminInvoicesService.getCustomerInvoiceById(id);
    
    if (!invoice || !invoice.invoice_url) {
        return res.status(404).json({ success: false, message: "Invoice not found or URL missing" });
    }

    try {
        const response = await axios({
            method: 'get',
            url: invoice.invoice_url,
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoice_id}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        
        response.data.pipe(res);
    } catch (error) {
        console.error("Error streaming invoice:", error);
        return res.status(500).json({ success: false, message: "Failed to download invoice" });
    }
});
