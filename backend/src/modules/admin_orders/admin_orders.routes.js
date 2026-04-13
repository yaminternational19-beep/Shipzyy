import express from 'express';
const router = express.Router();

import adminOrders from './admin_orders.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';

router.get("/", authenticate, adminOrders.getOrders);
router.get("/:id", authenticate, adminOrders.getOrderById);

export default router;
