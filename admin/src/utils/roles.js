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
    Settings,
    FileText,
    BellRing,
    HelpCircle,
    UserCheck,
    Image as ImageIcon
} from 'lucide-react';

export const menuItems = [
    { name: "Dashboard", key: "DASHBOARD", icon: LayoutDashboard, path: "/", description: "Overview, analytics and reports" },

    { name: "Sub-Admins", key: "SUB_ADMINS", icon: Users, path: "/subadmin", group: "ADMIN CONTROL", description: "Manage system administrator accounts" },
    { name: "Vendors", key: "VENDORS", icon: Truck, path: "/vendors", group: "ADMIN CONTROL", description: "Handle applications, KYC and tiering" },

    { name: "Categories", key: "CATEGORIES", icon: Layers, path: "/categories", group: "CATALOG MANAGEMENT", description: "Manage product categories" },
    { name: "Sub-Categories", key: "SUBCATEGORIES", icon: ListTree, path: "/sub-categories", group: "CATALOG MANAGEMENT", description: "Manage product sub-categories" },
    { name: "Brands", key: "BRANDS", icon: Award, path: "/brands", group: "CATALOG MANAGEMENT", description: "Manage product brands" },
    { name: "Banners", key: "BANNERS", icon: ImageIcon, path: "/banners", group: "CATALOG MANAGEMENT", description: "Manage banners" },
    { name: "Coupons", key: "COUPONS", icon: Ticket, path: "/coupons", group: "CATALOG MANAGEMENT", description: "Manage discount coupons" },
    { name: "Delivery Charges", key: "DELIVERY_CHARGES", icon: Truck, path: "/delivery-charges", group: "CATALOG MANAGEMENT", description: "Manage delivery fees" },


    { name: "Products", key: "PRODUCTS", icon: Package, path: "/products", group: "PRODUCT MANAGEMENT", description: "Manage catalogue and item stock" },
    { name: "Orders", key: "ORDERS", icon: ShoppingBag, path: "/orders", group: "PRODUCT MANAGEMENT", description: "Track and manage customer orders" },
    { name: "Reports", key: "REPORTS", icon: BarChart3, path: "/reports", group: "PRODUCT MANAGEMENT", description: "View system reports" },


    { name: "Riders", key: "RIDERS", icon: Bike, path: "/riders", group: "RIDERS", description: "Live tracking and rider management" },
    { name: "Rider Terminations", key: "RIDER_TERMINATIONS", icon: Bike, path: "/riders", group: "RIDERS", description: "Manage rider terminations" },

    {name : "Customers", key: "CUSTOMERS", icon: Users, path: "/customers", group: "CUSTOMERS", description: "Manage customer accounts" },
    { name: "Suspended Customers", key: "SUSPENDED_CUSTOMERS", icon: Users, path: "/customers/suspended", group: "CUSTOMERS", description: "Manage suspended customer accounts" },
    { name: "Terminated Customers", key: "TERMINATED_CUSTOMERS", icon: Users, path: "/customers/terminated", group: "CUSTOMERS", description: "Manage terminated customer accounts" },
    
    { name: "Tickets", key: "TICKETS", icon: Ticket, path: "/tickets", group: "SUPPORT", description: "Manage support tickets" },
    { name: "Refunds", key: "REFUNDS", icon: Undo2, path: "/refunds", group: "SUPPORT", description: "Manage customer refunds" },
    
    { name: "Payouts", key: "PAYOUTS", icon: CreditCard, path: "/payouts", group: "FINANCE", description: "Manage vendor payouts" },
    { name: "Invoices", key: "INVOICES", icon: Receipt, path: "/invoices", group: "FINANCE", description: "Manage system invoices" },
   
    { name: "Manage Content", key: "MANAGE_CONTENT", icon: FileText, path: "/settings/manage-content", group: "SETTINGS" },
    { name: "Announcements", key: "ANNOUNCEMENTS", icon: BellRing, path: "/settings/announcements", group: "SETTINGS" },
    { name: "Help & Support", key: "HELP_SUPPORT", icon: HelpCircle, path: "/settings/help-support", group: "SETTINGS" },
    { name: "FAQ Manager", key: "FAQ_MANAGER", icon: UserCheck, path: "/settings/faq", group: "SETTINGS" },
];

export const sidebarGroups = {
    OVERVIEW: "Overview",
    "ADMIN CONTROL": "Admin Control",
    "CATALOG MANAGEMENT": "Catalog Management",
    "PRODUCT MANAGEMENT": "Product Management",
    CUSTOMERS: "Customers",
    RIDERS: "Riders",
    SUPPORT: "Support",
    FINANCE: "Finance",
    VENDOR: "Vendor Mgmt",
    ADMIN_MANAGEMENT: "Admin Management",
    SETTINGS: "Settings",
    OTHER: "Other"
};
