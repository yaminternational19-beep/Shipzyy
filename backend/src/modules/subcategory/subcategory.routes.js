import express from 'express';
const router = express.Router();

import controller from './subcategory.controller.js';
import validate from '../../middlewares/validate.js';

import { createSubCategorySchema,updateSubCategorySchema } from './subcategory.validator.js';

import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

/* ===============================
   GET SUBCATEGORIES
================================= */

router.get("/", authenticate, controller.getSubCategories);
router.post("/", authenticate, upload.single("image"), validate(createSubCategorySchema), controller.createSubCategory);
router.put("/:id", authenticate, upload.single("image"), validate(updateSubCategorySchema), controller.updateSubCategory);
router.delete("/:id", authenticate, controller.deleteSubCategory);
router.patch("/:id/status", authenticate, controller.toggleStatus);

export default router;