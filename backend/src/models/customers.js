import db from "../config/db.js";

const TABLES = [
    {
        name: "customers",
        query: `
            CREATE TABLE IF NOT EXISTS customers (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                country_code VARCHAR(10),
                mobile VARCHAR(20),
                full_phone VARCHAR(20) UNIQUE,
                name VARCHAR(100),
                email VARCHAR(100),
                gender VARCHAR(20),
                profile_image VARCHAR(255),
                device_id VARCHAR(255),
                player_id VARCHAR(255),
                referral_code VARCHAR(50) UNIQUE,
                referrer_id BIGINT,
                login_type VARCHAR(20) DEFAULT 'otp',
                default_address_id BIGINT NULL,
                status ENUM('active', 'suspended', 'terminated') DEFAULT 'active',
                is_deleted BOOLEAN DEFAULT FALSE,
                last_login_at DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                google_id VARCHAR(100) NULL,
                apple_id VARCHAR(100) NULL,
                social_email VARCHAR(100) NULL,
                UNIQUE KEY unique_email (email),
                INDEX idx_full_phone (full_phone),
                INDEX idx_referrer_id (referrer_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                FOREIGN KEY (referrer_id) REFERENCES customers(id) ON DELETE SET NULL
            );
        `
    },
    {
        name: "customers_addresses",
        query: `
            CREATE TABLE IF NOT EXISTS customers_addresses (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                customer_id BIGINT,
                address_name VARCHAR(50),
                contact_person_name VARCHAR(100),
                contact_phone VARCHAR(20),
                address_line_1 VARCHAR(255),
                address_line_2 VARCHAR(255),
                landmark VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                country VARCHAR(100),
                latitude DECIMAL(10, 7),
                longitude DECIMAL(10, 7),
                is_default BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                INDEX idx_customer_id (customer_id),
                INDEX idx_is_default (is_default),

                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            );
        `
    },
    {
        name: "otp_verifications",
        query: `
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(20),
                otp VARCHAR(10),
                token VARCHAR(500),
                expires_at DATETIME,
                attempts INT DEFAULT 0,
                send_count INT DEFAULT 1,
                last_sent_at DATETIME,
                verified BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                purpose ENUM('signup','login','forgot') DEFAULT 'login',
                UNIQUE KEY unique_token (token),
                INDEX idx_phone (phone),
                INDEX idx_token (token),
                INDEX idx_expires_at (expires_at)
            );
        `
    },
    {
        name: "customers_sessions",
        query: `
            CREATE TABLE IF NOT EXISTS customers_sessions (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                customer_id BIGINT,
                refresh_token TEXT,
                expires_at DATETIME,
                ip_address VARCHAR(50),
                user_agent VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                device_id VARCHAR(255),
                UNIQUE KEY unique_customer_device_session (customer_id, device_id),
                INDEX idx_customer_id (customer_id),
                INDEX idx_expires_at (expires_at),
                INDEX idx_device_id (device_id),
                INDEX idx_refresh_token (refresh_token(100)),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            );
        `
    },
    {
        name : "customers_devices",
        query: `
            CREATE TABLE IF NOT EXISTS customers_devices (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                customer_id BIGINT,
                device_id VARCHAR(255),
                player_id VARCHAR(255),
                device_type VARCHAR(50),
                app_version VARCHAR(20),
                is_active BOOLEAN DEFAULT TRUE,
                last_login_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_customer_device (customer_id, device_id),
               
                INDEX idx_customer_id (customer_id),
                INDEX idx_player_id (player_id),
                INDEX idx_device_customer (customer_id, device_id),

                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            );
        `
    },
    {
        name: "customers_cart",
        query: `
            CREATE TABLE IF NOT EXISTS customers_cart (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                customer_id BIGINT NOT NULL,
                vendor_id BIGINT NOT NULL,
                product_id BIGINT NOT NULL,

                quantity INT NOT NULL DEFAULT 1,

                -- snapshot (temporary)
                offer_price DECIMAL(10,2),
                mrp DECIMAL(10,2),

                -- flags
                price_changed BOOLEAN DEFAULT FALSE,
                is_available BOOLEAN DEFAULT TRUE,

                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                UNIQUE KEY unique_cart (customer_id, vendor_id, product_id),

                INDEX idx_customer (customer_id),
                INDEX idx_vendor (vendor_id),

                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            );
        `
    },
    {
        name: "customers_wishlist",
        query: `
            CREATE TABLE IF NOT EXISTS customers_wishlist (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                customer_id BIGINT NOT NULL,
                product_id BIGINT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_wishlist (customer_id, product_id),
                INDEX idx_customer (customer_id),
                INDEX idx_product (product_id),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            );
        `
    },
    {
        name: "orders",
        query: `
            CREATE TABLE IF NOT EXISTS orders (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                customer_id BIGINT NOT NULL,
                address_id BIGINT NOT NULL,
                
                subtotal DECIMAL(10, 2) NOT NULL,
                discount DECIMAL(10, 2) DEFAULT 0.00,
                delivery_charges DECIMAL(10, 2) DEFAULT 0.00,
                total_amount DECIMAL(10, 2) NOT NULL,
                
                coupon_code VARCHAR(50) NULL,
                payment_method ENUM('Online', 'COD') DEFAULT 'COD',
                payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
                order_status ENUM('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Partially Shipped', 'Partially Delivered', 'Return Requested', 'Returned', 'Refunded') DEFAULT 'Pending',
                
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_customer_id (customer_id),
                INDEX idx_order_number (order_number),
                INDEX idx_order_status (order_status),
                
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (address_id) REFERENCES customers_addresses(id)
            );
        `
    },
    {
        name: "order_items",
        query: `
            CREATE TABLE IF NOT EXISTS order_items (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                vendor_id BIGINT NOT NULL,
                product_id BIGINT NOT NULL,
                
                quantity INT NOT NULL DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                
                item_status ENUM('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded') DEFAULT 'Pending',
                payment_status ENUM('Pending', 'Paid', 'Refunded') DEFAULT 'Pending',
                status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                
                INDEX idx_order_id (order_id),
                INDEX idx_vendor_id (vendor_id),
                INDEX idx_product_id (product_id),
                INDEX idx_item_status (item_status),
                INDEX idx_payment_status (payment_status)
            );
        `
    },
    {
        name: "payments",
        query: `
            CREATE TABLE IF NOT EXISTS payments (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                customer_id BIGINT NOT NULL,
                
                gateway VARCHAR(100) NOT NULL,
                gateway_order_id VARCHAR(255) NULL,
                transaction_id VARCHAR(255) UNIQUE,
                
                amount DECIMAL(12, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                status ENUM('Pending', 'Success', 'Failed', 'Refunded') DEFAULT 'Pending',
                
                raw_response JSON NULL,
                
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                
                INDEX idx_order_id (order_id),
                INDEX idx_transaction_id (transaction_id),
                INDEX idx_status (status)
            );
        `
    },
    {
        name: "customer_reviews",
        query: `
            CREATE TABLE IF NOT EXISTS customer_reviews (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                customer_id BIGINT NOT NULL,
                vendor_id BIGINT NOT NULL,
                product_id BIGINT NOT NULL,
                rating INT NOT NULL,
                review TEXT,
                images JSON,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (vendor_id) REFERENCES vendors(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                INDEX idx_order_id (order_id),
                INDEX idx_customer_id (customer_id),
                INDEX idx_vendor_id (vendor_id),
                INDEX idx_product_id (product_id)
            );
        `
    },
    {
        name: "order_status_logs",
        query: `
            CREATE TABLE IF NOT EXISTS order_status_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT NOT NULL,
                
                status ENUM(
                    'Pending',
                    'Confirmed',
                    'Shipped',
                    'Out for Delivery',
                    'Delivered',
                    'Cancelled'
                ) NOT NULL,

                display_title VARCHAR(100) NOT NULL,

                changed_by_role ENUM('admin', 'vendor', 'system') DEFAULT 'system',
                changed_by_id BIGINT NULL,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id)
            );
        `
    },
    {
        name: "order_returns",
        query: `
            CREATE TABLE IF NOT EXISTS order_returns (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_item_id BIGINT NOT NULL,
                customer_id BIGINT NOT NULL,
                vendor_id BIGINT NOT NULL,
                
                reason TEXT NOT NULL,
                images JSON NULL,
                status ENUM('Requested', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded') DEFAULT 'Requested',
                admin_notes TEXT,
                vendor_notes TEXT,
                
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                FOREIGN KEY (order_item_id) REFERENCES order_items(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (vendor_id) REFERENCES vendors(id),
                INDEX idx_item (order_item_id),
                INDEX idx_vendor (vendor_id),
                INDEX idx_status (status)
            );
        `
    },
    {
        name: "order_refunds",
        query: `
            CREATE TABLE IF NOT EXISTS order_refunds (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                order_item_id BIGINT NOT NULL,
                order_return_id BIGINT NULL,
                vendor_id BIGINT NOT NULL,
                
                amount DECIMAL(10, 2) NOT NULL,
                refund_method ENUM('UPI', 'Bank Transfer') NOT NULL,
                
                -- Manual Payment Details
                account_holder_name VARCHAR(150),
                account_number VARCHAR(50),
                ifsc_code VARCHAR(20),
                upi_id VARCHAR(100),
                
                -- Proof of Payment
                transaction_id VARCHAR(255) NOT NULL COMMENT 'Manual Transaction Ref from Vendor',
                payment_proof_url VARCHAR(255),
                
                status ENUM('Pending', 'Completed') DEFAULT 'Completed',
                processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (order_item_id) REFERENCES order_items(id),
                FOREIGN KEY (order_return_id) REFERENCES order_returns(id),
                FOREIGN KEY (vendor_id) REFERENCES vendors(id),
                INDEX idx_item (order_item_id),
                INDEX idx_vendor (vendor_id)
            );
        `
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