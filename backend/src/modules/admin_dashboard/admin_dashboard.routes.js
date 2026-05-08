import { Router } from "express";
import AdminDashboardController from "./admin_dashboard.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/stats", authenticate, AdminDashboardController.getStats);
router.get("/activities", authenticate, AdminDashboardController.getActivities);
router.get("/analytics", authenticate, AdminDashboardController.getAnalytics);
router.get("/top-entities", authenticate, AdminDashboardController.getTopEntities);

export default router;
