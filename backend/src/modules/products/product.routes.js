import express from 'express';
const router = express.Router();

import productController from './product.controller.js';
import { createProductSchema } from './product.validator.js';
import validate from '../../middlewares/validate.js';
import upload from '../../middlewares/upload.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import jsonParser from '../../middlewares/jsonParser.js';

// GET all products with pagination and filters
router.get("/", authenticate, productController.getAllProducts);

// POST create product with images
router.post("/", 
  authenticate,
  upload.array("images", 10),
  jsonParser(['specification', 'variants', 'images']),
  productController.createProduct
);

// POST bulk create products
router.post("/bulk-create", authenticate, productController.bulkCreateProducts);

// PUT update stock
import { updateStockSchema } from './product.validator.js';
router.put("/update-stock", authenticate, validate(updateStockSchema), productController.updateStock);

// PUT update product with images
router.put("/:id", 
  authenticate,
  upload.array("images", 10),
  jsonParser(['specification', 'variants', 'images']),
  productController.updateProduct
);

// PATCH toggle live status
router.patch("/:id/toggle-live", authenticate, productController.toggleLive);

// DELETE product
router.delete("/:id", authenticate, productController.deleteProduct);

export default router;