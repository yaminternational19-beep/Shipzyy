import express from 'express';
const router = express.Router();

import adminProducts from './admin_products.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';

router.get("/", authenticate, adminProducts.getProducts);
router.get("/:id", authenticate, adminProducts.getProductById);
router.patch("/:id/approval", authenticate, adminProducts.updateProductStatus);

export default router;

