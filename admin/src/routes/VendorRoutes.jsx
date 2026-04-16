import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Vendor Imports
import VendorProductPage from '../modules/vendor_products/VendorProductsPage';
import VendorOrdersPage from '../modules/vendor_orders/VendorOrdersPage';
import { VendorSupportPage } from '../modules/vendor_support';
import { VendorStaffManagement } from '../modules/vendor_staff';
import VendorSettingsPage from '../modules/vendor_settings/VendorSettingsPage';
import VendorCustomersPage from '../modules/vendor_customers/VendorCustomersPage';
import VendorReviewsPage from '../modules/vendor_reviews/VendorReviewsPage';

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
        key="vendor-reviews"
        path="/vendor-reviews"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorReviewsPage />
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
                <VendorCustomersPage />
            </ProtectedRoute>
        }
    />,

    // SUPPORT
    <Route
        key="vendor-help-raise"
        path="/vendor/help-support/raise-query"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSupportPage activeTab="raise-query" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-help-history"
        path="/vendor/help-support/history"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSupportPage activeTab="history" />
            </ProtectedRoute>
        }
    />,
    <Route
        key="vendor-help-faq"
        path="/vendor/help-support/faq"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSupportPage activeTab="faq" />
            </ProtectedRoute>
        }
    />,

    <Route
        key="vendor-announcements"
        path="/vendor/announcements"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage type="announcements" />
            </ProtectedRoute>
        }
    />,

    <Route
        key="vendor-about-us"
        path="/vendor/about-us"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage type="about-us" />
            </ProtectedRoute>
        }
    /> ,

    <Route
        key="vendor-app-links"
        path="/vendor/app-links"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage type="platform-links" />
            </ProtectedRoute>
        }
    />,

    <Route
        key="vendor-terms-and-conditions"
        path="/vendor/Terms-and-Conditions"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage type="terms" />
            </ProtectedRoute>
        }
    />,

    <Route
        key="vendor-privacy-policy"
        path="/vendor/privacy-policy"
        element={
            <ProtectedRoute allowedRoles={["VENDOR_OWNER", "VENDOR_STAFF"]}>
                <VendorSettingsPage type="privacy" />
            </ProtectedRoute>
        }
    />,


];
