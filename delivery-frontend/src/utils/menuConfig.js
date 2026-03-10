import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Truck,
    Layers,
    ListTree,
    Award,
    Car,
    Scale,
    Bike,
    Ticket,
    Undo2,
    CreditCard,
    Receipt,
    Users2,
    BarChart3,
    Settings
} from 'lucide-react';

export const menuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview, analytics and reports" },
    { name: "Sub-Admins", key: "SUB_ADMINS", icon: Users, path: "/subadmin", group: "MANAGEMENT", description: "Manage system administrator accounts" },
    { name: "Vendors", key: "VENDORS", icon: Truck, path: "/vendors", group: "MANAGEMENT", description: "Handle applications, KYC and tiering" },
    { name: "Categories", key: "CATEGORIES", icon: Layers, path: "/categories", group: "MANAGEMENT", description: "Manage product categories" },
    { name: "Sub-Categories", key: "SUBCATEGORIES", icon: ListTree, path: "/sub-categories", group: "MANAGEMENT", description: "Manage product sub-categories" },
    { name: "Brands", key: "BRANDS", icon: Award, path: "/brands", group: "MANAGEMENT", description: "Manage product brands" },
    { name: "Products", key: "PRODUCTS", icon: Package, path: "/products", group: "MANAGEMENT", description: "Manage catalogue and item stock" },
    { name: "Vendor Products", key: "VENDOR_PRODUCTS", icon: Package, path: "/vendor-products", group: "MANAGEMENT", description: "Manage vendor-specific products" },
    { name: "Orders", key: "ORDERS", icon: ShoppingBag, path: "/orders", group: "MANAGEMENT", description: "Track and manage customer orders" },
    { name: "Vendor Orders", key: "VENDOR_ORDERS", icon: ShoppingBag, path: "/vendor-orders", group: "MANAGEMENT", description: "Manage vendor orders" },
    { name: "Vehicle Types", key: "VEHICLES", icon: Car, path: "/vehicles", group: "MANAGEMENT", description: "Manage vehicle types" },
    { name: "Quantity", key: "QUANTITY", icon: Scale, path: "/quantity", group: "MANAGEMENT", description: "Manage quantity units" },
    { name: "Riders", key: "RIDERS", icon: Bike, path: "/riders", group: "MANAGEMENT", description: "Live tracking and rider management" },
    { name: "Customers", key: "CUSTOMERS", icon: Users, path: "/customers", group: "MANAGEMENT", description: "Client accounts and support tickets" },
    { name: "Tickets", key: "TICKETS", icon: Ticket, path: "/tickets", group: "SUPPORT", description: "Manage support tickets" },
    { name: "Refunds", key: "REFUNDS", icon: Undo2, path: "/refunds", group: "SUPPORT", description: "Manage customer refunds" },
    { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/payouts", group: "FINANCE", description: "Manage vendor payouts" },
    { name: "Invoices", key: "INVOICES", icon: Receipt, path: "/invoices", group: "FINANCE", description: "Manage system invoices" },
    { name: "Staff", key: "STAFF", icon: Users2, path: "/staff", group: "VENDOR", description: "Manage vendor staff" },
    { name: "Reports", key: "REPORTS", icon: BarChart3, path: "/reports", group: "VENDOR", description: "View system reports" },
    { name: "Settings", key: "SETTINGS", icon: Settings, path: "/settings", group: "OTHER", description: "Core platform configurations" },
];

export const sidebarGroups = {
    PLATFORM: "Platform",
    MANAGEMENT: "Management",
    SUPPORT: "Support",
    FINANCE: "Finance",
    VENDOR: "Vendor Mgmt",
    OTHER: "Other"
};
