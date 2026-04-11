import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Vendor Imports
import VendorProductPage from '../modules/vendor_products/VendorProductsPage';
import VendorOrdersPage from '../modules/vendor_orders/VendorOrdersPage';
import { VendorSettingsPage } from '../modules/vendor_settings';
import { VendorStaffManagement } from '../modules/vendor_staff';
import { CustomerManagement } from '../modules/customers';

// Placeholder for missing modules
import ComingSoon from '../pages/ComingSoon';

export const VendorRoutes = [
    // STAFF MANAGEMENT (ADMIN_CONTROL group in config)
    <Route
        key="vendor-staff"
        path="/staff"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorStaffManagement />
            </ProtectedRoute>
        }
    />,

    // PRODUCT MANAGEMENT (MANAGEMENT group in config)
    <Route
        key="vendor-products"
        path="/vendor-products"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorProductPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-orders"
        path="/vendor-orders"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorOrdersPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-reports"
        path="/vendor-reports"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <ComingSoon title="Vendor Reports" />
            </ProtectedRoute>
        }
    />,

    // FINANCE
    <Route
        key="vendor-payouts"
        path="/vendor-payouts"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <ComingSoon title="Vendor Payouts" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-invoices"
        path="/vendor-invoices"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <ComingSoon title="Vendor Invoices" />
            </ProtectedRoute>
        }
    />,

    // CUSTOMERS
    <Route
        key="vendor-customers"
        path="/vendor-customers"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <CustomerManagement />
            </ProtectedRoute>
        }
    />,

    // SUPPORT
    <Route
        key="vendor-help-raise"
        path="/vendor/help-support/raise-query"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage activeTab="raise-query" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-help-history"
        path="/vendor/help-support/history"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage activeTab="history" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-help-faq"
        path="/vendor/help-support/faq"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage activeTab="faq" />
            </ProtectedRoute>
        }
    />
];
