import express from "express";
import * as cartController from "./cart.controller.js";
import customerAuthMiddleware from "../../../middlewares/customer.auth.middleware.js";
import validate from "../../../middlewares/validate.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.validator.js";

const router = express.Router();

/**
 * All routes in this file are for customers
 * and require a valid customer token.
 */
router.use(customerAuthMiddleware);

// Get cart items
router.get("/cart", cartController.getCart);

// Add item to cart
router.post("/cart", validate(addToCartSchema), cartController.addItemToCart);

// Remove items from cart (single, multiple, or all)
router.delete("/cart", validate(removeFromCartSchema), cartController.removeItemFromCart);

export default router;
