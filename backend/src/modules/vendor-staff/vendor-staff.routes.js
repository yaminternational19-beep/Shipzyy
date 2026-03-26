import express from 'express';
const router = express.Router();

import controller from './vendor-staff.controller.js';
import {
  createVendorStaffSchema,
  updateVendorStaffSchema,
  updatePermissionsSchema
} from './vendor-staff.validator.js';
import upload from '../../middlewares/upload.middleware.js';
import validate from '../../middlewares/validate.js';
import authenticate from '../../middlewares/auth.middleware.js';

/* ===============================
   VENDOR STAFF ROUTES
================================= */

router.get('/',           authenticate, controller.getVendorStaff);
router.post('/',          authenticate, upload.single('profilePhoto'), validate(createVendorStaffSchema), controller.createVendorStaff);
router.put('/:id',        authenticate, upload.single('profilePhoto'), validate(updateVendorStaffSchema), controller.updateVendorStaff);
router.delete('/:id',     authenticate, controller.deleteVendorStaff);
router.patch('/:id/status',      authenticate, controller.toggleStatus);
router.patch('/:id/permissions', authenticate, validate(updatePermissionsSchema), controller.updatePermissions);


export default router;
