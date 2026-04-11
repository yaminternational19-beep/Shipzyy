import React from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';

const ProtectedRoute = ({ children, allowedRoles = ["ALL"] }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole') || 'SUPER_ADMIN';
    const userPermissionsStr = localStorage.getItem('userPermissions');
    const userPermissions = userPermissionsStr ? JSON.parse(userPermissionsStr) : [];

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== "SUPER_ADMIN" && userRole !== "VENDOR_OWNER") {
        if (!userPermissions || userPermissions.length === 0) {
            return <Navigate to="/no-access" replace />;
        }
    }

    // Skip hardcoded role boundaries for dynamic permission-based roles
    if (userRole !== "SUB_ADMIN" && userRole !== "VENDOR_STAFF") {
        if (!allowedRoles.includes("ALL") && !allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
