import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users2,
    BarChart3,
    CreditCard,
    Receipt,
    HelpCircle,
    Users
} from 'lucide-react';

export const vendorMenuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview and analytics" },

    { name: "Staff", key: "STAFF", icon: Users2, path: "/staff", group: "ADMIN_CONTROL", description: "Manage your staff members" },

    { name: "Products", key: "VENDOR_PRODUCTS", icon: Package, path: "/vendor-products", group: "MANAGEMENT", description: "Manage your products" },
    { name: "Orders", key: "VENDOR_ORDERS", icon: ShoppingBag, path: "/vendor-orders", group: "MANAGEMENT", description: "Manage your orders" },
    // { name: "Reports", key: "REPORTS", icon: BarChart3, path: "/vendor-reports", group: "MANAGEMENT", description: "View your sales reports" },

    { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/vendor-payouts", group: "FINANCE", description: "Manage your payouts" },
    { name: "Invoices", key: "INVOICES", icon: Receipt, path: "/vendor-invoices", group: "FINANCE", description: "View your invoices" },

    { name: "Customers", key: "CUSTOMERS", icon: Users, path: "/vendor-customers", group: "CUSTOMERS", description: "Manage customer accounts" },

    { name: "Support", key: "VENDOR_SUPPORT", icon: HelpCircle, path: "/vendor/help-support", group: "SUPPORT", description: "Get support for your store" },
];

export const vendorSidebarGroups = {
    ADMIN_CONTROL: "Staff Management",
    MANAGEMENT: "Product Management",
    FINANCE: "Finance",
    SUPPORT: "Support",
    CUSTOMERS: "Customers"
};
