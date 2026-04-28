import express from "express";
import * as ordersController from "./orders.controller.js";
import customerAuthMiddleware from "../../../middlewares/customer.auth.middleware.js";
import validate from "../../../middlewares/validate.js";
import upload from "../../../middlewares/upload.middleware.js";
import { placeOrderSchema, cancelItemSchema, returnItemSchema } from "./orders.validator.js";

const router = express.Router();

// Checkout API (Requires Authentication)
router.get("/checkout", customerAuthMiddleware, ordersController.getCheckoutSummary);

// Place Order API
router.post(
  "/place-order",
  customerAuthMiddleware,
  validate(placeOrderSchema, "body"),
  ordersController.placeOrder
);

// Order History List
router.get("/orders-list", customerAuthMiddleware, ordersController.getOrderHistory);

// Single Order Detail
router.get("/orders-list/:orderId", customerAuthMiddleware, ordersController.getOrderDetails);

// Cancel Order Item
router.put(
  "/cancel-item",
  customerAuthMiddleware,
  validate(cancelItemSchema, "body"),
  ordersController.cancelOrderItem
);

// Return Order Item
router.post(
  "/return-item",
  customerAuthMiddleware,
  upload.array("images", 5),
  validate(returnItemSchema, "body"),
  ordersController.returnOrderItem
);

export default router;
