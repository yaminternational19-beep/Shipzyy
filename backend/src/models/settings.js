import db from "../config/db.js";

const TABLES = [
  {
    name: "manage_content",
    query: `
      CREATE TABLE IF NOT EXISTS manage_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_key VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        type VARCHAR(50) DEFAULT 'html',
        icon VARCHAR(50) DEFAULT 'FileText',
        is_deletable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: "help_support_contacts",
    query: `
      CREATE TABLE IF NOT EXISTS help_support_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('customer', 'rider', 'vendor') NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        working_hours VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: "announcements",
    query: `
      CREATE TABLE IF NOT EXISTS announcements (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_detail VARCHAR(50) NOT NULL,
        targeted_to VARCHAR(255) NOT NULL,
        entity_id VARCHAR(100) NULL,
        entity_name VARCHAR(255) NULL,
        status VARCHAR(50) DEFAULT 'Sent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: "faqs",
    query: `
      CREATE TABLE IF NOT EXISTS faqs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        category ENUM('customer', 'rider', 'vendor') NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `
  }
];

const DEFAULT_PAGES = [
  { page_key: 'aboutUs', title: 'About Us', content: 'Shipzzy is your reliable delivery partner ensuring fast and safe deliveries across the country.', type: 'html', icon: 'FileText', is_deletable: false },
  { page_key: 'termsConditions', title: 'Terms and Conditions', content: 'By using this app, you agree to our standard terms and conditions. Delivery times are estimated.', type: 'html', icon: 'FileText', is_deletable: false },
  { page_key: 'privacyPolicy', title: 'Privacy Policy', content: 'We value your privacy. Your data is encrypted and never shared with third parties.', type: 'html', icon: 'FileText', is_deletable: false },
  { page_key: 'androidAppUrl', title: 'Android App URL', content: 'https://play.google.com/store/apps/details?id=com.shipzzy', type: 'url', icon: 'LinkIcon', is_deletable: false },
  { page_key: 'iosAppUrl', title: 'iOS App URL', content: 'https://apps.apple.com/us/app/shipzzy/id123456789', type: 'url', icon: 'LinkIcon', is_deletable: false },
  { page_key: 'websiteUrl', title: 'Website URL', content: 'https://www.shipzzy.com', type: 'url', icon: 'LinkIcon', is_deletable: false }
];

const DEFAULT_CONTACTS = [
  { role: 'customer', name: 'Customer Support', email: 'support@shipzzy.com', phone: '+1-800-555-0199', working_hours: 'Mon-Sat, 9:00 AM - 6:00 PM EST' },
  { role: 'rider', name: 'Rider Support', email: 'riders@shipzzy.com', phone: '+1-800-555-0200', working_hours: '24/7 Priority Support' },
  { role: 'vendor', name: 'Vendor Support', email: 'partners@shipzzy.com', phone: '+1-800-555-0300', working_hours: 'Mon-Fri, 10:00 AM - 7:00 PM EST' }
];

const DEFAULT_ANNOUNCEMENTS = [
  { title: 'Weekend Promo', message: 'Enjoy 50% off on all deliveries this weekend!', target_type: 'ALL', target_detail: 'ALL', targeted_to: 'All Members', status: 'Sent' },
  { title: 'System Maintenance', message: 'Scheduled maintenance this Sunday midnight.', target_type: 'ALL', target_detail: 'ALL', targeted_to: 'All Members', status: 'Sent' },
  { title: 'KYC Reminder', message: 'Vendors, please update your KYC documents by Monday.', target_type: 'VENDOR', target_detail: 'ALL', targeted_to: 'All Vendors', status: 'Sent' },
  { title: 'New Vendor Partner', message: 'Welcome our new partner: FreshMart!', target_type: 'VENDOR', target_detail: 'ALL', targeted_to: 'All Vendors', status: 'Sent' },
  { title: 'Safety Gear Mandatory', message: 'Riders, please ensure you are wearing your safety gear.', target_type: 'RIDER', target_detail: 'ALL', targeted_to: 'All Riders', status: 'Sent' },
  { title: 'Surge Pricing Alert', message: 'Peak hours starting now. Surge pay is active!', target_type: 'RIDER', target_detail: 'ALL', targeted_to: 'All Riders', status: 'Sent' }
];

const DEFAULT_FAQS = [
  { category: 'customer', question: 'How do I track my order?', answer: 'You can track your order in real-time from the "Orders" section in the app.' },
  { category: 'customer', question: 'What are the payment methods available?', answer: 'We accept Credit/Debit cards, UPI, and Cash on Delivery.' },
  { category: 'rider', question: 'How do I start my shift?', answer: 'Go to the "Shift" tab and click the "Go Online" button.' },
  { category: 'rider', question: 'What are the payment methods available?', answer: 'We accept Credit/Debit cards, UPI, and Cash on Delivery.' },
  { category: 'vendor', question: 'How do I update menu items?', answer: 'Use the "Menu Management" section to add or disable items.' },
  { category: 'vendor', question: 'What are the payment methods available?', answer: 'We accept Credit/Debit cards, UPI, and Cash on Delivery.' }
];

const initDatabase = async () => {
  try {
    for (const table of TABLES) {
      const [rows] = await db.query(`SHOW TABLES LIKE '${table.name}'`);

      if (rows.length === 0) {
        await db.query(table.query);
        console.log(`Created table: ${table.name}`);

        // Seed default pages if table is manage_content
        if (table.name === 'manage_content') {
          console.log('Seeding default manage_content pages...');
          for (const page of DEFAULT_PAGES) {
            await db.query(
              `INSERT INTO manage_content (page_key, title, content, type, icon, is_deletable) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [page.page_key, page.title, page.content, page.type, page.icon, page.is_deletable]
            );
          }
        }
        
        // Seed default contacts if table is help_support_contacts
        if (table.name === 'help_support_contacts') {
          console.log('Seeding default contacts...');
          for (const contact of DEFAULT_CONTACTS) {
            await db.query(
              `INSERT INTO help_support_contacts (role, name, email, phone, working_hours) 
               VALUES (?, ?, ?, ?, ?)`,
              [contact.role, contact.name, contact.email, contact.phone, contact.working_hours]
            );
          }
        }

        // Seed default announcements if table is announcements
        if (table.name === 'announcements') {
          console.log('Seeding default announcements...');
          for (const ann of DEFAULT_ANNOUNCEMENTS) {
            await db.query(
              `INSERT INTO announcements (title, message, target_type, target_detail, targeted_to, status) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [ann.title, ann.message, ann.target_type, ann.target_detail, ann.targeted_to, ann.status]
            );
          }
        }

        // Seed default FAQs if table is faqs
        if (table.name === 'faqs') {
          console.log('Seeding default FAQs...');
          for (const faq of DEFAULT_FAQS) {
            await db.query(
              `INSERT INTO faqs (category, question, answer) VALUES (?, ?, ?)`,
              [faq.category, faq.question, faq.answer]
            );
          }
        }
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