import express from 'express';
const router = express.Router();

import controller from './banners.controller.js';
import validate from '../../middlewares/validate.js';
import { createBannerSchema, updateBannerSchema } from './banners.validator.js';
import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

// GET banners
router.get("/", authenticate, controller.getBanners);

// CREATE banner
router.post("/", authenticate, upload.single("banner_image"), validate(createBannerSchema), controller.createBanner);

// UPDATE banner
router.put("/:id", authenticate, upload.single("banner_image"), validate(updateBannerSchema), controller.updateBanner);

// DELETE banner
router.delete("/:id", authenticate, controller.deleteBanner);

export default router;
