import db from "../config/db.js";

const TABLES = [
    {
        name: "vendor_support_tickets",
        query: `
          CREATE TABLE IF NOT EXISTS vendor_support_tickets (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              support_ticket_id VARCHAR(100) UNIQUE NOT NULL,
              vendor_id BIGINT NOT NULL,
              support_contact_id INT NULL,
              subject VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              admin_reply TEXT NULL,
              status ENUM('Open', 'Closed') DEFAULT 'Open',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
              FOREIGN KEY (support_contact_id) REFERENCES help_support_contacts(id) ON DELETE SET NULL
          )`
    }
];

const initDatabase = async () => {
  try {
    for (const table of TABLES) {
      const [rows] = await db.query(
        `SHOW TABLES LIKE '${table.name}'`
      );

      if (rows.length === 0) {
        await db.query(table.query);
        console.log(`Created table: ${table.name}`);
      } else {
        console.log(`Table already exists: ${table.name}`);
      }
    }
    console.log("Database initialization complete");
    process.exit(0);
  } catch (error) {
    console.error("Initialization failed:", error.message);
    process.exit(1);
  }
};


initDatabase();