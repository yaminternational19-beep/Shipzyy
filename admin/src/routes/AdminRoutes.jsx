import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Admin Imports
import SubAdminManagement from '../modules/subadmin/SubAdminsPage';
import { VendorManagement } from '../modules/vendors';
import { CustomerManagement } from '../modules/customers';
import CategoriesPage from '../modules/categories/CategoriesPage';
import ProductsPage from '../modules/products/ProductsPage';
import OrdersPage from '../modules/orders/OrdersPage';
import RidersPage from '../modules/riders/RidersPage';
import VehicleTypesPage from '../modules/vehicles/VehicleTypesPage';
import { SubCategoriesPage } from '../modules/subcategories';
import BrandsPage from '../modules/brands/BrandsPage';
import { TicketsPage } from '../modules/tickets';
import { RefundsPage } from '../modules/refunds';
import { SettingsPage } from '../modules/settings';
import BannersPage from '../modules/banners/BannersPage';
import { CouponsPage } from '../modules/coupons';
import { DeliveryChargesPage } from '../modules/delivery_charges';
import VendorOwnerDashboard from '../modules/dashboard/dashboards/VendorOwnerDashboard';
import ReviewsPage from '../modules/reviews/ReviewsPage';
import ComingSoon from '../pages/ComingSoon';

export const AdminRoutes = [
    // ADMIN CONTROL
    <Route
        key="subadmin"
        path="/subadmin"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SubAdminManagement />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendors"
        path="/vendors"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <VendorManagement />
            </ProtectedRoute>
        }
    />,

    // CATALOG MANAGEMENT
    <Route
        key="categories"
        path="/categories"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <CategoriesPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="sub-categories"
        path="/sub-categories"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SubCategoriesPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="brands"
        path="/brands"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <BrandsPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="banners"
        path="/banners"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <BannersPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="coupons"
        path="/coupons"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <CouponsPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="delivery-charges"
        path="/delivery-charges"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <DeliveryChargesPage />
            </ProtectedRoute>
        }
    />,

    // PRODUCT MANAGEMENT
    <Route
        key="products"
        path="/products"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <ProductsPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="reviews"
        path="/reviews"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <ReviewsPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="orders"
        path="/orders"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <OrdersPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="admin-reports"
        path="/reports"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <ComingSoon title="Admin Reports" />
            </ProtectedRoute>
        }
    />,

    // RIDERS
    <Route
        key="riders"
        path="/riders"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <RidersPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="rider-terminations"
        path="/riders/terminations"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <RidersPage />
            </ProtectedRoute>
        }
    />,

    // CUSTOMERS
    <Route
        key="customers"
        path="/customers"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <CustomerManagement />
            </ProtectedRoute>
        }
    />,
    <Route
        key="customers-suspended"
        path="/customers/suspended"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <CustomerManagement />
            </ProtectedRoute>
        }
    />,
    <Route
        key="customers-terminated"
        path="/customers/terminated"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <CustomerManagement />
            </ProtectedRoute>
        }
    />,

    // SUPPORT
    <Route
        key="tickets"
        path="/tickets"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <TicketsPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="refunds"
        path="/refunds"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <RefundsPage />
            </ProtectedRoute>
        }
    />,

    // FINANCE
    <Route
        key="admin-payouts"
        path="/payouts"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <ComingSoon title="Admin Payouts" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="admin-invoices"
        path="/invoices"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <ComingSoon title="Admin Invoices" />
            </ProtectedRoute>
        }
    />,

    // SETTINGS
    <Route
        key="settings-manage"
        path="/settings/manage-content"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SettingsPage activeTab="manage-content" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="settings-announcements"
        path="/settings/announcements"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SettingsPage activeTab="announcements" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="settings-help"
        path="/settings/help-support"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SettingsPage activeTab="help-support" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="settings-faq"
        path="/settings/faq"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <SettingsPage activeTab="faq" />
            </ProtectedRoute>
        }
    />,

    // MISC / SHARED WITH SPECIFIC PARAMS
    <Route
        key="vendor-dashboard-view"
        path="/vendors/:id"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <VendorOwnerDashboard />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vehicles"
        path="/vehicles"
        element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN"]}>
                <VehicleTypesPage />
            </ProtectedRoute>
        }
    />
];
