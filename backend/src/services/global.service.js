import db from "../config/db.js";

export const isEmailExists = async (email, ignoreId = null, ignoreTable = null) => {
  const tables = [
    "super_admins",
    "sub_admins",
    "vendors",
    "vendor_staff"
  ];

  for (const table of tables) {
    let query = `SELECT id FROM ${table} WHERE email = ?`;
    const params = [email];

    // Ignore current record when updating
    if (ignoreId && ignoreTable === table) {
      query += ` AND id != ?`;
      params.push(ignoreId);
    }

    const [rows] = await db.query(query, params);

    if (rows.length > 0) {
      return true;
    }
  }

  return false;
};
