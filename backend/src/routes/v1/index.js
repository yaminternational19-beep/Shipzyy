import express from "express";
const router = express.Router();

import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import pool from "../../config/db.js";

// Example route
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API v1 is working" });
});

router.get(
  "/test-success",
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, "API working properly", {
      version: "v1"
    });
  })
);

router.get(
  "/test-error",
  asyncHandler(async (req, res) => {
    throw new ApiError(400, "This is a test error", "TEST_ERROR");
  })
);

router.get(
  "/test-db",
  asyncHandler(async (req, res) => {

    const [rows] = await pool.query("SELECT NOW() AS time");

    return ApiResponse.success(res, "Database connected successfully", {
      serverTime: rows[0].time
    });

  })
);

import redisTestRoute from "../../utils/redis-test.js";
router.use(redisTestRoute);


import productRoutes from '../../modules/products/product.routes.js';

router.use("/products", productRoutes);


import authRoutes from '../../modules/auth/auth.routes.js';

router.use("/auth", authRoutes);



import subadmins from '../../modules/subadmins/subadmin.routes.js';

router.use("/subadmin", subadmins);

import categoryRoutes from '../../modules/categories/category.routes.js';

router.use("/categories", categoryRoutes);

import bannerRoutes from '../../modules/banners/banners.routes.js';
router.use("/banners", bannerRoutes);


import subCategoryRoutes from '../../modules/subcategory/subcategory.routes.js';

router.use("/subcategories", subCategoryRoutes);


import brandRoutes from '../../modules/brands/brand.routes.js';

router.use("/brands", brandRoutes);


import tierRoutes from '../../modules/tiers/tier.routes.js';

router.use("/tiers", tierRoutes);


import vendorRoutes from '../../modules/vendor/vendor.routes.js';

router.use("/vendors", vendorRoutes);


import vendorStaffRoutes from '../../modules/vendor-staff/vendor-staff.routes.js';
import vendorOrderRoutes from '../../modules/orders/orders.routes.js';
import vendorCustomerRoutes from '../../modules/vendor_customers/vendor_customers.routes.js';

router.use("/vendor-staff", vendorStaffRoutes);
router.use("/vendor/orders", vendorOrderRoutes);
router.use("/vendor/customers", vendorCustomerRoutes);


import adminProductsRoutes from '../../modules/admin_products/admin_products.routes.js';
import adminOrdersRoutes from '../../modules/admin_orders/admin_orders.routes.js';

router.use("/admin-products", adminProductsRoutes);
router.use("/admin-orders", adminOrdersRoutes);

import customerAdminRoutes from '../../modules/admin_customers/customers.routes.js';

router.use("/admin-customers", customerAdminRoutes);

import couponRoutes from '../../modules/coupons/coupons.routes.js';
router.use("/coupons", couponRoutes);

import deliveryChargeRoutes from '../../modules/delivery_charges/delivery_charges.routes.js';
router.use("/delivery-charges", deliveryChargeRoutes);





import customerAuthRoutes from '../../modules/customers/auth/customers.auth.routes.js';
import customerProfileRoutes from '../../modules/customers/profile/profile.routes.js';
import customerHomeRoutes from '../../modules/customers/home/home.routes.js';
import cartRoutes from '../../modules/customers/cart/cart.routes.js';
import wishlistRoutes from '../../modules/customers/wishlist/wishlist.routes.js';
import paymentGatewayRoutes from '../../modules/customers/payment_gateway/payment_gateway.routes.js';
import orderRoutes from '../../modules/customers/orders/orders.routes.js';
import settingsRoutes from '../../modules/settings/settings.routes.js';
import helpSupportRoutes from '../../modules/help_support/help_support.routes.js';
import announcementsRoutes from '../../modules/announcements/announcements.routes.js';
import faqRoutes from '../../modules/faq/faq.routes.js';

router.use("/customers", customerAuthRoutes);
router.use("/customers", customerHomeRoutes);
router.use("/customers", customerProfileRoutes);
router.use("/customers", cartRoutes);
router.use("/customers", wishlistRoutes);
router.use("/customers", paymentGatewayRoutes);
router.use("/customers", orderRoutes);

router.use("/settings", settingsRoutes);
router.use("/help-support", helpSupportRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/faqs", faqRoutes);

export default router;