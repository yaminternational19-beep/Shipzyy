import { Router } from "express";
import vendorReviewsController from "./vendor_reviews.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, vendorReviewsController.getReviews);

export default router;
