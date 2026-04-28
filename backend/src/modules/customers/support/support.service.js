import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import formatCustomerDates from "../../../utils/formatCustomerDates.js";

const getHelpSupport = async () => {
  const [rows] = await db.query(
    `SELECT id, name, COALESCE(NULLIF(email, ''), 'noemail') as email, 
            country_code, COALESCE(NULLIF(phone_number, ''), 'No Phone') as phone_number, working_hours
     FROM help_support_contacts
     WHERE role = ?`,
    ['customer']
  );

  return {
    records: rows
  };
};

const formatToPlain = (html) => {
    if (!html) return "";
    return html
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<\/p>\s*<p>/g, "\n\n")
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "")
        .trim();
};

const getContent = async () => {
    const baseUrl = process.env.BASE_URL || "http://localhost:9000/api/v1";
    const [rows] = await db.query('SELECT page_key, title, content, type FROM manage_content');
    
    const formattedRecords = rows.map(item => {
        let contentUrl = "";
        if (item.type === "url") {
            contentUrl = item.content;
        } else if (item.type === "html") {
            contentUrl = `${baseUrl}/customers/content/${item.page_key}`;
        }

        return {
            page_key: item.page_key,
            title: item.title,
            // content: item.type === "html" ? formatToPlain(item.content) : item.content,
            content: item.type === "html" ? item.content : null,
            type: item.type,
            content_url: contentUrl
        };
    });

    return {
        records: formattedRecords
    };
};

const getContentByKey = async (pageKey) => {
    const [rows] = await db.query(
        'SELECT title, content, type FROM manage_content WHERE page_key = ? LIMIT 1',
        [pageKey]
    );
    
    if (!rows.length) return null;
    
    const item = rows[0];
    const finalContent = item.type === 'html' ? formatToPlain(item.content) : item.content;
    
    return {
        title: item.title,
        content: finalContent
    };
};

const createTicket = async (customerId, ticketData) => {
    // 1. Validate the Support Contact ID if provided
    const contactId = ticketData.support_contact_id || null;
    if (contactId) {
        const [contact] = await db.query(
            "SELECT id FROM help_support_contacts WHERE id = ? AND role = 'customer'",
            [contactId]
        );
        if (!contact.length) {
            throw new ApiError(400, "Please choose a valid customer support department.");
        }
    }

    // 2. Check for duplicate pending ticket
    // If subject, contact, and customer are same and ticket is 'Open' -> Block
    const [existing] = await db.query(
        `SELECT id FROM customer_support_tickets 
         WHERE customer_id = ? AND subject = ? AND (support_contact_id IS NULL OR support_contact_id = ?) AND status = 'Open' 
         LIMIT 1`,
        [customerId, ticketData.subject, contactId]
    );

    if (existing.length) {
        throw new ApiError(400, "You have already raised a ticket with this subject. Please wait for our response or check your ticket history.");
    }

    // 3. Generate unique support_ticket_id (format: TICKET-YYMMDD-RANDOM)
    const random = Math.floor(1000 + Math.random() * 9000);
    const date = new Intl.DateTimeFormat('en-GB', {
        year: '2-digit', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kolkata'
    }).format(new Date()).split('/').reverse().join('');
    const support_ticket_id = `TICKET-${date}-${random}`;
    
    const [result] = await db.query(
        `INSERT INTO customer_support_tickets 
         (support_ticket_id, customer_id, support_contact_id, subject, message, created_by_id, created_by_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            support_ticket_id,
            customerId,
            ticketData.support_contact_id || null,
            ticketData.subject,
            ticketData.message,
            customerId,
            'CUSTOMER'
        ]
    );

    return {
        id: result.insertId,
        support_ticket_id: support_ticket_id
    };
};


const getFaqs = async () => {
    const [rows] = await db.query(
        `SELECT id, question, answer FROM faqs WHERE category = 'customer' and status = 'active'`
    );

    return {
        records: rows
    };
}


const getAnnouncements = async (customerId, queryParams) => {
    const { page, limit, skip } = getPagination(queryParams);

    const [rows] = await db.query(
        `SELECT id, title, message, created_at 
         FROM announcements 
         WHERE (target_type = 'CUSTOMER' OR target_type = 'ALL')
           AND (status = 'active' OR status = 'Sent')
           AND (target_detail = 'ALL' OR (target_detail = 'SPECIFIC' AND entity_id = ?))
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [customerId, limit, skip]
    );

    const [[{ totalRecords }]] = await db.query(
        `SELECT COUNT(*) as totalRecords 
         FROM announcements 
         WHERE (target_type = 'CUSTOMER' OR target_type = 'ALL')
           AND (status = 'active' OR status = 'Sent')
           AND (target_detail = 'ALL' OR (target_detail = 'SPECIFIC' AND entity_id = ?))`,
        [customerId]
    );

    return {
        records: formatCustomerDates(rows),
        pagination: getPaginationMeta(page, limit, totalRecords)
    };
};

export default { getHelpSupport, getContent, getContentByKey, createTicket, getFaqs, getAnnouncements };
