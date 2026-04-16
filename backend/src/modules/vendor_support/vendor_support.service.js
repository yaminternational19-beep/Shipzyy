import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { removeFromCache } from "../../utils/cache.js";

const getFaqs = async () => {
  const [rows] = await db.query(
    `SELECT id, question, answer,
        created_at
            FROM faqs
            WHERE category = ? AND status = ?
            ORDER BY created_at DESC`,
    ['vendor', 'Active']
  );

  return {
    records: rows
  };
};

const getHelp = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, country_code, phone_number, working_hours, created_at
     FROM help_support_contacts
     WHERE role = ?
     ORDER BY created_at DESC`,
    ['vendor']
  );

  return {
    records: rows
  };
};

const createTicket = async (vendorId, subject, message, supportContactId, createdByType, createdById) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  // Use Asia/Kolkata date for ticket ID generation to avoid crossover issues
  const date = new Intl.DateTimeFormat('en-GB', {
    year: '2-digit', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kolkata'
  }).format(new Date()).split('/').reverse().join('');
  const support_ticket_id = `TICKET-${date}-${random}`;

  // ✅ Validate support contact
  const [contact] = await db.query(
    `SELECT id FROM help_support_contacts WHERE id = ? AND role = 'vendor'`,
    [supportContactId]
  );

  if (!contact.length) {
    throw new Error("Invalid support contact ID");
  }

  await db.query(
    `INSERT INTO vendor_support_tickets 
     (support_ticket_id, vendor_id, subject, message, support_contact_id, created_by_type, created_by_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [support_ticket_id, vendorId, subject, message, supportContactId, createdByType, createdById, new Date()]
  );
};


const formatDate = (dateString) => {
  const date = new Date(dateString);

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

export const listTickets = async (vendorId, queryParams) => {
  const { page, limit, skip } = getPagination(queryParams);

  const where = [`vst.vendor_id = ?`];
  const searchParams = [vendorId];

  // 🔍 Search
  if (queryParams.search) {
    where.push(`(
      v.owner_name LIKE ? OR 
      v.email LIKE ? OR 
      v.mobile LIKE ? OR
      vs.name LIKE ? OR
      vs.email LIKE ? OR
      vs.mobile LIKE ? OR
      hsc.name LIKE ?
    )`);

    const searchStr = `%${queryParams.search}%`;
    searchParams.push(
      searchStr,
      searchStr,
      searchStr,
      searchStr,
      searchStr,
      searchStr,
      searchStr
    );
  }

  // 🔘 Status filter
  if (queryParams.status) {
    where.push(`vst.status = ?`);
    searchParams.push(queryParams.status);
  }

  // 📅 Date range filter
  if (queryParams.from_date && queryParams.to_date) {
    where.push(`DATE(vst.created_at) BETWEEN ? AND ?`);
    searchParams.push(queryParams.from_date, queryParams.to_date);
  }

  // 🔹 Main Data Query
  const [rows] = await db.query(
    `SELECT 
        vst.id,
        vst.support_ticket_id,
        vst.subject,
        vst.message,
        vst.admin_reply,
        vst.status,
        vst.created_at,

        -- User Info (Vendor owner or staff)
        CASE WHEN vst.created_by_type = 'VENDOR' THEN v.owner_name ELSE vs.name END AS userName,
        CASE WHEN vst.created_by_type = 'VENDOR' THEN v.id ELSE vs.id END AS userId,
        vst.created_by_type AS userType,
        CASE
          WHEN vst.created_by_type = 'VENDOR' THEN CONCAT(v.country_code, ' ', v.mobile)
          ELSE CONCAT(vs.country_code, ' ', vs.mobile)
        END AS userPhone,
        CASE WHEN vst.created_by_type = 'VENDOR' THEN v.email ELSE vs.email END AS userEmail,

        -- Support Contact Info
        hsc.name AS recipientName,
        CONCAT(hsc.country_code, ' ', hsc.phone_number) AS recipientPhone,
        hsc.email AS recipientEmail

     FROM vendor_support_tickets vst

     LEFT JOIN vendors v 
       ON vst.created_by_type = 'VENDOR' AND vst.created_by_id = v.id

     LEFT JOIN vendor_staff vs
       ON vst.created_by_type = 'VENDOR_STAFF' AND vst.created_by_id = vs.id

     LEFT JOIN help_support_contacts hsc 
       ON vst.support_contact_id = hsc.id

     WHERE ${where.join(" AND ")}

     ORDER BY vst.created_at DESC
     LIMIT ? OFFSET ?`,
    [...searchParams, limit, skip]
  );

  // 🔹 Total Count
  const [[{ totalRecords }]] = await db.query(
    `SELECT COUNT(*) as totalRecords
     FROM vendor_support_tickets vst
     LEFT JOIN vendors v ON vst.created_by_type = 'VENDOR' AND vst.created_by_id = v.id
     LEFT JOIN vendor_staff vs ON vst.created_by_type = 'VENDOR_STAFF' AND vst.created_by_id = vs.id
     LEFT JOIN help_support_contacts hsc ON vst.support_contact_id = hsc.id
     WHERE ${where.join(" AND ")}`,
    searchParams
  );

  // 🔹 Pagination Meta
  const pagination = getPaginationMeta(page, limit, totalRecords);

  const formattedRows = rows.map((row) => ({
    ...row,
    created_at: formatDate(row.created_at),
    raw_created_at: row.created_at
  }));

  return {
    records: formattedRows,
    pagination
  };
};


export default { getFaqs, getHelp, createTicket, listTickets };


