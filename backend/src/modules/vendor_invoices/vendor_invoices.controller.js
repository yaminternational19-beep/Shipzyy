import * as vendorInvoicesService from "./vendor_invoices.services.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import axios from "axios";

/**
 * Get vendor invoice list
 */
export const getVendorInvoices = asyncHandler(async (req, res) => {
    const vendorId = req.user?.id; // Assuming req.user contains vendor info from middleware
    const result = await vendorInvoicesService.listVendorInvoices(vendorId, req.query);
    return ApiResponse.success(res, "Invoices fetched successfully", result);
});

/**
 * Download vendor invoice
 */
export const downloadInvoice = asyncHandler(async (req, res) => {
    const vendorId = req.user?.id;
    const { id } = req.params;
    
    const invoice = await vendorInvoicesService.getInvoiceById(vendorId, id);
    
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
