import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Users2, ShoppingBag, Clock, Package, MessageSquare,
    Calendar, BarChart3, TrendingUp, Filter, ArrowLeft,
    CreditCard, PackageSearch, Ticket, IndianRupee, ChevronRight
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { getVendorDashboardData } from '../../../api/vendor_dashboard.api';
import { exportDashboardToPDF } from '../services/dashboard_export.service';
import './VendorDashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, subText, icon: Icon, color, loading, sparkline }) => {
    return (
        <div className="dash-stat-card">
            <div className="dash-stat-header">
                <div className="dash-stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={22} />
                </div>
                {sparkline && !loading && (
                    <div className="sparkline-container">
                        <ResponsiveContainer width="100%" height={40}>
                            <LineChart data={sparkline.map((v, i) => ({ value: v, id: i }))}>
                                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
            <div className="dash-stat-body">
                {loading ? <div className="skeleton" style={{ height: '32px', width: '80%' }}></div> : <h3 className="dash-stat-value">{value}</h3>}
                <p className="dash-stat-subtext">{subText}</p>
            </div>
        </div>
    );
};

const VendorOwnerDashboard = forwardRef((props, ref) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('7days'); // 7days, weekly, monthly, yearly, custom
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    const [stats, setStats] = useState({});
    const [revenueAnalytics, setRevenueAnalytics] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [inventoryAlerts, setInventoryAlerts] = useState([]);
    const [feedback, setFeedback] = useState({});

    useImperativeHandle(ref, () => ({
        exportReport: () => {
            exportDashboardToPDF({
                stats,
                revenueAnalytics,
                recentOrders,
                topProducts,
                inventoryAlerts,
                period: viewMode
            });
        }
    }));

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = {
                period: viewMode,
                year: selectedYear,
                month: selectedMonth,
                week: selectedWeek,
                startDate: customRange.start,
                endDate: customRange.end
            };
            const res = await getVendorDashboardData(null, params);
            if (res.success) {
                setStats(res.data.stats || {});
                setRevenueAnalytics(res.data.revenueAnalytics || []);
                setRecentOrders(res.data.recentOrders || []);
                setTopProducts(res.data.topProducts || []);
                setInventoryAlerts(res.data.inventoryAlerts || []);
                setFeedback(res.data.feedback || {});
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [viewMode, selectedYear, selectedMonth, selectedWeek]);

    const handleApplyCustom = () => {
        if (customRange.start && customRange.end) {
            fetchDashboardData();
        }
    };

    const renderChart = () => {
        if (loading) return <div className="skeleton" style={{ height: '300px' }}></div>;
        if (!revenueAnalytics.length) return <div className="no-data-msg">No data available for this period</div>;

        const commonProps = {
            margin: { top: 10, right: 30, left: 10, bottom: 0 },
            data: revenueAnalytics
        };

        const renderLegend = () => (
            <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
        );

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                return (
                    <div className="custom-chart-tooltip">
                        <p className="tooltip-label">{label}</p>
                        {payload.map((entry, index) => (
                            <div key={index} className="tooltip-item" style={{ color: entry.color }}>
                                <span className="dot" style={{ backgroundColor: entry.color }}></span>
                                <span className="name">{entry.name}:</span>
                                <span className="value">{entry.name === 'Revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}</span>
                            </div>
                        ))}
                    </div>
                );
            }
            return null;
        };

        switch (viewMode) {
            case '7days':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            {renderLegend()}
                            <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="products" name="Products" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#f59e0b' }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'weekly':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            {renderLegend()}
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
                            <Bar yAxisId="right" dataKey="products" name="Products" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'monthly':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                            {renderLegend()}
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" stackId="a" />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#10b981" stackId="b" />
                            <Bar yAxisId="right" dataKey="products" name="Products" fill="#f59e0b" stackId="b" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'yearly':
            case 'custom':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart {...commonProps}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            {renderLegend()}
                            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
                            <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" fill="transparent" />
                            <Area yAxisId="right" type="monotone" dataKey="products" name="Products" stroke="#f59e0b" fill="transparent" strokeDasharray="4 4" />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <div className="vendor-dashboard">

            <div className="vendor-stats-grid">
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/staff')}>
                    <StatCard title="Active Staff" value={stats.staff?.active || 0} subText={`${stats.staff?.total || 0} total members`} icon={Users2} color="#6366f1" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/staff')}>
                    <StatCard title="Inactive Staff" value={stats.staff?.inactive || 0} subText="Requires activation" icon={Users} color="#94a3b8" loading={loading} />
                </div>
                <StatCard
                    title="Weekly Revenue"
                    value={`₹${parseFloat(stats.revenue?.weekly || 0).toLocaleString()}`}
                    subText="Trend (Last 7 Days)"
                    icon={IndianRupee}
                    color="#10b981"
                    loading={loading}
                    sparkline={stats.revenue?.sparkline}
                />
                <StatCard title="Monthly Revenue" value={`₹${parseFloat(stats.revenue?.monthly || 0).toLocaleString()}`} subText="Past 30 days" icon={CreditCard} color="#059669" loading={loading} />
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                    <StatCard title="Total Products" value={stats.products?.total || 0} subText="Live in store" icon={Package} color="#8b5cf6" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-orders')}>
                    <StatCard title="Total Orders" value={stats.orders?.total || 0} subText="Lifetime volume" icon={ShoppingBag} color="#f59e0b" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-orders')}>
                    <StatCard title="Pending Orders" value={stats.orders?.pending || 0} subText={`${stats.orders?.highPriority || 0} high priority`} icon={Clock} color="#ef4444" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-reviews')}>
                    <StatCard title="Total Reviews" value={stats.reviews?.total || 0} subText={`${stats.reviews?.avg || 0} Avg Rating`} icon={MessageSquare} color="#ec4899" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                    <StatCard title="Low Stock" value={stats.lowStock?.count || 0} subText="Alert items" icon={PackageSearch} color="#dc2626" loading={loading} />
                </div>
                <StatCard title="Voucher Usage" value={stats.voucherUsage?.value || "18%"} subText="Of total orders" icon={Ticket} color="#2563eb" loading={loading} />
            </div>

            <div className="vendor-content-grid vendor-grid-2-1">
                <div className="dash-card">
                    <div className="dash-card-header">
                        <div className="header-top">
                            <h4>Revenue Performance</h4>
                            <div className="analytics-tabs" style={{ marginLeft: 'auto' }}>
                                {[
                                    { id: '7days', label: '7D', icon: Clock },
                                    { id: 'weekly', label: 'Weekly', icon: BarChart3 },
                                    { id: 'monthly', label: 'Monthly', icon: Calendar },
                                    { id: 'yearly', label: 'Yearly', icon: TrendingUp },
                                    { id: 'custom', label: 'Custom', icon: Filter }
                                ].map(mode => (
                                    <button key={mode.id} className={`tab-btn ${viewMode === mode.id ? 'active' : ''}`} onClick={() => setViewMode(mode.id)}>
                                        <mode.icon size={14} /><span>{mode.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {viewMode !== '7days' && (
                            <div className="filter-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px', width: '100%' }}>
                                {(viewMode === 'weekly' || viewMode === 'monthly' || viewMode === 'yearly') && (
                                    <div className="filter-input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Year</label>
                                        <input
                                            type="number"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            style={{ width: '80px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', background: '#f8fafc' }}
                                        />
                                    </div>
                                )}
                                {viewMode === 'weekly' && (
                                    <div className="filter-input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Week</label>
                                        <input
                                            type="number" min="1" max="53"
                                            value={selectedWeek}
                                            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                            style={{ width: '60px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', background: '#f8fafc' }}
                                        />
                                    </div>
                                )}
                                {viewMode === 'monthly' && (
                                    <div className="filter-input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Month</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                            style={{ width: '90px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', background: '#f8fafc' }}
                                        >
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                )}
                                {viewMode === 'custom' && (
                                    <div className="custom-range-inputs" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', background: '#f8fafc' }} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>to</span>
                                        <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', background: '#f8fafc' }} />
                                        <button onClick={handleApplyCustom} style={{ padding: '4px 12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Apply</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="dash-card-body chart-body">
                        {renderChart()}
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <div className="header-top">
                            <h4>Customer Feedback</h4>
                            <span className="view-all-link" onClick={() => navigate('/vendor-reviews')}>View All</span>
                        </div>
                    </div>
                    <div className="dash-card-body" style={{ cursor: 'pointer', padding: '0' }} onClick={() => navigate('/vendor-reviews')}>
                        <div className="vendor-rating-box" style={{ flexDirection: 'row', gap: '40px', padding: '30px', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                <div className="rating-big-value">{feedback.avgRating || 0}</div>
                                <div className="rating-stars-group">★★★★★</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>{feedback.totalReviews} Reviews</div>
                            </div>
                            <div className="rating-bar-stack" style={{ flex: 1 }}>
                                {(feedback.ratings || []).map((r, i) => (
                                    <div key={i} className="rating-row">
                                        <span className="rating-num">{r.star}</span>
                                        <div className="rating-progress-bg">
                                            <div className="rating-progress-fill" style={{ width: `${r.percentage}%` }}></div>
                                        </div>
                                        <span className="rating-num" style={{ width: '35px', textAlign: 'right' }}>{r.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vendor-content-grid vendor-grid-1-1">
                <div className="dash-card">
                    <div className="dash-card-header">
                        <div className="header-top">
                            <h4>Inventory Alerts</h4>
                            <span className="view-all-link" onClick={() => navigate('/vendor-products')}>View All</span>
                        </div>
                    </div>
                    <div className="dash-card-body" style={{ padding: '0' }}>
                        {inventoryAlerts.map((alert, i) => (
                            <div key={i} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                                <div className="alert-info"><span className="alert-name">{alert.name}</span><span className="alert-stock">{alert.stock} left</span></div>
                                <div className="alert-bar-bg"><div className="alert-bar-fill" style={{ width: `${Math.min((alert.stock / 50) * 100, 100)}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <div className="header-top">
                            <h4>Recent Orders</h4>
                            <span className="view-all-link" onClick={() => navigate('/vendor-orders')}>View All</span>
                        </div>
                    </div>
                    <div className="dash-card-body" style={{ padding: '0' }}>
                        <table className="dash-table">
                            <thead><tr><th>Order</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>{!loading && recentOrders.map((ord, i) => (
                                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(`/vendor-orders`)}>
                                    <td><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ord.id}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ord.time}</div></td>
                                    <td style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ord.amt}</td>
                                    <td><span className={`status-pill ${ord.status}`}>{ord.label}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="dash-card" style={{ marginTop: '24px' }}>
                <div className="dash-card-header">
                    <div className="header-top">
                        <h4>Top Selling Products</h4>
                        <span className="view-all-link" onClick={() => navigate('/vendor-products')}>View All</span>
                    </div>
                </div>
                <div className="dash-card-body" style={{ padding: '0' }}>
                    <table className="dash-table">
                        <thead><tr><th>Product Details</th><th>Category</th><th>Stock</th><th>Total Revenue</th><th>Status</th></tr></thead>
                        <tbody>{topProducts.map((prod, i) => (
                            <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                                <td><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{prod.name}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{prod.sku}</div></td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{prod.cat}</td>
                                <td><span style={{ fontWeight: 700, color: prod.stock < 10 ? '#ef4444' : '#1e293b' }}>{prod.stock}</span></td>
                                <td style={{ fontWeight: 800 }}>{prod.rev}</td>
                                <td><span className="status-pill success">Active</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default VendorOwnerDashboard;
