import db from "../../config/db.js";
import { getFromCache, setToCache } from "../../utils/cache.js";

class VendorDashboardService {
    async getDashboardStats(vendorId) {
        const cacheKey = `vendor:stats:${vendorId}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        const now = new Date();
        const past24Hours = new Date(now - 24 * 60 * 60 * 1000);
        const past7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const past30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
        
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const [[staffStats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive
            FROM vendor_staff
            WHERE vendor_id = ?
        `, [vendorId]);

        const [[revWeekly]] = await db.query(`
            SELECT SUM(oi.price * oi.quantity) as total
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.vendor_id = ? AND o.created_at >= ? AND o.payment_status = 'Paid'
        `, [vendorId, past7Days]);

        const [[revMonthly]] = await db.query(`
            SELECT SUM(oi.price * oi.quantity) as total
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.vendor_id = ? AND o.created_at >= ? AND o.payment_status = 'Paid'
        `, [vendorId, past30Days]);

        const [[productStats]] = await db.query(`
            SELECT COUNT(*) as total
            FROM products
            WHERE vendor_id = ? AND approval_status = 'APPROVED' AND is_live = 1 AND is_active = 1
        `, [vendorId]);

        const [[orderStats]] = await db.query(`
            SELECT COUNT(DISTINCT oi.order_id) as total
            FROM order_items oi
            WHERE oi.vendor_id = ?
        `, [vendorId]);

        const [[reviewStats]] = await db.query(`
            SELECT COUNT(*) as total, AVG(rating) as avgRating
            FROM customer_reviews
            WHERE vendor_id = ?
        `, [vendorId]);

        const [[pendingOrders]] = await db.query(`
            SELECT 
                COUNT(DISTINCT oi.order_id) as count,
                COUNT(DISTINCT CASE WHEN o.created_at < ? THEN oi.order_id END) as highPriority
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.vendor_id = ? AND o.order_status IN ('Pending', 'Confirmed', 'Shipped', 'Out for Delivery')
        `, [past24Hours, vendorId]);

        const [[lowStock]] = await db.query(`
            SELECT COUNT(*) as count
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            WHERE p.vendor_id = ? 
            AND pv.stock <= pv.low_stock_alert 
            AND p.approval_status = 'APPROVED'
            AND p.is_live = 1
            AND p.is_active = 1
            AND pv.is_live = 1
        `, [vendorId]);

        const [statusDist] = await db.query(`
            SELECT order_status as status, COUNT(*) as count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.vendor_id = ?
            GROUP BY order_status
        `, [vendorId]);

        // Get last 7 days revenue for sparkline
        const sparklineData = await this.getRevenueAnalytics(vendorId, { period: '7days' });

        const result = {
            staff: {
                total: staffStats.total || 0,
                active: staffStats.active || 0,
                inactive: staffStats.inactive || 0
            },
            revenue: {
                weekly: revWeekly.total || 0,
                monthly: revMonthly.total || 0,
                sparkline: sparklineData.map(d => d.revenue)
            },
            products: {
                total: productStats.total || 0
            },
            orders: {
                total: orderStats.total || 0,
                pending: pendingOrders.count || 0,
                highPriority: pendingOrders.highPriority || 0,
                distribution: statusDist.map(d => ({ name: d.status, value: d.count }))
            },
            reviews: {
                total: reviewStats.total || 0,
                avg: parseFloat(reviewStats.avgRating || 0).toFixed(1)
            },
            lowStock: {
                count: lowStock.count || 0
            },
            voucherUsage: {
                value: "18%",
                trend: "-2%",
                trendType: "down"
            }
        };

