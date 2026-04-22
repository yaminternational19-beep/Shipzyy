import VendorDashboardService from "./vendor_dashboard.services.js";
import asyncHandler from "../../utils/asyncHandler.js";

const getDashboardData = asyncHandler(async (req, res) => {
    // If it's a vendor, use their ID from token. Otherwise, use query param for admin view.
    const isVendor = ['VENDOR', 'VENDOR_OWNER', 'PARTNER'].includes(req.user.role);
    const vendorId = isVendor ? (req.user.vendor_id || req.user.id) : req.query.vendorId;

    if (!vendorId) {
        return res.status(400).json({ success: false, message: "Vendor ID is required" });
    }

    const [stats, recentOrders, inventoryAlerts, feedback, topProducts, revenueAnalytics] = await Promise.all([
        VendorDashboardService.getDashboardStats(vendorId),
        VendorDashboardService.getRecentOrders(vendorId),
        VendorDashboardService.getInventoryAlerts(vendorId),
        VendorDashboardService.getCustomerFeedback(vendorId),
        VendorDashboardService.getTopProducts(vendorId),
        VendorDashboardService.getRevenueAnalytics(vendorId, req.query)
    ]);

    res.json({
        success: true,
        data: {
            stats,
            recentOrders,
            inventoryAlerts,
            feedback,
            topProducts,
            revenueAnalytics
        }
    });
});

export default {
    getDashboardData
};
