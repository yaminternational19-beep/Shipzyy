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
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "imageUrls", maxCount: 5 }
  ]),
  validate(createReviewSchema),
  reviewsController.createReview
);

/**
 * Edit a review
 * PUT /api/v1/customers/reviews/:reviewId
 */
router.put(
  "/reviews/:reviewId",
  customerAuth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "imageUrls", maxCount: 5 }
  ]),
  reviewsController.updateReview
);

/**
 * Delete a review
 * DELETE /api/v1/customers/reviews/:reviewId
 */
router.delete(
  "/reviews/:reviewId",
  customerAuth,
  reviewsController.deleteReview
);



export default router;
