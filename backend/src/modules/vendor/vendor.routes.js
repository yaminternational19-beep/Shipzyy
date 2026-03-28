import express from 'express';
import controller from './vendor.controller.js';
import validate from '../../middlewares/validate.js';
import { 
    createVendorSchema, 
    updateVendorSchema, 
    updateStatusSchema, 
    updateKycStatusSchema,
    autoApproveSchema
} from './vendor.validator.js';
import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

const router = express.Router();

const vendorUpload = upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'aadhar_doc', maxCount: 1 },
    { name: 'pan_doc', maxCount: 1 },
    { name: 'license_doc', maxCount: 1 },
    { name: 'fassi_doc', maxCount: 1 },
    { name: 'gst_doc', maxCount: 1 }
]);

/* ===============================
   VENDORS
================================= */

router.post("/", authenticate, vendorUpload, validate(createVendorSchema), controller.createVendor);
router.get("/", authenticate, controller.getAllVendors);
router.put("/:id", authenticate, vendorUpload, validate(updateVendorSchema), controller.updateVendor);
router.patch("/:id/status", authenticate, validate(updateStatusSchema), controller.updateStatus);
router.patch("/:id/kyc", authenticate, validate(updateKycStatusSchema), controller.updateKycStatus);
router.put("/:id/auto-approve", authenticate, validate(autoApproveSchema), controller.updateAutoApproveStatus);

export default router;