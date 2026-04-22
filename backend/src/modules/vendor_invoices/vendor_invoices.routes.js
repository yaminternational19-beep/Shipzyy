import express from "express";
import * as vendorInvoicesController from "./vendor_invoices.controller.js";
import  authMiddleware  from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, vendorInvoicesController.getVendorInvoices);
router.get("/download/:id", authMiddleware, vendorInvoicesController.downloadInvoice);

export default router;
    