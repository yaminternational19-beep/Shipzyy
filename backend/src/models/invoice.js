import db from "../config/db.js";

const TABLES = [
    {
        name: "customer_invoices",
        query: `
          CREATE TABLE IF NOT EXISTS customer_invoices (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              invoice_id VARCHAR(100) UNIQUE NOT NULL,
              order_id BIGINT NOT NULL,
              customer_id BIGINT NOT NULL,
              amount DECIMAL(10, 2) NOT NULL,
              payment_method VARCHAR(100) NULL,
              status ENUM('Paid', 'Pending', 'Cancelled', 'Refunded', 'Failed') DEFAULT 'Pending',
              invoice_url VARCHAR(255) NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
              FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
              INDEX idx_customer_invoice_order (order_id),
              INDEX idx_customer_invoice_customer (customer_id),
              INDEX idx_customer_invoice_status (status)
          )`
    },
    {
        name: "vendor_invoices",
        query: `
          CREATE TABLE IF NOT EXISTS vendor_invoices (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              invoice_id VARCHAR(100) UNIQUE NOT NULL,
              order_id BIGINT NOT NULL,
              vendor_id BIGINT NOT NULL,
              amount DECIMAL(10, 2) NOT NULL,
              payment_method VARCHAR(100) NULL,
              status ENUM('Paid', 'Pending', 'Cancelled', 'Refunded', 'Failed') DEFAULT 'Pending',
              invoice_url VARCHAR(255) NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
              FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
              INDEX idx_vendor_invoice_order (order_id),
              INDEX idx_vendor_invoice_vendor (vendor_id),
              INDEX idx_vendor_invoice_status (status)
          )`
    }
];

const initDatabase = async () => {
    try {
        console.log("Starting Invoice module tables initialization...");
        for (const table of TABLES) {
            const [rows] = await db.query(
                `SHOW TABLES LIKE '${table.name}'`
            );

            if (rows.length === 0) {
                await db.query(table.query);
                console.log(`✅ Created table: ${table.name}`);
            } else {
                console.log(`ℹ️ Table already exists: ${table.name}`);
            }
        }
        console.log("Database initialization for Invoices complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Initialization failed:", error.message);
        process.exit(1);
    }
};

initDatabase();
