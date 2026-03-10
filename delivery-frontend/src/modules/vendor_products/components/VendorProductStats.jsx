import React from 'react';
import { Package, Power, Clock, AlertTriangle } from 'lucide-react';

const VendorProductStats = ({ stats }) => {
    const data = stats || {
        total: 0,
        live: 0,
        pending: 0,
        outOfStock: 0
    };

    const statCards = [
        {
            label: 'Total Catalog',
            value: data.total,
            icon: Package,
            iconBg: '#e0e7ff',
            iconColor: '#4f46e5'
        },
        {
            label: 'Live Products',
            value: data.live,
            icon: Power,
            iconBg: '#dcfce7',
            iconColor: '#15803d'
        },
        {
            label: 'Awaiting Approval',
            value: data.pending,
            icon: Clock,
            iconBg: '#fffbeb',
            iconColor: '#b45309'
        },
        {
            label: 'Out Of Stock',
            value: data.outOfStock,
            icon: AlertTriangle,
            iconBg: '#fef2f2',
            iconColor: '#ef4444'
        }
    ];

    return (
        <div className="product-stats-panel">
            {statCards.map((card, idx) => (
                <div key={idx} className="stat-p-card">
                    <div
                        className="stat-p-icon"
                        style={{ background: card.iconBg, color: card.iconColor }}
                    >
                        <card.icon size={26} />
                    </div>
                    <div className="stat-p-info">
                        <h3>{card.value}</h3>
                        <p>{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VendorProductStats;
