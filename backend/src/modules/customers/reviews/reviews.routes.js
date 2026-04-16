import { Router } from "express";
import customerAuth from "../../../middlewares/customer.auth.middleware.js";
import upload from "../../../middlewares/upload.middleware.js";
import validate from "../../../middlewares/validate.js";
import { createReviewSchema } from "./reviews.validator.js";
import reviewsController from "./reviews.controller.js";

const router = Router();

/**
 * Submit a review with optional images
 * POST /api/v1/customers/reviews
 */
router.post(
  "/reviews",
  customerAuth,
  upload.array("images", 5), // Allow up to 5 images
  validate(createReviewSchema),
  reviewsController.createReview
);



export default router;
