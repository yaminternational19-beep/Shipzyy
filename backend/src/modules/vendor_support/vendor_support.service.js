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
    `SELECT id, name, email, phone, working_hours, created_at
     FROM help_support_contacts
     WHERE role = ?
     ORDER BY created_at DESC`,
    ['vendor']
  );

  return {
    records: rows
  };
};



export default { getFaqs, getHelp };