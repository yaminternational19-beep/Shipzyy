import React from 'react';
import { Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './InvoiceStats.css';

const InvoiceStats = ({ stats }) => {
    const statCards = [
        { title: 'Total Invoices', value: stats.total, icon: Receipt, class: 'primary', subText: 'All generated' },
        { title: 'Paid amounts', value: `₹${stats.paid?.toLocaleString() || 0}`, icon: CheckCircle, class: 'success', subText: 'Fully settled' },
        { title: 'Pending amounts', value: `₹${stats.pending?.toLocaleString() || 0}`, icon: Clock, class: 'warning', subText: 'Awaiting payment' },
        { title: 'Refunded amounts', value: stats.refunded || stats.overdue || 0, icon: AlertCircle, class: 'error', subText: 'Cancelled or Refunded' }
    ];

    return (
        <div className="inv-stats-grid">
            {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="inv-stat-card">
                        <div className={`inv-stat-icon ${card.class}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <p className="inv-stat-label">{card.title}</p>
                            <h3 className="inv-stat-value">{card.value}</h3>
                            <p className="inv-stat-sub">{card.subText}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default InvoiceStats;
