import express from "express";
import * as ordersController from "./orders.controller.js";
import customerAuthMiddleware from "../../../middlewares/customer.auth.middleware.js";
import validate from "../../../middlewares/validate.js";
import { placeOrderSchema } from "./orders.validator.js";

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

export default router;
