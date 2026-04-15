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

const createTicket = async (vendorId, subject, message, supportContactId) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const date = new Date().toISOString().slice(2,10).replace(/-/g, '');
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
     (support_ticket_id, vendor_id, subject, message, support_contact_id)
     VALUES (?, ?, ?, ?, ?)`,
    [support_ticket_id, vendorId, subject, message, supportContactId]
  );
};



// const listTickets = async (vendorId, status) => {
//   let query = `SELECT id, support_ticket_id, subject, message, admin_reply, status, created_at FROM vendor_support_tickets WHERE vendor_id = ?`;
//   const params = [vendorId];

// }

export default { getFaqs, getHelp, createTicket };


