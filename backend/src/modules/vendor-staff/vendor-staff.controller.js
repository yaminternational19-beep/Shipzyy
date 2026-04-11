import ApiResponse from '../../utils/apiResponse.js';
import service from './vendor-staff.service.js';
import { uploadFile, deleteFile } from '../../services/s3Service.js';
import bcrypt from 'bcryptjs';
import { isEmailExists } from '../../services/global.service.js';
import emailService from '../../services/emailService.js';
import vendorService from '../vendor/vendor.service.js';

/* ===============================
   GET VENDOR STAFF
================================= */

export const getVendorStaff = async (req, res) => {
  try {
    const result = await service.getVendorStaff(req.query);
    return ApiResponse.success(res, 'Vendor staff fetched', result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


/* ===============================
   CREATE VENDOR STAFF
================================= */

export const createVendorStaff = async (req, res) => {
  try {

    if (req.body.email) {
      const emailExists = await isEmailExists(req.body.email);
      if (emailExists) {
        return ApiResponse.error(res, "Email already exists in system", 400);
      }
    }

    let profilePhoto = null;
    let profilePhotoKey = null;

    if (req.file) {
      const uploadResult = await uploadFile(req.file, 'vendor-staff');
      profilePhoto = uploadResult.url;
      profilePhotoKey = uploadResult.key;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const payload = {
      ...req.body,
      vendor_id: req.user.vendor_id,
      password: hashedPassword,
      profilePhoto,
      profilePhotoKey
    };

    const result = await service.createVendorStaff(payload);

    // Send welcome email
    if (req.body.email && req.body.password) {
      try {
        const vendor = await vendorService.getVendorById(req.user.vendor_id);
        const vendorName = vendor?.business_name || "your company";
        
        await emailService.sendVendorStaffWelcomeMail(
          req.body.email,
          req.body.password,
          req.body.name || "Team Member",
          vendorName
        );
      } catch (emailErr) {
        console.error("Staff welcome email failed:", emailErr.message);
      }
    }

    return ApiResponse.success(res, 'Vendor staff created successfully', result, 201);

  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


/* ===============================
   UPDATE VENDOR STAFF
================================= */

export const updateVendorStaff = async (req, res) => {
  try {

    const id = req.params.id;
    const existing = await service.getVendorStaffById(id);

    if (!existing) {
      return ApiResponse.error(res, 'Vendor staff not found', 404);
    }

    if (req.body.email) {
      const emailExists = await isEmailExists(req.body.email, id, "vendor_staff");
      if (emailExists) {
        return ApiResponse.error(res, "Email already exists in system", 400);
      }
    }

    let profilePhoto = existing.profile_photo;
    let profilePhotoKey = existing.profile_photo_key;

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return ApiResponse.error(res, 'Only JPG, JPEG, PNG images allowed', 400);
      }
      const uploadResult = await uploadFile(req.file, 'vendor-staff/profiles');
      profilePhoto = uploadResult.url;
      profilePhotoKey = uploadResult.key;
    }

    const payload = {
      name:                req.body.name                || existing.name,
      email:               req.body.email               || existing.email,
      countryCode:         req.body.countryCode         || existing.country_code,
      mobile:              req.body.mobile              || existing.mobile,
      address:             req.body.address             || existing.address,
      state:               req.body.state               || existing.state,
      country:             req.body.country             || existing.country,
      pincode:             req.body.pincode             || existing.pincode,
      emergencyCountryCode: req.body.emergencyCountryCode || existing.emergency_country_code,
      emergencyMobile:     req.body.emergencyMobile     || existing.emergency_mobile,
      role:                req.body.role                || existing.role,
      status:              req.body.status              || existing.status,
      profilePhoto,
      profilePhotoKey
    };

    if (req.body.password) {
      payload.password = await bcrypt.hash(req.body.password, 10);
    }

    const result = await service.updateVendorStaff(id, payload);

    if (req.file && existing.profile_photo_key) {
      try { await deleteFile(existing.profile_photo_key); } catch (e) {
        console.error('Old image deletion failed:', e.message);
      }
    }

    return ApiResponse.success(res, 'Vendor staff updated', result);

  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


/* ===============================
   TOGGLE STATUS
================================= */

export const toggleStatus = async (req, res) => {
  try {
    const result = await service.toggleStatus(req.params.id);
    if (!result) return ApiResponse.error(res, 'Vendor staff not found', 404);
    return ApiResponse.success(res, 'Status updated successfully', result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


/* ===============================
   DELETE VENDOR STAFF
================================= */

export const deleteVendorStaff = async (req, res) => {
  try {
    const result = await service.deleteVendorStaff(req.params.id);
    if (result?.error) return ApiResponse.error(res, result.error, 400);
    return ApiResponse.success(res, 'Vendor staff deleted successfully');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


/* ===============================
   UPDATE PERMISSIONS
================================= */

export const updatePermissions = async (req, res) => {
  try {
    const result = await service.updatePermissions(req.params.id, req.body.permissions);
    if (!result) return ApiResponse.error(res, 'Vendor staff not found', 404);
    return ApiResponse.success(res, 'Permissions updated successfully', result);
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};


export default { getVendorStaff, createVendorStaff, updateVendorStaff, toggleStatus, deleteVendorStaff, updatePermissions };
