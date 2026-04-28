import db from './src/config/db.js';

async function migrate() {
    try {
        console.log("Starting migration...");
        await db.query(`
            ALTER TABLE order_items 
            MODIFY COLUMN item_status ENUM(
                'Pending','Confirmed','Shipped','Out for Delivery','Delivered',
                'Cancelled','Return Requested','Return Approved','Return Picked Up',
                'Returned','Refunded','Return Rejected'
            ) DEFAULT 'Pending'
        `);
        console.log("order_items table updated.");

        await db.query(`
            ALTER TABLE orders 
            MODIFY COLUMN order_status ENUM(
                'Pending','Confirmed','Shipped','Out for Delivery','Delivered',
                'Cancelled','Partially Shipped','Partially Delivered','Return Requested',
                'Return Approved','Return Picked Up','Returned','Refunded','Return Rejected'
            ) DEFAULT 'Pending'
        `);
        console.log("orders table updated.");

        await db.query(`
            ALTER TABLE order_status_logs 
            MODIFY COLUMN status ENUM(
                'Pending','Confirmed','Shipped','Out for Delivery','Delivered',
                'Cancelled','Partially Shipped','Partially Delivered','Return Requested',
                'Return Approved','Return Picked Up','Returned','Refunded','Return Rejected'
            ) DEFAULT 'Pending'
        `);
        console.log("order_status_logs table updated.");

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
