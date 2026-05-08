import db from "../../config/db.js";
import { getFromCache, setToCache } from "../../utils/cache.js";

class AdminDashboardService {
    async getDashboardStats(role, userId) {
        const cacheKey = `admin:stats:${role}:${userId}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        // 1. Customer Stats
        const [[customerStats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status IN ('suspended', 'terminated') THEN 1 END) as inactive
            FROM customers
        `);

        // 2. Vendor Stats
        const [[vendorStats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN kyc_status = 'Approved' THEN 1 END) as active,
                COUNT(CASE WHEN kyc_status = 'Pending' THEN 1 END) as pending,
                COUNT(CASE WHEN kyc_status = 'Rejected' THEN 1 END) as rejected
            FROM vendors
        `);

        // 3. Order Stats
        const [[orderStats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN order_status = 'Pending' THEN 1 END) as pending,
                COUNT(CASE WHEN order_status = 'Delivered' THEN 1 END) as completed,
                COUNT(CASE WHEN order_status = 'Cancelled' THEN 1 END) as cancelled
            FROM orders
        `);

        // 4. Rider Stats (Check if table exists)
        let riderStats = { total: 0, active: 0, inactive: 0 };
        try {
            const [[res]] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                    COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive
                FROM riders
            `);
            riderStats = res;
        } catch (e) {
            console.warn("Riders table not found, returning 0");
        }

        // 5. Revenue Stats
        const now = new Date();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [[revenueStats]] = await db.query(`
            SELECT 
                SUM(total_amount) as total,
                SUM(CASE WHEN created_at >= ? THEN total_amount ELSE 0 END) as today,
                SUM(CASE WHEN created_at >= ? THEN total_amount ELSE 0 END) as monthly
            FROM orders
            WHERE payment_status = 'Paid'
        `, [todayStart, monthStart]);

        // 6. Product Stats
        const [[productStats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_active = 1 AND approval_status = 'APPROVED' THEN 1 END) as active,
                SUM(CASE WHEN EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.stock <= 0) THEN 1 ELSE 0 END) as outOfStock
            FROM products p
        `);

        // 7. Categories & Branches
        const [[miscStats]] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM categories) as totalCategories,
                (SELECT COUNT(*) FROM subcategories) as totalSubcategories,
                (SELECT COUNT(*) FROM vendors WHERE kyc_status = 'Approved') as totalStores
        `);

        const result = {
            customers: customerStats,
            vendors: vendorStats,
            orders: orderStats,
            riders: riderStats,
            revenue: {
                total: revenueStats.total || 0,
                today: revenueStats.today || 0,
                monthly: revenueStats.monthly || 0
            },
            products: productStats,
            categories: {
                total: miscStats.totalCategories,
                subtotal: miscStats.totalSubcategories
            },
            stores: miscStats.totalStores
        };

        await setToCache(cacheKey, result, 300); // 5 mins cache
        return result;
    }

    async getRecentActivities() {
        const [recentOrders] = await db.query(`
            SELECT o.order_number, o.total_amount, o.order_status, o.created_at, c.name as customer_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);

        const [recentCustomers] = await db.query(`
            SELECT name, email, created_at, status
            FROM customers
            ORDER BY created_at DESC
            LIMIT 10
        `);

        const [recentVendors] = await db.query(`
            SELECT business_name as store_name, email, created_at, kyc_status as approval_status
            FROM vendors
            ORDER BY created_at DESC
            LIMIT 10
        `);

        return {
            orders: recentOrders,
            customers: recentCustomers,
            vendors: recentVendors
        };
    }

    async getAnalytics(params) {
        const { period = '7days' } = params;
        const now = new Date();
        let startDate;

        if (period === '7days') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 1);
        } else {
            startDate = new Date();
            startDate.setFullYear(now.getFullYear() - 1);
        }

        const [revenueData] = await db.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders
            FROM orders
            WHERE created_at >= ? AND payment_status = 'Paid'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate]);

        const [growthData] = await db.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM customers
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate]);

        return {
            revenue: revenueData.map(d => ({ ...d, date: d.date.toLocaleDateString() })),
            growth: growthData.map(d => ({ ...d, date: d.date.toLocaleDateString() }))
        };
    }

    async getTopSellingProducts() {
        const [products] = await db.query(`
            SELECT p.name, COUNT(oi.id) as sales_count, SUM(oi.price * oi.quantity) as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY sales_count DESC
            LIMIT 5
        `);
        return products;
    }

    async getTopVendors() {
        const [vendors] = await db.query(`
            SELECT v.business_name as store_name, COUNT(o.id) as order_count, SUM(o.total_amount) as total_revenue
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN vendors v ON oi.vendor_id = v.id
            GROUP BY v.id
            ORDER BY order_count DESC
            LIMIT 5
        `);
        return vendors;
    }
}

export default new AdminDashboardService();
