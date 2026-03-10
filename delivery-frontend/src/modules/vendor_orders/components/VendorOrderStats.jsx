
import React from 'react';
import { ShoppingBag, CheckCircle, Clock, Truck } from 'lucide-react';

const VendorOrderStats = ({ stats }) => {
    const data = stats || {
        total: 0,
        pending: 0,
        assigned: 0,
        delivered: 0
    };

    const config = [
        { label: 'Total Orders', value: data.total, icon: <ShoppingBag size={24} />, bg: '#e0e7ff', color: '#4f46e5' },
        { label: 'Pending', value: data.pending, icon: <Clock size={24} />, bg: '#fffbeb', color: '#b45309' },
        { label: 'Assigned', value: data.assigned, icon: <Truck size={24} />, bg: '#eff6ff', color: '#1d4ed8' },
        { label: 'Completed', value: data.delivered, icon: <CheckCircle size={24} />, bg: '#dcfce7', color: '#15803d' }
    ];

    return (
        <div className="order-stats-panel">
            {config.map((item, idx) => (
                <div key={idx} className="stat-o-card">
                    <div className="stat-o-icon" style={{ background: item.bg, color: item.color }}>
                        {item.icon}
                    </div>
                    <div className="stat-o-info">
                        <h3>{item.value}</h3>
                        <p>{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VendorOrderStats;
