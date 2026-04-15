import db from "../../config/db.js";

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

const createTicket = async (vendorId, subject, message) => {
  const [result] = await db.query(
    `INSERT INTO support_tickets (vendor_id, subject, message, status)
     VALUES (?, ?, ?, ?)`,
    [vendorId, subject, message, 'Open']
  );  
}


export default { getFaqs, getHelp, createTicket  };