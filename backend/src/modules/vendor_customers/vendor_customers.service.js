import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";

const getCustomers = async (vendorId, queryParams) => {
    const { page, limit, skip } = getPagination(queryParams);

    let where = ["c.is_deleted = FALSE"];
    let values = [vendorId, vendorId]; // Initial values for vendor_id checks

    if (queryParams.search) {
        where.push("(c.name LIKE ? OR c.email LIKE ? OR c.full_phone LIKE ?)");
        const searchStr = `%${queryParams.search}%`;
        values.push(searchStr, searchStr, searchStr);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // The subquery checks if the customer ever bought from this vendor
    const accessJoin = `JOIN (
        SELECT DISTINCT o.customer_id 
        FROM orders o 
        JOIN order_items oi ON oi.order_id = o.id 
        WHERE oi.vendor_id = ?
    ) vc ON vc.customer_id = c.id`;

    // Wait, the parameters: vendor_id goes to the JOIN, then vendor_id for orders count subquery... 
    // Let's rewrite the parameterized query to be clean.
    
    values = [];
    values.push(vendorId); // For the vc join

    let searchParams = [];
    if (queryParams.search) {
        const searchStr = `%${queryParams.search}%`;
        searchParams = [searchStr, searchStr, searchStr];
    }

    const countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM customers c
        JOIN (
            SELECT DISTINCT o.customer_id 
            FROM orders o 
            JOIN order_items oi ON oi.order_id = o.id 
            WHERE oi.vendor_id = ?
        ) vc ON vc.customer_id = c.id
        ${where.length > 1 ? `AND (c.name LIKE ? OR c.email LIKE ? OR c.full_phone LIKE ?)` : ""}
    `;
    
    const [countResult] = await db.query(countQuery, [...values, ...searchParams]);
    const totalRecords = countResult[0].total;

    // Stats
    const statsQuery = `
        SELECT
            COUNT(DISTINCT c.id) as totalCount,
            SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) as activeCount,
            SUM(CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as newCount
        FROM customers c
        JOIN (
            SELECT DISTINCT o.customer_id 
            FROM orders o 
            JOIN order_items oi ON oi.order_id = o.id 
            WHERE oi.vendor_id = ?
        ) vc ON vc.customer_id = c.id
    `;
    const [statsResult] = await db.query(statsQuery, [vendorId]);
    
    const stats = {
        total: statsResult[0].totalCount,
        active: statsResult[0].activeCount,
        inactive: parseInt(statsResult[0].totalCount) - parseInt(statsResult[0].activeCount),
        new: statsResult[0].newCount
    };

    // Data query
    const dataQuery = `
        SELECT 
            c.id, COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as name, COALESCE(NULLIF(c.email, ''), 'noemail') as email, c.full_phone, 
            NULLIF(c.profile_image, '') as profile_image, 
            c.status, c.created_at,
            (SELECT COUNT(DISTINCT o.id) 
             FROM orders o JOIN order_items oi ON oi.order_id = o.id 
             WHERE o.customer_id = c.id AND oi.vendor_id = ?) as orders_count,
            (SELECT SUM(oi.price * oi.quantity) 
             FROM orders o JOIN order_items oi ON oi.order_id = o.id 
             WHERE o.customer_id = c.id AND oi.vendor_id = ?) as total_spent
        FROM customers c
        JOIN (
            SELECT DISTINCT o.customer_id 
            FROM orders o 
            JOIN order_items oi ON oi.order_id = o.id 
            WHERE oi.vendor_id = ?
        ) vc ON vc.customer_id = c.id
        ${where.length > 1 ? `AND (c.name LIKE ? OR c.email LIKE ? OR c.full_phone LIKE ?)` : ""}
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataQuery, [vendorId, vendorId, vendorId, ...searchParams, limit, skip]);

    const records = rows.map(c => ({
        id: c.id,
        customer_code: `CUST-${c.id}`,
        name: c.name,
        email: c.email,
        phone: c.full_phone,
        profile_image: c.profile_image,
        status: (c.status || "active").toLowerCase(),
        orders: parseInt(c.orders_count || 0),
        total_spent: parseFloat(c.total_spent || 0),
        created_at: c.created_at
    }));

    return {
        records,
        pagination: getPaginationMeta(page, limit, totalRecords),
        stats
    };
};

const getCustomerDetails = async (vendorId, customerId) => {
    // Ensure vendor has access
    const [accessCheck] = await db.query(
        `SELECT 1 
         FROM orders o 
         JOIN order_items oi ON oi.order_id = o.id 
         WHERE o.customer_id = ? AND oi.vendor_id = ? LIMIT 1`,
        [customerId, vendorId]
    );

    if (!accessCheck.length) {
        throw new Error("Customer not found or access denied");
    }

    const [rows] = await db.query(
        `SELECT c.id, COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as name, COALESCE(NULLIF(c.email, ''), 'noemail') as email, c.full_phone, 
                NULLIF(c.profile_image, '') as profile_image, 
                c.status, c.created_at,
                a.address_line_1, a.address_line_2, a.city, a.state, a.pincode, a.country
         FROM customers c
         LEFT JOIN customers_addresses a ON a.id = c.default_address_id
         WHERE c.id = ?`,
        [customerId]
    );

    if (!rows.length) throw new Error("Customer not found");

    const c = rows[0];

    // Vendor specific stats
    const [stats] = await db.query(
        `SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            SUM(oi.price * oi.quantity) as total_spent
         FROM orders o 
         JOIN order_items oi ON oi.order_id = o.id 
         WHERE o.customer_id = ? AND oi.vendor_id = ?`,
        [customerId, vendorId]
    );

    return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.full_phone || "-",
        profile_image: c.profile_image,
        status: (c.status || "active").toLowerCase(),
        joined_date: c.created_at,
        location: [c.city, c.state, c.country].filter(Boolean).join(", ") || "Unknown",
        orders_count: parseInt(stats[0].total_orders || 0),
        total_spent: parseFloat(stats[0].total_spent || 0)
    };
};
    
export default { getCustomers, getCustomerDetails };
