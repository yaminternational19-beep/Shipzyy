import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users2,
    BarChart3,
    CreditCard,
    Receipt,
    HelpCircle,
    Users,
    Info,
    FileText,
    ShieldCheck,
    Headphones,
    Smartphone,
    Megaphone
} from 'lucide-react';

export const vendorMenuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview and analytics" },

    { name: "Staff", key: "STAFF", icon: Users2, path: "/staff", group: "ADMIN_CONTROL", description: "Manage your staff members" },

    { name: "Products", key: "VENDOR_PRODUCTS", icon: Package, path: "/vendor-products", group: "MANAGEMENT", description: "Manage your products" },
    { name: "Orders", key: "VENDOR_ORDERS", icon: ShoppingBag, path: "/vendor-orders", group: "MANAGEMENT", description: "Manage your orders" },
    // { name: "Reports", key: "REPORTS", icon: BarChart3, path: "/vendor-reports", group: "MANAGEMENT", description: "View your sales reports" },

    // { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/vendor-payouts", group: "FINANCE", description: "Manage your payouts" },
    { name: "Invoices", key: "INVOICES", icon: Receipt, path: "/vendor-invoices", group: "FINANCE", description: "View your invoices" },

    { name: "Customers", key: "CUSTOMERS", icon: Users, path: "/vendor-customers", group: "CUSTOMERS", description: "Manage customer accounts" },

    { name: "Support", key: "VENDOR_SUPPORT", icon: Headphones, path: "/vendor/help-support/raise-query", group: "SUPPORT", description: "Get support for your store" },
    { name: "Announcements", key: "ANNOUNCEMENTS", icon: Megaphone, path: "/vendor/announcements", group: "SUPPORT", description: "View latest platform updates" },
    { name: "About-US", key: "ABOUT_US", icon: Info, path: "/vendor/about-us", group: "SUPPORT", description: "Learn more about us" },
    { name: "Terms-and-Conditions", key: "TERMS_AND_CONDITIONS", icon: FileText, path: "/vendor/Terms-and-Conditions", group: "SUPPORT", description: "View our terms and conditions" },
    { name: "Privacy-Policy", key: "PRIVACY_POLICY", icon: ShieldCheck, path: "/vendor/privacy-policy", group: "SUPPORT", description: "View our privacy policy" },
    { name: "App-Links", key: "PLATFORM_LINKS", icon: Smartphone, path: "/vendor/app-links", group: "SUPPORT", description: "Quick access to platform links" },
];

export const vendorSidebarGroups = {
    ADMIN_CONTROL: "Staff Management",
    MANAGEMENT: "Product Management",
    FINANCE: "Finance",
    SUPPORT: "Support",
    CUSTOMERS: "Customers"
};
