import AdminDashboardService from "./admin_dashboard.services.js";

class AdminDashboardController {
    async getStats(req, res) {
        try {
            const { role, id } = req.user;
            const stats = await AdminDashboardService.getDashboardStats(role, id);
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getActivities(req, res) {
        try {
            const activities = await AdminDashboardService.getRecentActivities();
            res.status(200).json({ success: true, data: activities });
        } catch (error) {
            console.error("Dashboard Activities Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getAnalytics(req, res) {
        try {
            const { period } = req.query;
            const analytics = await AdminDashboardService.getAnalytics({ period });
            res.status(200).json({ success: true, data: analytics });
        } catch (error) {
            console.error("Dashboard Analytics Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getTopEntities(req, res) {
        try {
            const products = await AdminDashboardService.getTopSellingProducts();
            const vendors = await AdminDashboardService.getTopVendors();
            res.status(200).json({ 
                success: true, 
                data: { 
                    topProducts: products, 
                    topVendors: vendors 
                } 
            });
        } catch (error) {
            console.error("Dashboard Top Entities Error:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

export default new AdminDashboardController();
