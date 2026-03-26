import express from 'express';
const router = express.Router();

import controller from './subadmin.controller.js';
import { createSubAdminSchema,
  updateSubAdminSchema,
  updatePermissionsSchema, } from './subadmin.validator.js';
import upload from '../../middlewares/upload.middleware.js';
import validate from '../../middlewares/validate.js';
import authenticate from '../../middlewares/auth.middleware.js';

/* ===============================
   GET SUB ADMINS
================================= */
router.get("/", authenticate, controller.getSubAdmins);
router.post("/", authenticate, upload.single("profilePhoto"), validate(createSubAdminSchema), controller.createSubAdmin);
router.put("/:id", authenticate, upload.single("profilePhoto"), validate(updateSubAdminSchema), controller.updateSubAdmin);
router.delete("/:id", authenticate, controller.deleteSubAdmin);
router.patch("/:id/status", authenticate, controller.toggleStatus);
router.patch("/:id/permissions", authenticate, validate(updatePermissionsSchema), controller.updatePermissions);



export default router;

