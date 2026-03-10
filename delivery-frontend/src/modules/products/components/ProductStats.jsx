import React from 'react';
import { Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProductStats = ({ stats }) => {
    // Default values if no stats provided
    const data = stats || {
        total: 0,
        active: 0,
        pending: 0,
        outOfStock: 0
    };

    return (
        <div className="product-stats-panel">
            <div className="stat-p-card">
                <div className="stat-p-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                    <Package size={24} />
                </div>
                <div className="stat-p-info">
                    <h3>{data.total}</h3>
                    <p>Total Products</p>
                </div>
            </div>

            <div className="stat-p-card">
                <div className="stat-p-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                    <CheckCircle size={24} />
                </div>
                <div className="stat-p-info">
                    <h3>{data.active}</h3>
                    <p>Approved & Active</p>
                </div>
            </div>

            <div className="stat-p-card">
                <div className="stat-p-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Clock size={24} />
                </div>
                <div className="stat-p-info">
                    <h3>{data.pending}</h3>
                    <p>Pending Approval</p>
                </div>
            </div>

            <div className="stat-p-card">
                <div className="stat-p-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <AlertCircle size={24} />
                </div>
                <div className="stat-p-info">
                    <h3>{data.outOfStock}</h3>
                    <p>Out of Stock / Rejected</p>
                </div>
            </div>
        </div>
    );
};

export default ProductStats;
