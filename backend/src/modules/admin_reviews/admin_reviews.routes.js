import { Router } from "express";
import adminReviewsController from "./admin_reviews.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

// To be consistent with other admin routes, we might need a role check, 
// but authMiddleware already validates the token.
router.get("/", authMiddleware, adminReviewsController.getReviews);

export default router;
