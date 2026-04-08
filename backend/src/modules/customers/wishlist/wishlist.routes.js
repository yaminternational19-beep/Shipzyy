import express from "express";
import * as wishlistController from "./wishlist.controller.js";
import optionalCustomerAuth from "../../../middlewares/optionalCustomerAuth.middleware.js";
import validate from "../../../middlewares/validate.js";
import { toggleWishlistSchema } from "./wishlist.validator.js";

const router = express.Router();

// Get all wishlist products (Optional auth)
router.get("/wishlist", optionalCustomerAuth, wishlistController.getWishlist);

// Toggle product in wishlist (Optional auth for custom login message)
router.post("/wishlist", optionalCustomerAuth, validate(toggleWishlistSchema), wishlistController.toggleWishlist);

export default router;
