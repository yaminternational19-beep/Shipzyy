export const rolePermissions = {
    SUPER_ADMIN: [
        "DASHBOARD",
        "ORDERS",
        "VENDORS",
        "SUB_ADMINS",
        "CATEGORIES",
        "SUBCATEGORIES",
        "BRANDS",
        "PRODUCTS",
        // "RIDERS",
        // "RIDER_TERMINATIONS",
        "CUSTOMERS",
        "SUSPENDED_CUSTOMERS",
        "TERMINATED_CUSTOMERS",
        "TICKETS",
        "REFUNDS",
        "SETTINGS",
        "BANNERS",
        "COUPONS",
        "DELIVERY_CHARGES",
        "REPORTS",
        "VENDOR_INVOICES",
        "CUSTOMER_INVOICES",

        "REVIEWS"
    ],

    VENDOR_OWNER: [
        "DASHBOARD",
        "VENDOR_ORDERS",
        "VENDOR_RETURNS",
        "VENDOR_PRODUCTS",
        "VENDOR_REVIEWS",
        "STAFF",
        "VENDOR_SUPPORT",
        // "PAYOUTS",  // Payout feature is inactive - commented out
        "INVOICES",   // Matches vendorMenuConfig.js key → path: /vendor-invoices
        "CUSTOMERS",
        "ANNOUNCEMENTS",
        "ABOUT_US",
        "TERMS_AND_CONDITIONS",
        "PRIVACY_POLICY",
        "PLATFORM_LINKS",
        "VENDOR_REVIEWS"
    ]
};
