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
        "RIDERS",
        "CUSTOMERS",
        "TICKETS",
        "REFUNDS",
        "SETTINGS",
        "VENDOR_ORDERS",
        "VENDOR_PRODUCTS",
        "VENDOR_SUPPORT",
        "STAFF"
    ],
    


    ADMIN: [
        "DASHBOARD",
        "ORDERS",
        "VENDORS",
        "SUB_ADMINS",
        "CATEGORIES",
        "SUBCATEGORIES",
        "BRANDS",
        "PRODUCTS",
        "RIDERS",
        "CUSTOMERS",
        "VEHICLES",
        "VENDOR_ORDERS",
        "VENDOR_PRODUCTS",
        "VENDOR_SUPPORT",
        "STAFF"
    ],

    SUB_ADMIN: [
        "DASHBOARD",
        "ORDERS",
        "SUB_ADMINS",
        "CUSTOMERS",
        "STAFF"
    ],

    SUPPORT_AGENT: [
        "DASHBOARD",
        "TICKETS",
        "REFUNDS"
    ],

    FINANCE_USER: [
        "DASHBOARD",
        "PAYOUTS",
        "INVOICES"
    ],

    VENDOR_OWNER: [
        "DASHBOARD",
        "VENDOR_ORDERS",
        "VENDOR_PRODUCTS",
        "RIDERS",
        "CUSTOMERS",
        "PAYOUTS",
        "INVOICES",
        "REPORTS",
        "STAFF",
        "TICKETS",
        "VENDOR_SUPPORT"
    ],

    VENDOR_MANAGER: [
        "DASHBOARD",
        "ORDERS",
        "PRODUCTS"
    ],

    VENDOR_STAFF: [
        "ORDERS",
        "PRODUCTS"
    ]
};
