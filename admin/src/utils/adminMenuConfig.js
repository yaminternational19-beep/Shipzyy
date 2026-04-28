import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Truck,
    Layers,
    ListTree,
    Award,
    Bike,
    Ticket,
    Undo2,
    CreditCard,
    Receipt,
    BarChart3,
    FileText,
    BellRing,
    HelpCircle,
    UserCheck,
    Image as ImageIcon,
    MessageSquare
} from 'lucide-react';

export const adminMenuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview, analytics and reports" },

    { name: "Sub-Admins", key: "SUB_ADMINS", icon: Users, path: "/subadmin", group: "ADMIN_CONTROL", description: "Manage system administrator accounts" },
    { name: "Vendors", key: "VENDORS", icon: Truck, path: "/vendors", group: "ADMIN_CONTROL", description: "Handle applications, KYC and tiering" },

    { name: "Categories", key: "CATEGORIES", icon: Layers, path: "/categories", group: "CATALOG_MANAGEMENT", description: "Manage product categories" },
    { name: "Sub-Categories", key: "SUBCATEGORIES", icon: ListTree, path: "/sub-categories", group: "CATALOG_MANAGEMENT", description: "Manage product sub-categories" },
    { name: "Brands", key: "BRANDS", icon: Award, path: "/brands", group: "CATALOG_MANAGEMENT", description: "Manage product brands" },
    { name: "Banners", key: "BANNERS", icon: ImageIcon, path: "/banners", group: "CATALOG_MANAGEMENT", description: "Manage banners" },
    { name: "Coupons", key: "COUPONS", icon: Ticket, path: "/coupons", group: "CATALOG_MANAGEMENT", description: "Manage discount coupons" },
    { name: "Delivery Charges", key: "DELIVERY_CHARGES", icon: Truck, path: "/delivery-charges", group: "CATALOG_MANAGEMENT", description: "Manage delivery fees" },

    { name: "Products", key: "PRODUCTS", icon: Package, path: "/products", group: "PRODUCT_MANAGEMENT", description: "Manage catalogue and item stock" },
    { name: "Reviews", key: "REVIEWS", icon: MessageSquare, path: "/reviews", group: "PRODUCT_MANAGEMENT", description: "Manage customer reviews and feedback" },
    { name: "Orders", key: "ORDERS", icon: ShoppingBag, path: "/orders", group: "PRODUCT_MANAGEMENT", description: "Track and manage customer orders" },
    // { name: "Reports", key: "REPORTS", icon: BarChart3, path: "/reports", group: "PRODUCT_MANAGEMENT", description: "View system reports" },

    { name: "Riders", key: "RIDERS", icon: Bike, path: "/riders", group: "RIDERS", description: "Live tracking and rider management" },
    { name: "Rider Terminations", key: "RIDER_TERMINATIONS", icon: Bike, path: "/riders", group: "RIDERS", description: "Manage rider terminations" },

    { name: "Customers", key: "CUSTOMERS", icon: Users, path: "/customers", group: "CUSTOMERS", description: "Manage customer accounts" },
    { name: "Suspended Customers", key: "SUSPENDED_CUSTOMERS", icon: Users, path: "/customers/suspended", group: "CUSTOMERS", description: "Manage suspended customer accounts" },
    { name: "Terminated Customers", key: "TERMINATED_CUSTOMERS", icon: Users, path: "/customers/terminated", group: "CUSTOMERS", description: "Manage terminated customer accounts" },

    { name: "Tickets", key: "TICKETS", icon: Ticket, path: "/tickets", group: "SUPPORT", description: "Manage support tickets" },
    { name: "Refunds", key: "REFUNDS", icon: Undo2, path: "/refunds", group: "SUPPORT", description: "Manage customer refunds" },

    // { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/payouts", group: "FINANCE", description: "Manage vendor payouts" },
    { name: "Vendor Invoices", key: "VENDOR_INVOICES", icon: Receipt, path: "/invoices/vendor", group: "INVOICES", description: "Manage vendor invoices" },
    { name: "Customer Invoices", key: "CUSTOMER_INVOICES", icon: Receipt, path: "/invoices/customer", group: "INVOICES", description: "Manage customer invoices" },

    { name: "Manage Content", key: "SETTINGS", icon: FileText, path: "/settings/manage-content", group: "SETTINGS" },
    { name: "Announcements", key: "SETTINGS", icon: BellRing, path: "/settings/announcements", group: "SETTINGS" },
    { name: "Help & Support", key: "SETTINGS", icon: HelpCircle, path: "/settings/help-support", group: "SETTINGS" },
    { name: "FAQ Manager", key: "SETTINGS", icon: UserCheck, path: "/settings/faq", group: "SETTINGS" },
];

export const adminSidebarGroups = {
    ADMIN_CONTROL: "Admin Control",
    CATALOG_MANAGEMENT: "Catalog Management",
    PRODUCT_MANAGEMENT: "Product Management",
    CUSTOMERS: "Customers",
    RIDERS: "Riders",
    SUPPORT: "Support",
    INVOICES: "Invoices",
    SETTINGS: "Settings"
};
