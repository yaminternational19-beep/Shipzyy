import db from "../config/db.js";

const TABLES = [
    {
        name : "vendor_support_tickets",
        query : `CREATE TABLE vendor_support_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('Open', 'Closed', 'In Progress') DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
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