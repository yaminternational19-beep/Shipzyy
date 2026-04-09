import db from '../config/db.js';

const TABLES = [
    {
        name: "super_admins",
        query: `
            CREATE TABLE IF NOT EXISTS super_admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                system_role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
                INDEX idx_email (email),
                INDEX idx_status (status)
            );
        `

    },
    {
        name: "otp_codes",
        query: `
            CREATE TABLE IF NOT EXISTS otp_codes (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                user_type VARCHAR(50) NOT NULL,
                otp_code VARCHAR(6) NOT NULL,
                otp_type VARCHAR(30) NOT NULL,
                expires_at DATETIME NOT NULL,
                attempts INT DEFAULT 0,
                resend_count INT DEFAULT 0,
                is_used BOOLEAN DEFAULT FALSE,

                INDEX idx_user_id (user_id),
                INDEX idx_otp_code (otp_code),
                INDEX idx_expires_at (expires_at),
                INDEX idx_user_otp (user_id, otp_code, otp_type)
            );
        `
    },
    {
        name:"refresh_tokens",
        query: `
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                user_type VARCHAR(50) NOT NULL,
                refresh_token TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                is_revoked BOOLEAN DEFAULT FALSE,
                INDEX idx_user_id (user_id),
                INDEX idx_user_type (user_type),
                INDEX idx_expires_at (expires_at),
                INDEX idx_is_revoked (is_revoked)
            );
        `
    },
    {
        name:"sub_admins",
        query: `
            CREATE TABLE IF NOT EXISTS sub_admins (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                country_code VARCHAR(10) DEFAULT '+91',
                mobile VARCHAR(20) NOT NULL,
                address TEXT,
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'India',
                pincode VARCHAR(10),
                emergency_country_code VARCHAR(10) DEFAULT '+91',
                emergency_mobile VARCHAR(20),
                role VARCHAR(100) NOT NULL,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                profile_photo_key VARCHAR(255) NULL,
                profile_photo VARCHAR(255),
                permissions JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                system_role VARCHAR(50) DEFAULT 'SUB_ADMIN',
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_role (role),
                INDEX idx_created_at (created_at)
            );
        `           
    },
    {
        name: "categories",
        query: `
            CREATE TABLE IF NOT EXISTS categories (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                category_code VARCHAR(20) UNIQUE,
                name VARCHAR(100) NOT NULL,
                banner_name VARCHAR(150) NULL AFTER name,
                banner_image VARCHAR(255) NULL AFTER banner_name;
                description TEXT,
                icon TEXT,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            );
        `
    },
    {
        name: "subcategories",
        query: `
            CREATE TABLE IF NOT EXISTS subcategories (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                subcategory_code VARCHAR(20) UNIQUE,
                category_id BIGINT NOT NULL,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                icon TEXT,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                INDEX idx_category_id (category_id),
                INDEX idx_name (name),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            );
        `
    },
    {
        name: "brands",
        query: `
            CREATE TABLE IF NOT EXISTS brands (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                brand_code VARCHAR(20) UNIQUE,
                name VARCHAR(150) NOT NULL,
                category_id BIGINT NOT NULL,
                subcategory_id BIGINT NOT NULL,
                logo TEXT,
                description TEXT,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
                INDEX idx_category_id (category_id),
                INDEX idx_subcategory_id (subcategory_id),
                INDEX idx_name (name),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            );
        `
    },
    {
        name: "tiers",
        query:`
            CREATE TABLE IF NOT EXISTS tiers (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                tier_key VARCHAR(50),             
                tier_name VARCHAR(50) NOT NULL,   
                tier_order INT DEFAULT 0,                
                threshold_text VARCHAR(100),            
                min_turnover DECIMAL(10,2) DEFAULT 0,
                commission_percent DECIMAL(5,2) DEFAULT 0,
                payment_cycle VARCHAR(50),
                priority_listing BOOLEAN DEFAULT FALSE,      
                color_code VARCHAR(20),           
                badge_color VARCHAR(20),          
                features JSON,                              
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_tier_key (tier_key),
                INDEX idx_min_turnover (min_turnover),
                INDEX idx_is_active (is_active),
                INDEX idx_active_turnover (is_active, min_turnover),
                INDEX idx_tier_order (tier_order)
            );
        `
    },
    {
        name: "vendors",
        query:`
            CREATE TABLE IF NOT EXISTS vendors (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                vendor_code VARCHAR(20) UNIQUE,
                -- Basic Info
                business_name VARCHAR(150) NOT NULL,
                owner_name VARCHAR(150),
                email VARCHAR(150) UNIQUE,
                password VARCHAR(255),
                country_code VARCHAR(10),
                mobile VARCHAR(20),
                emergency_country_code VARCHAR(10),
                emergency_mobile VARCHAR(20),
                -- Categories (store category IDs)
                business_categories JSON,
                -- Tier
                tier_id BIGINT,
                commission_percent DECIMAL(5,2),
                total_turnover DECIMAL(12,2) DEFAULT 0,
                -- Address
                address TEXT,
                country VARCHAR(100),
                country_iso VARCHAR(10),
                state VARCHAR(100),
                state_iso VARCHAR(10),
                city VARCHAR(100),
                pincode VARCHAR(10),
                latitude VARCHAR(50),
                longitude VARCHAR(50),
                auto_approve_products TINYINT(1) DEFAULT 0 COMMENT '1 = auto approve vendor products, 0 = manual approval required',
                -- Personal & Business IDs
                aadhar_number VARCHAR(20),
                pan_number VARCHAR(20),
                license_number VARCHAR(50),
                fassi_code VARCHAR(50),
                gst_number VARCHAR(50),
                -- Bank
                bank_name VARCHAR(150),
                account_name VARCHAR(150),
                account_number VARCHAR(50),
                ifsc VARCHAR(20),
                -- System Fields
                profile_photo VARCHAR(255),
                is_verified BOOLEAN DEFAULT FALSE,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                created_by BIGINT,
                last_login DATETIME,
                kyc_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
                kyc_reject_reason TEXT,
                kyc_verified_by BIGINT,
                kyc_verified_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tier_id) REFERENCES tiers(id),
                system_role VARCHAR(50) DEFAULT 'VENDOR_OWNER',
                INDEX idx_email (email),
                INDEX idx_mobile (mobile),
                INDEX idx_vendor_code (vendor_code),
                INDEX idx_tier_id (tier_id),
                INDEX idx_status (status)
            );
        `
    },
    {
        name: "vendor_files",
        query: `
            CREATE TABLE IF NOT EXISTS vendor_files (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                vendor_id BIGINT,
                file_type VARCHAR(50),
                file_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
                INDEX idx_vendor_id (vendor_id),
                INDEX idx_file_type (file_type)
            );
        `   
    },
    {
        name:"vendor_staff",
        query: `
            CREATE TABLE IF NOT EXISTS vendor_staff (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                vendor_id BIGINT NOT NULL,   -- Link to vendors table

                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                country_code VARCHAR(10) DEFAULT '+91',
                mobile VARCHAR(20) NOT NULL,
                address TEXT,
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'India',
                pincode VARCHAR(10),
                emergency_country_code VARCHAR(10) DEFAULT '+91',
                emergency_mobile VARCHAR(20),
                role VARCHAR(100) NOT NULL,
                status ENUM('Active','Inactive') DEFAULT 'Active',
                profile_photo_key VARCHAR(255) NULL,
                profile_photo VARCHAR(255),
                permissions JSON NULL,
                system_role VARCHAR(50) DEFAULT 'VENDOR_STAFF',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                -- Indexes
                INDEX idx_vendor_id (vendor_id),
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_role (role),
                INDEX idx_created_at (created_at),

                -- Foreign Key
                CONSTRAINT fk_vendor_staff_vendor
                FOREIGN KEY (vendor_id) REFERENCES vendors(id)
                ON DELETE CASCADE
            );
        `           
    },
    {
        name:"products",
        query:`
        CREATE TABLE IF NOT EXISTS products (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                vendor_id BIGINT NOT NULL,
                category_id BIGINT NOT NULL,
                subcategory_id BIGINT NULL,
                brand_id BIGINT NULL,
                custom_brand VARCHAR(255) NULL,

                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE,
                description TEXT,
                specification JSON,

                country_of_origin VARCHAR(100),
                manufacture_date DATE,
                expiry_date DATE,

                return_allowed TINYINT(1) DEFAULT 0,
                return_days INT DEFAULT 0,

                approval_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
                rejection_reason TEXT,
                approved_by BIGINT NULL,
                approved_at TIMESTAMP NULL,
                rejected_at DATETIME NULL,
                rejected_by INT NULL;

                is_live TINYINT(1) DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,

                view_count INT DEFAULT 0,
                sold_count INT DEFAULT 0,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                FOREIGN KEY (vendor_id) REFERENCES vendors(id),
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
                FOREIGN KEY (brand_id) REFERENCES brands(id),

                INDEX idx_vendor (vendor_id),
                INDEX idx_category (category_id),
                INDEX idx_subcategory (subcategory_id),
                INDEX idx_brand (brand_id),
                INDEX idx_status (approval_status),
                INDEX idx_live (is_live),
                INDEX idx_active (is_active)
            );
        `
    },
    {
        name: "product_variants",
        query: `
        CREATE TABLE IF NOT EXISTS product_variants (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,

            variant_name VARCHAR(100) NOT NULL,
            unit VARCHAR(20),
            color VARCHAR(50),

            sku VARCHAR(100) UNIQUE,

            mrp DECIMAL(10,2),
            sale_price DECIMAL(10,2),
            discount_value DECIMAL(10,2),
            discount_type ENUM('Flat','Percent'),

            stock INT DEFAULT 0,
            min_order INT DEFAULT 1,
            low_stock_alert INT DEFAULT 5,

            is_live TINYINT(1) DEFAULT 1,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

            INDEX idx_product (product_id),
            INDEX idx_sku (sku),
            INDEX idx_stock (stock),
            INDEX idx_live (is_live)
        );
        `
    },
    {
        name: "product_images",
        query: `
            CREATE TABLE IF NOT EXISTS product_images (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                product_id BIGINT NOT NULL,

                image_url VARCHAR(500) NOT NULL,
                is_primary TINYINT(1) DEFAULT 0,
                sort_order INT DEFAULT 0,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

                INDEX idx_product (product_id)
            );
        `
    },
    {
        name: "product_stock_logs ",
        query: `
            CREATE TABLE IF NOT EXISTS product_stock_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                product_id BIGINT NOT NULL,
                variant_id BIGINT NOT NULL,
                vendor_id BIGINT NOT NULL,

                change_type ENUM('ADD','REMOVE','ORDER','RETURN') NOT NULL,
                quantity INT NOT NULL,
                previous_stock INT,
                new_stock INT,

                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
                FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,

                INDEX idx_product (product_id),
                INDEX idx_variant (variant_id),
                INDEX idx_vendor (vendor_id),
                INDEX idx_type (change_type),
                INDEX idx_date (created_at)
            );
        `
    },
    {
        name: "banners",
        query: `
            CREATE TABLE IF NOT EXISTS banners (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                banner_name VARCHAR(100) NOT NULL,
                description TEXT,
                banner_image VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_banner_name (banner_name),
                INDEX idx_created_at (created_at)
            );
        `   
    },
    {
        name: "coupons",
        query: `
            CREATE TABLE IF NOT EXISTS coupons (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                discount_type ENUM('Percentage', 'Fixed') NOT NULL,
                discount_value DECIMAL(10,2) NOT NULL,
                min_order_value DECIMAL(10,2) DEFAULT 0,
                max_discount_amount DECIMAL(10,2) DEFAULT 0,
                usage_limit INT DEFAULT NULL,
                used_count INT DEFAULT 0,
                expiry_date DATETIME,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_code (code),
                INDEX idx_status (status),
                INDEX idx_expiry (expiry_date)
            );
        `
    },
    {
        name: "delivery_charges",
        query: `
            CREATE TABLE IF NOT EXISTS delivery_charges (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('Area', 'Distance') NOT NULL,
                area_name VARCHAR(150) NULL,
                min_distance DECIMAL(10,2) NULL,
                max_distance DECIMAL(10,2) NULL,
                charge_amount DECIMAL(10,2) NOT NULL,
                min_order_amount DECIMAL(10,2) DEFAULT 0,
                free_delivery_above DECIMAL(10,2) NULL,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_type (type)
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

