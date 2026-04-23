import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import formatCustomerDates from "../../utils/formatCustomerDates.js";

/**
 * List all vendor invoice summaries for Admin (one row per vendor)
 */
export const listVendorInvoices = async (queryParams = {}) => {
    const { page, limit, skip } = getPagination(queryParams);

    let where = [];
    let values = [];

    if (queryParams.search) {
        where.push("(v.business_name LIKE ? OR v.vendor_code LIKE ?)");
        const searchVal = `%${queryParams.search}%`;
        values.push(searchVal, searchVal);
    }

    if (queryParams.fromDate) {
        where.push("vi.created_at >= ?");
        values.push(queryParams.fromDate);
    }

    if (queryParams.toDate) {
        where.push("vi.created_at <= ?");
        values.push(queryParams.toDate);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Get total count of unique vendors who have invoices
    const [countResult] = await db.query(
        `SELECT COUNT(DISTINCT vi.vendor_id) as total
         FROM vendor_invoices vi
         JOIN vendors v ON vi.vendor_id = v.id
         ${whereClause}`,
        values
    );
    const totalRecords = countResult[0].total;

    // Get total stats across all invoices
    const [totalStats] = await db.query(
        `SELECT 
            SUM(amount) as totalAmount,
            COUNT(*) as totalInvoices,
            SUM(IF(vi.status = 'Paid', 1, 0)) as paidInvoices,
            SUM(IF(vi.status = 'Pending', 1, 0)) as pendingInvoices,
            SUM(IF(vi.status = 'Cancelled', 1, 0)) as cancelledInvoices
         FROM vendor_invoices vi
         JOIN vendors v ON vi.vendor_id = v.id
         ${whereClause}`,
        values
    );

    // Get vendor-wise summary
    const [rows] = await db.query(`
        SELECT 
            v.id AS v_id,
            v.vendor_code,
            v.business_name AS vendor_name,
            v.owner_name as vendor_owner_name,
            v.country_code AS vendor_country_code,
            v.mobile AS vendor_phone,
            v.email AS vendor_email,
            v.profile_photo AS vendor_avatar,
            COUNT(vi.id) as total_invoices,
            SUM(vi.amount) as total_amount,
            MAX(vi.created_at) as last_invoice_date,
            (SELECT SUM(amount) FROM vendor_invoices WHERE vendor_id = v.id AND status = 'Pending') as pending_amount
        FROM vendor_invoices vi
        JOIN vendors v ON vi.vendor_id = v.id
        ${whereClause}
        GROUP BY v.id
        ORDER BY last_invoice_date DESC
        LIMIT ? OFFSET ?
    `, [...values, limit, skip]);

    const records = rows.map(row => ({
        vendorId: row.vendor_code || `VND-${row.v_id}`,
        dbVendorId: row.v_id,
        vendorName: row.vendor_name,
        vendorOwnerName: row.vendor_owner_name,
        vendorPhone: `${row.vendor_country_code}${row.vendor_phone}`,
        vendorEmail: row.vendor_email,
        vendorAvatar: row.vendor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.vendor_name)}&background=random`,
        totalInvoices: row.total_invoices,
        totalAmount: parseFloat(row.total_amount || 0),
        pendingAmount: parseFloat(row.pending_amount || 0),
        lastInvoiceDate: row.last_invoice_date
    }));

    return {
        records,
        stats: {
            total: totalStats[0].totalInvoices || 0,
            paid: totalStats[0].paidInvoices || 0,
            pending: totalStats[0].pendingInvoices || 0,
            refunded: totalStats[0].cancelledInvoices || 0,
            totalAmount: totalStats[0].totalAmount || 0,
            uniqueVendors: totalRecords
        },
        pagination: getPaginationMeta(page, limit, totalRecords)
    };
};


/**
 * Get individual invoice history for a specific vendor
 */
export const getVendorInvoiceHistory = async (vendorId, queryParams = {}) => {
    const { page, limit, skip } = getPagination(queryParams);

    let where = ["vi.vendor_id = ?"];
    let values = [vendorId];

    if (queryParams.search) {
        where.push("(vi.invoice_id LIKE ? OR o.order_number LIKE ?)");
        const searchVal = `%${queryParams.search}%`;
        values.push(searchVal, searchVal);
    }

    if (queryParams.status && queryParams.status !== 'All') {
        where.push("vi.status = ?");
        values.push(queryParams.status);
    }

    const whereClause = `WHERE ${where.join(" AND ")}`;

    const [rows] = await db.query(`
        SELECT 
            vi.*,
            o.order_number,
            (SELECT COUNT(*) FROM order_items WHERE order_id = vi.order_id AND vendor_id = vi.vendor_id) as item_count
        FROM vendor_invoices vi
        JOIN orders o ON vi.order_id = o.id
        ${whereClause}
        ORDER BY vi.created_at DESC
        LIMIT ? OFFSET ?
    `, [...values, limit, skip]);

    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM vendor_invoices vi JOIN orders o ON vi.order_id = o.id ${whereClause}`,
        values
    );

    const records = rows.map(row => ({
        id: row.invoice_id,
        dbId: row.id,
        orderId: row.order_number,
        amount: parseFloat(row.amount),
        status: row.status,
        date: row.created_at,
        itemCount: row.item_count,
        invoiceUrl: row.invoice_url,
        paymentMethod: row.payment_method
    }));

    return {
        records,
        pagination: getPaginationMeta(page, limit, countResult[0].total)
    };
};

/**
 * Get vendor invoice by ID
 */
export const getInvoiceById = async (invoiceId) => {
    const [rows] = await db.query(
        `SELECT vi.*, v.business_name, v.email 
         FROM vendor_invoices vi 
         JOIN vendors v ON vi.vendor_id = v.id 
         WHERE vi.id = ?`,
        [invoiceId]
    );
    return rows[0];
};
