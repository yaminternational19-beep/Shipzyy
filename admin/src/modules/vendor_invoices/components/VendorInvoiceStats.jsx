import React from 'react';
import { Receipt, IndianRupee, Users, TrendingUp } from 'lucide-react';
import '../../invoices/components/InvoiceStats.css';

const VendorInvoiceStats = ({ stats }) => {
    const statCards = [
        { 
            title: 'Lifetime Earnings', 
            value: `₹${stats.lifetimeEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, 
            icon: IndianRupee, 
            class: 'success', 
            subText: 'Across all invoices' 
        },
        { 
            title: 'Total Invoices', 
            value: stats.total || '0', 
            icon: Receipt, 
            class: 'primary', 
            subText: 'Fulfilled orders' 
        },
        { 
            title: 'Active Customers', 
            value: stats.uniqueCustomers || '0', 
            icon: Users, 
            class: 'warning', 
            subText: 'Unique buyers' 
        },
        { 
            title: 'Avg. Payout', 
            value: `₹${stats.avgPayout?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, 
            icon: TrendingUp, 
            class: 'error', 
            subText: 'Per generated invoice' 
        }
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

export default VendorInvoiceStats;
