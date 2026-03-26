import express from 'express';
const router = express.Router();

import controller from './brand.controller.js';
import validate from '../../middlewares/validate.js';

import { createBrandSchema,updateBrandSchema } from './brand.validator.js';

import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

/* ===============================
   GET BRANDS
================================= */

router.get("/", authenticate, controller.getBrands);
router.post("/", authenticate, upload.single("image"), validate(createBrandSchema), controller.createBrand);
router.put("/:id", authenticate, upload.single("image"), validate(updateBrandSchema), controller.updateBrand);
router.delete("/:id", authenticate, controller.deleteBrand);
router.patch("/:id/status", authenticate, controller.toggleStatus);

export default router;