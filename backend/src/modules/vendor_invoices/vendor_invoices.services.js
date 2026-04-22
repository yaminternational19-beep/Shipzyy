import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import formatCustomerDates from "../../utils/formatCustomerDates.js";

/**
 * List all invoices for a vendor
 */
export const listVendorInvoices = async (vendorId, queryParams = {}) => {
    const { page, limit, skip } = getPagination(queryParams);

    let where = ["vi.vendor_id = ?"];
    let values = [vendorId];

    if (queryParams.search) {
        where.push("(vi.invoice_id LIKE ? OR o.order_number LIKE ? OR c.name LIKE ?)");
        const searchVal = `%${queryParams.search}%`;
        values.push(searchVal, searchVal, searchVal);
    }

    if (queryParams.status && queryParams.status !== 'All') {
        where.push("vi.status = ?");
        values.push(queryParams.status);
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

    // Get total count
    const [countResult] = await db.query(
        `SELECT COUNT(*) as total 
         FROM vendor_invoices vi
         JOIN orders o ON vi.order_id = o.id
         JOIN customers c ON o.customer_id = c.id
         ${whereClause}`,
        values
    );
    const totalRecords = countResult[0].total;

    // Get invoices with order and customer details
    const [rows] = await db.query(`
        SELECT 
            vi.*,
            o.order_number,
            c.id AS cust_id,
            c.mobile AS customer_phone,
            c.profile_image AS customer_avatar,
            (SELECT COUNT(*) FROM order_items WHERE order_id = vi.order_id AND vendor_id = vi.vendor_id) as item_count
        FROM vendor_invoices vi
        JOIN orders o ON vi.order_id = o.id
        JOIN customers c ON o.customer_id = c.id
        ${whereClause}
        ORDER BY vi.created_at DESC
        LIMIT ? OFFSET ?
    `, [...values, limit, skip]);

    // Format dates using utility
    const formattedRows = formatCustomerDates(rows);

    const records = formattedRows.map(row => ({
        id: row.invoice_id, // Frontend uses id for display
        dbId: row.id,
        customerId: `CUST-${row.cust_id}`,
        customerPhone: row.customer_phone,
        customerAvatar: row.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.customer_phone)}&background=random`,
        orderId: row.order_number,
        itemCount: row.item_count,
        amount: parseFloat(row.amount),
        paymentMethod: row.payment_method,
        status: row.status,
        date: row.created_at,
        invoiceUrl: row.invoice_url
    }));

    return {
        records,
        pagination: getPaginationMeta(page, limit, totalRecords)
    };
};
