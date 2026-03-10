import React from 'react';
import { Bike, Truck, Car, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const VehicleStats = () => {
    const stats = [
        {
            title: 'Total Vehicle Types',
            value: '4',
            trend: '+1',
            icon: Bike,
            color: '#6366f1',
            subText: 'Fleet categories'
        },
        {
            title: 'Active Vehicles',
            value: '3',
            trend: '0',
            icon: Car,
            color: '#10b981',
            subText: 'Currently available'
        },
        {
            title: 'Top Category',
            value: 'Motorbike',
            trend: '+15%',
            icon: Bike,
            color: '#f59e0b',
            subText: 'Most active fleet'
        },
        {
            title: 'Bulk Carriers',
            value: '1',
            trend: 'Stable',
            icon: Truck,
            color: '#06b6d4',
            subText: 'High capacity'
        }
    ];

    return (
        <div className="vehicle-stats-panel">
            {stats.map((stat, i) => (
                <div key={i} className="stat-v-card">
                    <div className="stat-v-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <stat.icon size={24} />
                    </div>
                    <div className="stat-v-info">
                        <p>{stat.title}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h3>{stat.value}</h3>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: stat.trend.startsWith('+') ? '#10b981' : (stat.trend === '0' || stat.trend === 'Stable' ? '#64748b' : '#ef4444'),
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {stat.trend}
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : (stat.trend.startsWith('-') ? <ArrowDownRight size={12} /> : null)}
                            </span>
                        </div>
                        <p>{stat.subText}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VehicleStats;
