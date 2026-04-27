import express from "express";
const router = express.Router();

import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import pool from "../../config/db.js";

// ==========================================
// 1. CORE & TESTING ROUTES
// ==========================================
import redisTestRoute from "../../utils/redis-test.js";

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API v1 is working" });
});

router.get("/test-success", asyncHandler(async (req, res) => {
  return ApiResponse.success(res, "API working properly", { version: "v1" });
}));

router.get("/test-error", asyncHandler(async (req, res) => {
  throw new ApiError(400, "This is a test error", "TEST_ERROR");
}));

router.get("/test-db", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT NOW() AS time");
  return ApiResponse.success(res, "Database connected successfully", { serverTime: rows[0].time });
}));

router.use(redisTestRoute);


// ==========================================
// 2. AUTHENTICATION (Admin & Vendor)
// ==========================================
import authRoutes from '../../modules/auth/auth.routes.js';
router.use("/auth", authRoutes);


// ==========================================
// 3. ADMIN PLATFORM ROUTES
// ==========================================
import subadmins from '../../modules/subadmins/subadmin.routes.js';
import categoryRoutes from '../../modules/categories/category.routes.js';
import subCategoryRoutes from '../../modules/subcategory/subcategory.routes.js';
import brandRoutes from '../../modules/brands/brand.routes.js';
import tierRoutes from '../../modules/tiers/tier.routes.js';
import vendorRoutes from '../../modules/vendor/vendor.routes.js';
import bannerRoutes from '../../modules/banners/banners.routes.js';
import adminProductsRoutes from '../../modules/admin_products/admin_products.routes.js';
import adminOrdersRoutes from '../../modules/admin_orders/admin_orders.routes.js';
import customerAdminRoutes from '../../modules/admin_customers/customers.routes.js';
import couponRoutes from '../../modules/coupons/coupons.routes.js';
import deliveryChargeRoutes from '../../modules/delivery_charges/delivery_charges.routes.js';
import adminReviewsRoutes from '../../modules/admin_reviews/admin_reviews.routes.js';
import adminInvoicesRoutes from '../../modules/admin_invoices/admin_invoices.routes.js';
import adminTicketsRoutes from '../../modules/admin_tickets/admin_tickets.routes.js';

router.use("/subadmin", subadmins);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subCategoryRoutes);
router.use("/brands", brandRoutes);
router.use("/tiers", tierRoutes);
router.use("/vendors", vendorRoutes);
router.use("/banners", bannerRoutes);
router.use("/admin-products", adminProductsRoutes);
router.use("/admin-orders", adminOrdersRoutes);
router.use("/admin-customers", customerAdminRoutes);
router.use("/coupons", couponRoutes);
router.use("/delivery-charges", deliveryChargeRoutes);
router.use("/admin-reviews", adminReviewsRoutes);
router.use("/admin-invoices", adminInvoicesRoutes);
router.use("/admin-tickets", adminTicketsRoutes);


// ==========================================
// 4. VENDOR PLATFORM ROUTES
// ==========================================
import productRoutes from '../../modules/products/product.routes.js';
import vendorStaffRoutes from '../../modules/vendor-staff/vendor-staff.routes.js';
import vendorOrderRoutes from '../../modules/orders/orders.routes.js';
import vendorCustomerRoutes from '../../modules/vendor_customers/vendor_customers.routes.js';
import vendorSupportRoutes from '../../modules/vendor_support/vendor_support.routes.js';
import vendorReviewsRoutes from '../../modules/vendor_reviews/vendor_reviews.routes.js';
import vendorInvoiceRoutes from '../../modules/vendor_invoices/vendor_invoices.routes.js';
import vendorDashboardRoutes from '../../modules/vendor_dashboard/vendor_dashboard.routes.js';

router.use("/products", productRoutes);
router.use("/vendor-staff", vendorStaffRoutes);
router.use("/vendor/orders", vendorOrderRoutes);
router.use("/vendor/customers", vendorCustomerRoutes);
router.use("/vendor/support", vendorSupportRoutes);
router.use("/vendor/reviews", vendorReviewsRoutes);
router.use("/vendor/invoices", vendorInvoiceRoutes);
router.use("/vendor/dashboard", vendorDashboardRoutes);


// ==========================================
// 5. CUSTOMER APPLICATION ROUTES
// ==========================================
import customerAuthRoutes from '../../modules/customers/auth/customers.auth.routes.js';
import customerProfileRoutes from '../../modules/customers/profile/profile.routes.js';
import customerHomeRoutes from '../../modules/customers/home/home.routes.js';
import cartRoutes from '../../modules/customers/cart/cart.routes.js';
import wishlistRoutes from '../../modules/customers/wishlist/wishlist.routes.js';
import paymentGatewayRoutes from '../../modules/customers/payment_gateway/payment_gateway.routes.js';
import orderRoutes from '../../modules/customers/orders/orders.routes.js';
import customerSupportRoutes from '../../modules/customers/support/support.routes.js';
import customerReviewRoutes from '../../modules/customers/reviews/reviews.routes.js';

router.use("/customers", customerAuthRoutes);
router.use("/customers", customerProfileRoutes);
router.use("/customers", customerHomeRoutes);
router.use("/customers", cartRoutes);
router.use("/customers", wishlistRoutes);
router.use("/customers", paymentGatewayRoutes);
router.use("/customers", orderRoutes);
router.use("/customers", customerSupportRoutes);
router.use("/customers", customerReviewRoutes);


// ==========================================
// 6. GLOBAL & SETTINGS ROUTES
// ==========================================
import settingsRoutes from '../../modules/settings/settings.routes.js';
import helpSupportRoutes from '../../modules/help_support/help_support.routes.js';
import announcementsRoutes from '../../modules/announcements/announcements.routes.js';
import faqRoutes from '../../modules/faq/faq.routes.js';

router.use("/settings", settingsRoutes);
router.use("/help-support", helpSupportRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/faqs", faqRoutes);

export default router;