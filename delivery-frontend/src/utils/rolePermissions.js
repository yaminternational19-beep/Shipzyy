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
        "VEHICLES",
        "QUANTITY",
        "ZONES",
        "TICKETS",
        "REFUNDS",
        "PAYOUTS",
        "INVOICES",
        "SETTINGS",
        "VENDOR_ORDERS",
        "VENDOR_PRODUCTS"
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
        "QUANTITY",
        "ZONES",
        "VENDOR_ORDERS",
        "VENDOR_PRODUCTS"
    ],

    SUB_ADMIN: [
        "DASHBOARD",
        "ORDERS",
        "SUB_ADMINS",
        "CUSTOMERS"
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
