import React from 'react';
import { useParams } from 'react-router-dom';
import VendorOwnerDashboard from './VendorOwnerDashboard';

/**
 * Admin wrapper for the Vendor Dashboard.
 * Reads the vendor ID from the route (/vendors/:id) and passes it
 * as a prop to VendorOwnerDashboard so the API call includes the correct vendorId.
 */
const AdminVendorDashboard = () => {
    const { id } = useParams();
    return <VendorOwnerDashboard vendorId={id} />;
};

export default AdminVendorDashboard;
