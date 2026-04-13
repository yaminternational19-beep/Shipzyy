import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users2,
    HelpCircle,
    CreditCard,
    Receipt,
    Users
} from 'lucide-react';

export const menuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview, analytics and reports" },

    { name: "Products", key: "VENDOR_PRODUCTS", icon: Package, path: "/vendor-products", group: "PRODUCT MANAGEMENT", description: "Manage products" },
    { name: "Orders", key: "VENDOR_ORDERS", icon: ShoppingBag, path: "/vendor-orders", group: "PRODUCT MANAGEMENT", description: "Track and manage orders" },

    { name: "Customers", key: "CUSTOMERS", icon: Users, path: "/vendor-customers", group: "CUSTOMERS", description: "Manage customer accounts" },

    { name: "Staff", key: "STAFF", icon: Users2, path: "/staff", group: "MANAGEMENT", description: "Manage staff members" },

    { name: "Support", key: "VENDOR_SUPPORT", icon: HelpCircle, path: "/vendor/help-support", group: "SUPPORT", description: "Get support for vendor related queries" },

    { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/payouts", group: "FINANCE", description: "Manage vendor payouts" },
    { name: "Invoices", key: "INVOICES", icon: Receipt, path: "/invoices", group: "FINANCE", description: "Manage system invoices" },
];

export const sidebarGroups = {
    OVERVIEW: "Overview",
    "PRODUCT MANAGEMENT": "Product Management",
    "CUSTOMERS": "Customers",
    "MANAGEMENT": "Management",
    "SUPPORT": "Support",
    "FINANCE": "Finance",
};
