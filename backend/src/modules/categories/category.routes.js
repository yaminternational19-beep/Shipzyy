import express from 'express';
const router = express.Router();

import controller from './category.controller.js';
import validate from '../../middlewares/validate.js';
import { createCategorySchema, updateCategorySchema } from './category.validator.js';

import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

// GET categories
router.get("/", authenticate, controller.getCategories);
router.post("/", authenticate, upload.fields([{ name: "image", maxCount: 1 }, { name: "banner_image", maxCount: 1 }]), validate(createCategorySchema), controller.createCategory);
router.put("/:id", authenticate, upload.fields([{ name: "image", maxCount: 1 }, { name: "banner_image", maxCount: 1 }]), validate(updateCategorySchema), controller.updateCategory);
router.delete("/:id", authenticate, controller.deleteCategory);
router.patch("/:id/status", authenticate, controller.toggleStatus);

export default router;