import express from "express";
import * as adminInvoicesController from "./admin_invoices.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/role.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/vendor-invoices", adminInvoicesController.getVendorInvoices);
router.get("/vendor-invoices/history/:vendorId", adminInvoicesController.getVendorInvoiceHistory);
router.get("/vendor-invoices/:id/download", adminInvoicesController.downloadInvoice);

// Customer Invoice Routes
router.get("/customer-invoices", adminInvoicesController.getCustomerInvoices);
router.get("/customer-invoices/history/:customerId", adminInvoicesController.getCustomerInvoiceHistory);
router.get("/customer-invoices/:id/download", adminInvoicesController.downloadCustomerInvoice);

export default router;
