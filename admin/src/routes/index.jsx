import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import NoAccess from '../pages/NoAccess';
import { LoginPage } from '../modules/login';
import { DashboardPage } from '../modules/dashboard';
import ProfilePage from '../pages/profilepage';
import NotificationsPage from '../pages/NotificationsPage';

// Split Route Configurations
import { AdminRoutes } from './AdminRoutes';
import { VendorRoutes } from './VendorRoutes';

const GlobalRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/no-access" element={<NoAccess />} />

            {/* Common Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "VENDOR_OWNER", "VENDOR_STAFF"]}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/notifications"
                element={
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "SUB_ADMIN", "VENDOR_OWNER", "VENDOR_STAFF"]}>
                        <NotificationsPage />
                    </ProtectedRoute>
                }
            />

            {/* Central Admin Modules */}
            {AdminRoutes}

            {/* Vendor Portal Modules */}
            {VendorRoutes}

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default GlobalRoutes;
