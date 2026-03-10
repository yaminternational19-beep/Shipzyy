import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ShoppingBag,
    Package,
    CreditCard,
    AlertCircle,
    TrendingUp,
    Clock,
    Star,
    ChevronRight,
    ArrowLeft,
    MoreHorizontal,
    Edit3,
    Eye,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3
} from 'lucide-react';
import './VendorDashboard.css';

const StatCard = ({ title, value, subText, color, icon: Icon, trend, trendType }) => (
    <div className="dash-stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ background: `${color}15`, color: color, padding: '8px', borderRadius: '10px' }}>
                <Icon size={18} />
            </div>
            {trend && (
                <span className={`dash-stat-trend ${trendType === 'up' ? 'trend-up' : 'trend-down'}`}>
                    {trend}
                    {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
            )}
        </div>
        <span className="dash-stat-label">{title}</span>
        <h3 className="dash-stat-value" style={{ fontSize: '1.5rem' }}>{value}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{subText}</p>
    </div>
);

const VendorOwnerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const vendor = location.state?.vendor || { business: 'Vendor Dashboard', name: 'Partner' };

    return (
        <div className="vendor-dashboard">
            {isSuperAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <button
                        onClick={() => navigate('/vendors')}
                        className="icon-btn-sm"
                        style={{ background: 'white', border: '1px solid var(--border-color)', width: '40px', height: '40px' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>{vendor.business}</h1>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                            Performance metrics for {vendor.name}
                        </p>
                    </div>
                </div>
            )}

            <div className="vendor-stats-grid">
                <StatCard title="Orders Today" value="32" trend="+12%" trendType="up" subText="24 completed" color="#6366f1" icon={ShoppingBag} />
                <StatCard title="Pending" value="12" subText="8 high priority" color="#f59e0b" icon={Clock} />
                <StatCard title="Revenue" value="$4,280" trend="+8%" trendType="up" subText="Past 24 hours" color="#10b981" icon={CreditCard} />
                <StatCard title="Voucher Usage" value="18%" trend="-2%" trendType="down" subText="Active campaigns" color="#8b5cf6" icon={TrendingUp} />
                <StatCard title="Low Stock" value="5 Items" subText="Requires attention" color="#ef4444" icon={AlertCircle} />
            </div>

            <div className="vendor-content-grid vendor-grid-2-1">
                <div className="dash-card">
                    <div className="dash-card-header">
                        <div>
                            <h4>Revenue Analytics</h4>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Weekly performance tracking</p>
                        </div>
                        <div className="dash-tabs" style={{ padding: '2px' }}>
                            <button className="tab-btn active" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Week</button>
                            <button className="tab-btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Month</button>
                        </div>
                    </div>
                    <div className="dash-card-body">
                        <div className="vendor-chart-placeholder">
                            <div style={{ textAlign: 'center' }}>
                                <BarChart3 size={40} color="#e2e8f0" style={{ marginBottom: '12px' }} />
                                <div>Revenue Visualization Placeholder</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Recent Orders</h4>
                        <span className="text-btn" style={{ fontSize: '0.75rem' }}>View All</span>
                    </div>
                    <div style={{ padding: '0' }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: '#10211', time: '10:15 AM', amt: '$36.50', status: 'pending', label: 'Processing' },
                                    { id: '#10210', time: '09:42 AM', amt: '$124.20', status: 'success', label: 'Delivered' },
                                    { id: '#10209', time: 'Yesterday', amt: '$88.00', status: 'success', label: 'Delivered' },
                                    { id: '#10208', time: 'Yesterday', amt: '$42.15', status: 'error', label: 'Cancelled' },
                                ].map((ord, i) => (
                                    <tr key={ord.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{ord.id}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ord.time}</div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{ord.amt}</td>
                                        <td><span className={`badge-outline ${ord.status}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{ord.label}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="vendor-content-grid vendor-grid-1-1">
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Inventory Alerts</h4>
                        <button className="text-btn primary" style={{ fontSize: '0.75rem' }}>Restock All</button>
                    </div>
                    <div style={{ padding: '0' }}>
                        <table className="dash-table">
                            <tbody>
                                {[
                                    { name: 'Garlic Powder', stock: 3, unit: 'units left' },
                                    { name: 'Black Pepper', stock: 6, unit: 'units left' },
                                    { name: 'Red Chilli Flakes', stock: 8, unit: 'units left' }
                                ].map((item, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div className="vendor-prod-row">
                                                <div className="vendor-prod-thumb"></div>
                                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="stock-alert">
                                                <AlertCircle size={14} /> {item.stock} {item.unit}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="text-btn primary" style={{ fontSize: '0.8rem' }}>Order</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Customer Feedback</h4>
                        <MoreHorizontal size={18} color="#94a3b8" />
                    </div>
                    <div className="dash-card-body">
                        <div className="vendor-rating-box">
                            <div>
                                <div className="rating-big-value">4.9</div>
                                <div className="rating-stars-group">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="#f59e0b" />)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Based on 6,291 reviews</div>
                            </div>
                            <div className="rating-bar-stack">
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div key={star} className="rating-row">
                                        <span className="rating-num">{star}</span>
                                        <div className="rating-progress-bg">
                                            <div
                                                className="rating-progress-fill"
                                                style={{
                                                    background: star >= 4 ? '#10b981' : star >= 3 ? '#f59e0b' : '#ef4444',
                                                    width: star === 5 ? '88%' : star === 4 ? '8%' : '2%'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>Top Selling Products</h4>
                    <span className="text-btn" style={{ fontSize: '0.75rem' }}>Full Inventory</span>
                </div>
                <div style={{ padding: '0' }}>
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Sales Revenue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Turmeric Powder Premium', cat: 'Spices', stock: 54, rev: '$2,310', status: 'success' },
                                { name: 'Ground Cumin Special', cat: 'Spices', stock: 88, rev: '$1,520', status: 'success' }
                            ].map((prod, i) => (
                                <tr key={i}>
                                    <td>
                                        <div className="vendor-prod-row">
                                            <div className="vendor-prod-thumb"></div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{prod.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SKU: VND-PRD-00{i}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ fontWeight: 600 }}>{prod.cat}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={14} color="#10b981" />
                                            <span style={{ fontWeight: 600 }}>{prod.stock}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{prod.rev}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="icon-btn-sm" title="Edit"><Edit3 size={16} /></button>
                                            <button className="icon-btn-sm" title="View Analytics"><Eye size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorOwnerDashboard;
