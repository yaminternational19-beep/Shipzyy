import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";

/**
 * Get all support tickets with pagination and filtering
 */
const getTickets = async (queryParams) => {
    const { page, limit, skip } = getPagination(queryParams);
    const { type, status, search, from_date, to_date } = queryParams;

    let whereVendor = [];
    let whereCustomer = [];
    let valuesVendor = [];
    let valuesCustomer = [];

    // Filters for Vendor Tickets
    if (status) {
        whereVendor.push("vst.status = ?");
        valuesVendor.push(status);
    }
    if (search) {
        whereVendor.push("(vst.support_ticket_id LIKE ? OR vst.subject LIKE ? OR v.owner_name LIKE ? OR v.business_name LIKE ?)");
        const searchStr = `%${search}%`;
        valuesVendor.push(searchStr, searchStr, searchStr, searchStr);
    }
    if (from_date && to_date) {
        whereVendor.push("DATE(vst.created_at) BETWEEN ? AND ?");
        valuesVendor.push(from_date, to_date);
    }

    // Filters for Customer Tickets
    if (status) {
        whereCustomer.push("cst.status = ?");
        valuesCustomer.push(status);
    }
    if (search) {
        whereCustomer.push("(cst.support_ticket_id LIKE ? OR cst.subject LIKE ? OR c.name LIKE ?)");
        const searchStr = `%${search}%`;
        valuesCustomer.push(searchStr, searchStr, searchStr);
    }
    if (from_date && to_date) {
        whereCustomer.push("DATE(cst.created_at) BETWEEN ? AND ?");
        valuesCustomer.push(from_date, to_date);
    }

    const whereVendorClause = whereVendor.length ? `WHERE ${whereVendor.join(" AND ")}` : "";
    const whereCustomerClause = whereCustomer.length ? `WHERE ${whereCustomer.join(" AND ")}` : "";

    const vendorSelect = `
        SELECT 
            vst.id, vst.support_ticket_id, vst.subject, vst.message, vst.admin_reply, vst.status, vst.created_at,
            'VENDOR' as userType, v.id as userId, 
            COALESCE(NULLIF(v.owner_name, ''), 'Shipzyy User') as userName, 
            COALESCE(NULLIF(v.email, ''), 'noemail') as userEmail, 
            COALESCE(NULLIF(CONCAT(v.country_code, ' ', v.mobile), ' '), 'No Phone') as userPhone,
            hsc.name as recipientName, 
            COALESCE(NULLIF(hsc.email, ''), 'noemail') as recipientEmail, 
            COALESCE(NULLIF(CONCAT(hsc.country_code, ' ', hsc.phone_number), ' '), 'No Phone') as recipientPhone
        FROM vendor_support_tickets vst
        LEFT JOIN vendors v ON vst.vendor_id = v.id
        LEFT JOIN help_support_contacts hsc ON vst.support_contact_id = hsc.id
        ${whereVendorClause}
    `;

    const customerSelect = `
        SELECT 
            cst.id, cst.support_ticket_id, cst.subject, cst.message, cst.admin_reply, cst.status, cst.created_at,
            'CUSTOMER' as userType, c.id as userId, 
            COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as userName, 
            COALESCE(NULLIF(c.email, ''), 'noemail') as userEmail, 
            COALESCE(NULLIF(CONCAT(c.country_code, ' ', c.mobile), ' '), 'No Phone') as userPhone,
            hsc.name as recipientName, 
            COALESCE(NULLIF(hsc.email, ''), 'noemail') as recipientEmail, 
            COALESCE(NULLIF(CONCAT(hsc.country_code, ' ', hsc.phone_number), ' '), 'No Phone') as recipientPhone
        FROM customer_support_tickets cst
        LEFT JOIN customers c ON cst.customer_id = c.id
        LEFT JOIN help_support_contacts hsc ON cst.support_contact_id = hsc.id
        ${whereCustomerClause}
    `;

    let dataQuery = "";
    let countQuery = "";
    let finalValues = [];
    let countValues = [];

    if (type === 'vendor') {
        dataQuery = `${vendorSelect} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) as total FROM vendor_support_tickets vst LEFT JOIN vendors v ON vst.vendor_id = v.id ${whereVendorClause}`;
        finalValues = [...valuesVendor, limit, skip];
        countValues = valuesVendor;
    } else if (type === 'customer') {
        dataQuery = `${customerSelect} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) as total FROM customer_support_tickets cst LEFT JOIN customers c ON cst.customer_id = c.id ${whereCustomerClause}`;
        finalValues = [...valuesCustomer, limit, skip];
        countValues = valuesCustomer;
    } else {
        // Combined query
        dataQuery = `(${vendorSelect}) UNION ALL (${customerSelect}) ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        countQuery = `
            SELECT (SELECT COUNT(*) FROM vendor_support_tickets vst LEFT JOIN vendors v ON vst.vendor_id = v.id ${whereVendorClause}) + 
                   (SELECT COUNT(*) FROM customer_support_tickets cst LEFT JOIN customers c ON cst.customer_id = c.id ${whereCustomerClause}) as total
        `;
        finalValues = [...valuesVendor, ...valuesCustomer, limit, skip];
        countValues = [...valuesVendor, ...valuesCustomer];
    }

    const [countResult] = await db.query(countQuery, countValues);
    const totalRecords = countResult[0].total;

    const [rows] = await db.query(dataQuery, finalValues);

    const pagination = getPaginationMeta(page, limit, totalRecords);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { date: '--', time: '--' };

        return {
            date: date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            }),
            time: date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const records = rows.map(ticket => ({
        ...ticket,
        id: ticket.support_ticket_id,
        userId: ticket.userType === 'VENDOR' ? `VND${String(ticket.userId).padStart(4, '0')}` : `CUST-${ticket.userId}`,
        description: ticket.message,
        created_at: formatDate(ticket.created_at),
        raw_created_at: ticket.created_at,
        replies: ticket.admin_reply ? [{
            sender: 'Admin',
            text: ticket.admin_reply,
            date: formatDate(ticket.created_at)
        }] : []
    }));

    return {
        records,
        pagination
    };
};

/**
 * Reply to a ticket and close it (or keep it open)
 */
const replyToTicket = async (ticketId, userType, reply, status, adminId) => {
    const table = userType === 'VENDOR' ? 'vendor_support_tickets' : 'customer_support_tickets';

    const [existing] = await db.query(`SELECT id FROM ${table} WHERE support_ticket_id = ?`, [ticketId]);
    if (existing.length === 0) {
        throw new Error("Ticket not found");
    }

    await db.query(
        `UPDATE ${table} SET admin_reply = ?, status = ? WHERE support_ticket_id = ?`,
        [reply, status, ticketId]
    );

    return { success: true, message: "Reply sent successfully" };
};

export default {
    getTickets,
    replyToTicket
};
