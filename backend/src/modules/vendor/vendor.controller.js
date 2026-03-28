import service from './vendor.service.js';
import ApiResponse from '../../utils/apiResponse.js';
import { isEmailExists } from '../../services/global.service.js';

/* ===============================
   CREATE VENDOR
================================= */

export const createVendor = async (req, res) => {
    try {
        if (req.body.email) {
            const emailExists = await isEmailExists(req.body.email);
            if (emailExists) {
                return ApiResponse.error(res, "Email already exists in system", 400);
            }
        }

        const vendor = await service.createVendor(req.body, req.files);

        return ApiResponse.success(res, "Vendor created successfully", vendor);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to create vendor");
    }
};

/* ===============================
   GET ALL VENDORS
================================= */

export const getAllVendors = async (req, res) => {
    try {
        const vendors = await service.getAllVendors(req.query);
        return ApiResponse.success(res, "Vendors fetched successfully", vendors);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to fetch vendors");
    }
};


/* ===============================
   UPDATE VENDOR
================================= */

export const updateVendor = async (req, res) => {
    try {
        if (req.body.email) {
            const emailExists = await isEmailExists(req.body.email, req.params.id, "vendors");
            if (emailExists) {
                return ApiResponse.error(res, "Email already exists in system", 400);
            }
        }

        const result = await service.updateVendor(req.params.id, req.body, req.files);

        return ApiResponse.success(res, "Vendor updated successfully", result);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update vendor");
    }
};

/* ===============================
   UPDATE VENDOR STATUS
================================= */

export const updateStatus = async (req, res) => {
    try {
        const result = await service.updateStatus(req.params.id, req.body.status);

        return ApiResponse.success(res, "Vendor status updated successfully", result);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update vendor status");
    }
};

/* ===============================
   UPDATE KYC STATUS
================================= */

export const updateKycStatus = async (req, res) => {
    try {
        const result = await service.updateKycStatus(req.params.id, req.body, req.user.id);

        return ApiResponse.success(res, "KYC status updated successfully", result);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update KYC status");
    }
};



/* ===============================
   UPDATE AUTO APPROVE STATUS
================================= */

export const updateAutoApproveStatus = async (req, res) => {
    try {
        const result = await service.autoapproval(req.params.id, req.body.auto_approve_products);

        return ApiResponse.success(res, "Vendor auto approval status updated successfully", result);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update vendor auto approval status");
    }
};

export default {
    createVendor,
    getAllVendors,
    updateVendor,
    updateStatus,
    updateKycStatus,
    updateAutoApproveStatus
};
