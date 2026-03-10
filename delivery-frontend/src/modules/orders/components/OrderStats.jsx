import React from 'react';
import { ShoppingBag, CheckCircle, Truck, Clock } from 'lucide-react';

const OrderStats = ({ stats }) => {
    const data = stats || {
        total: 0,
        delivered: 0,
        onTheWay: 0,
        pending: 0
    };

    return (
        <div className="order-stats-panel">
            <div className="stat-o-card">
                <div className="stat-o-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                    <ShoppingBag size={24} />
                </div>
                <div className="stat-o-info">
                    <h3>{data.total}</h3>
                    <p>Total Orders</p>
                </div>
            </div>

            <div className="stat-o-card">
                <div className="stat-o-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                    <CheckCircle size={24} />
                </div>
                <div className="stat-o-info">
                    <h3>{data.delivered}</h3>
                    <p>Total Delivered</p>
                </div>
            </div>

            <div className="stat-o-card">
                <div className="stat-o-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                    <Truck size={24} />
                </div>
                <div className="stat-o-info">
                    <h3>{data.onTheWay}</h3>
                    <p>On The Way</p>
                </div>
            </div>

            <div className="stat-o-card">
                <div className="stat-o-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Clock size={24} />
                </div>
                <div className="stat-o-info">
                    <h3>{data.pending}</h3>
                    <p>Pending / Processing</p>
                </div>
            </div>
        </div>
    );
};

export default OrderStats;