        await setToCache(cacheKey, result, 300); // 5 mins
        return result;
    }

    async getRecentOrders(vendorId) {
        const cacheKey = `vendor:recent_orders:${vendorId}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        const [orders] = await db.query(`
            SELECT 
                o.order_number as id,
                o.created_at as time,
                SUM(oi.price * oi.quantity) as amt,
                o.order_status as label
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.vendor_id = ?
            GROUP BY o.id, o.order_number, o.created_at, o.order_status
            ORDER BY o.created_at DESC
            LIMIT 5
        `, [vendorId]);

        const result = orders.map(ord => ({
            id: `#${ord.id}`,
            time: this.formatOrderTime(ord.time),
            amt: `₹${parseFloat(ord.amt || 0).toLocaleString()}`,
            status: this.getStatusClass(ord.label),
            label: ord.label
        }));

        await setToCache(cacheKey, result, 300);
        return result;
    }

    async getInventoryAlerts(vendorId) {
        const cacheKey = `vendor:inventory_alerts:${vendorId}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        const [alerts] = await db.query(`
            SELECT 
                p.name,
                pv.stock,
                pv.unit
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            WHERE p.vendor_id = ? 
            AND p.approval_status = 'APPROVED'
            AND p.is_live = 1
            AND p.is_active = 1
            AND pv.is_live = 1
            ORDER BY pv.stock ASC
            LIMIT 5
        `, [vendorId]);

        const result = alerts.map(item => ({
            name: item.name,
            stock: item.stock,
            unit: `${item.unit || 'units'} left`
        }));

        await setToCache(cacheKey, result, 300);
        return result;
    }

    async getCustomerFeedback(vendorId) {
        const [[reviews]] = await db.query(`
            SELECT 
                AVG(rating) as avgRating,
                COUNT(*) as totalReviews
            FROM customer_reviews
            WHERE vendor_id = ?
        `, [vendorId]);

        const [distribution] = await db.query(`
            SELECT 
                rating,
                COUNT(*) as count
            FROM customer_reviews
            WHERE vendor_id = ?
            GROUP BY rating
        `, [vendorId]);

        const distMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        distribution.forEach(d => {
            distMap[d.rating] = d.count;
        });

        const total = reviews.totalReviews || 0;
        const ratings = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: distMap[star],
            percentage: total > 0 ? Math.round((distMap[star] / total) * 100) : 0
        }));

        return {
            avgRating: parseFloat(reviews.avgRating || 0).toFixed(1),
            totalReviews: total,
            ratings
        };
    }

    async getTopProducts(vendorId) {
        const cacheKey = `vendor:top_products:${vendorId}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        const [products] = await db.query(`
            SELECT 
                p.id,
                p.name,
                c.name as category,
                SUM(pv.stock) as totalStock,
                SUM(oi.price * oi.quantity) as totalRevenue,
                COUNT(oi.id) as salesCount
            FROM products p
            JOIN categories c ON p.category_id = c.id
            JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            WHERE p.vendor_id = ?
            AND p.approval_status = 'APPROVED'
            AND p.is_live = 1
            AND p.is_active = 1
            GROUP BY p.id
            ORDER BY salesCount DESC
            LIMIT 5
        `, [vendorId]);

        const result = products.map((prod, i) => ({
            name: prod.name,
            sku: `VND-PRD-${String(prod.id).padStart(3, '0')}`,
            cat: prod.category,
            stock: prod.totalStock || 0,
            rev: `₹${parseFloat(prod.totalRevenue || 0).toLocaleString()}`,
            status: 'success'
        }));

        await setToCache(cacheKey, result, 600); // 10 mins
        return result;
    }

    async getRevenueAnalytics(vendorId, params = {}) {
        let { period = '7days', year, month, week, startDate, endDate } = params;
        
        const cacheKey = `vendor:revenue_analytics:${vendorId}:${period}:${year || 'na'}:${month || 'na'}:${week || 'na'}:${startDate || 'na'}:${endDate || 'na'}`;
        const cached = await getFromCache(cacheKey);
        if (cached) return cached;

        const now = new Date();

        // 1. Weekly/Day-wise (7 Days or Specific Week)
        if (period === '7days' || period === 'weekly') {
            let weekStart;
            if (period === 'weekly' && week && year) {
                weekStart = this.getDateOfISOWeek(week, year);
            } else {
                weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (period === '7days' ? 6 : now.getDay()));
            }
            weekStart.setHours(0, 0, 0, 0);

            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i);
                days.push(d);
            }
            return await this.getZeroFilledDays(vendorId, days);
        }

        // 2. Monthly (Weeks within Month)
        if (period === 'monthly') {
            const targetMonth = month ? month - 1 : now.getMonth();
            const targetYear = year || now.getFullYear();
            const monthStart = new Date(targetYear, targetMonth, 1);
            const monthEnd = new Date(targetYear, targetMonth + 1, 0);

            const [results] = await db.query(`
                SELECT 
                    FLOOR((DAY(o.created_at) - 1) / 7) + 1 as weekNum,
                    SUM(oi.price * oi.quantity) as revenue,
                    COUNT(DISTINCT o.id) as orders,
                    COUNT(DISTINCT oi.product_id) as products
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.vendor_id = ? AND o.payment_status = 'Paid' 
                AND o.created_at BETWEEN ? AND ?
                GROUP BY weekNum
                ORDER BY weekNum ASC
            `, [vendorId, monthStart, monthEnd]);

            return [1, 2, 3, 4, 5].map(w => {
                const found = results.find(r => r.weekNum === w);
                return { 
                    day: `Week ${w}`, 
                    revenue: parseFloat(found?.revenue || 0),
                    orders: parseInt(found?.orders || 0),
                    products: parseInt(found?.products || 0)
                };
            });
        }

        // 3. Yearly (Months within Year)
        if (period === 'yearly') {
            const targetYear = year || now.getFullYear();
            const yearStart = new Date(targetYear, 0, 1);
            const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

            const [results] = await db.query(`
                SELECT 
                    MONTH(o.created_at) as monthNum,
                    SUM(oi.price * oi.quantity) as revenue,
                    COUNT(DISTINCT o.id) as orders,
                    COUNT(DISTINCT oi.product_id) as products
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.vendor_id = ? AND o.payment_status = 'Paid' 
                AND o.created_at BETWEEN ? AND ?
                GROUP BY monthNum
                ORDER BY monthNum ASC
            `, [vendorId, yearStart, yearEnd]);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return monthNames.map((name, i) => {
                const found = results.find(r => r.monthNum === (i + 1));
                return { 
                    day: name, 
                    revenue: parseFloat(found?.revenue || 0),
                    orders: parseInt(found?.orders || 0),
                    products: parseInt(found?.products || 0)
                };
            });
        }

        // 4. Custom Range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));

            if (diffDays > 60) {
                const [results] = await db.query(`
                    SELECT 
                        DATE_FORMAT(o.created_at, '%b %y') as label, 
                        SUM(oi.price * oi.quantity) as revenue,
                        COUNT(DISTINCT o.id) as orders,
                        COUNT(DISTINCT oi.product_id) as products
                    FROM order_items oi 
                    JOIN orders o ON oi.order_id = o.id
                    WHERE oi.vendor_id = ? AND o.payment_status = 'Paid' AND o.created_at BETWEEN ? AND ?
                    GROUP BY YEAR(o.created_at), MONTH(o.created_at), label
                    ORDER BY YEAR(o.created_at) ASC, MONTH(o.created_at) ASC
                `, [vendorId, start, end]);
                return results.map(r => ({ 
                    day: r.label, 
                    revenue: parseFloat(r.revenue || 0),
                    orders: parseInt(r.orders || 0),
                    products: parseInt(r.products || 0)
                }));
            }

            const days = [];
            for (let i = 0; i <= diffDays; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                days.push(d);
            }
            const result = await this.getZeroFilledDays(vendorId, days);
            await setToCache(cacheKey, result, 600);
            return result;
        }

        return [];
    }

    async getZeroFilledDays(vendorId, days) {
        return await Promise.all(days.map(async (date) => {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date); end.setHours(23, 59, 59, 999);
            const [[res]] = await db.query(`
                SELECT 
                    SUM(oi.price * oi.quantity) as total,
                    COUNT(DISTINCT o.id) as orders,
                    COUNT(DISTINCT oi.product_id) as products
                FROM order_items oi 
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.vendor_id = ? AND o.created_at BETWEEN ? AND ? AND o.payment_status = 'Paid'
            `, [vendorId, start, end]);
            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: parseFloat(res.total || 0),
                orders: parseInt(res.orders || 0),
                products: parseInt(res.products || 0)
            };
        }));
    }

    getDateOfISOWeek(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    formatOrderTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        else if (hours < 48) return 'Yesterday';
        else {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Pending': return 'pending';
            case 'Cancelled': return 'error';
            default: return 'pending';
        }
    }
}

export default new VendorDashboardService();
