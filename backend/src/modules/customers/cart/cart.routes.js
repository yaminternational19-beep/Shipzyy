import express from "express";
import * as cartController from "./cart.controller.js";
import customerAuthMiddleware from "../../../middlewares/customer.auth.middleware.js";
import optionalCustomerAuth from "../../../middlewares/optionalCustomerAuth.middleware.js";
import validate from "../../../middlewares/validate.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.validator.js";

const router = express.Router();

// Get cart items (Optional auth for is_logged_in flag)
router.get("/cart", optionalCustomerAuth, cartController.getCart);

// Add item to cart (Using optional auth to return custom login message in controller)
router.post("/cart", optionalCustomerAuth, validate(addToCartSchema), cartController.addItemToCart);

// Remove items from cart (Using optional auth to return custom login message in controller)
router.delete("/cart", optionalCustomerAuth, validate(removeFromCartSchema), cartController.removeItemFromCart);

// Clear all cart items
router.delete("/cart/all", optionalCustomerAuth, cartController.clearCart);

export default router;

