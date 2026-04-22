import { Router } from "express";
import VendorDashboardController from "./vendor_dashboard.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";

const router = Router();

router.get(
    "/data", 
    authenticate, 
    VendorDashboardController.getDashboardData
);

export default router;
