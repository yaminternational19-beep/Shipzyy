import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Users2, Users, ShoppingBag, MessageSquare, CreditCard, 
    ArrowLeft, Calendar, Filter, Clock, BarChart3, TrendingUp,
    Package, Ticket, PackageSearch, IndianRupee
} from 'lucide-react';
import { getVendorDashboardData } from '../../../api/vendor_dashboard.api';
import './VendorDashboard.css';

const StatCard = ({ title, value, subText, icon: Icon, color, loading }) => (
    <div className="dash-stat-card">
        <div className="dash-stat-header">
            <div className="dash-stat-icon" style={{ backgroundColor: `${color}15` }}>
                <Icon size={22} color={color} />
            </div>
        </div>
        <div>
            <h3 className="dash-stat-value">{loading ? '...' : value}</h3>
            <p>{title}</p>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{subText}</span>
        </div>
    </div>
);

const VendorOwnerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('userRole');
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const vendor = location.state?.vendor || { business: 'Vendor Dashboard', name: 'Partner' };

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    
    // Analytics State
    const getCurrentWeekNum = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
    };

    const [viewMode, setViewMode] = useState('7days'); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNum());
    const [customRange, setCustomRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchDashboardData();
    }, [isSuperAdmin, vendor.id, viewMode, selectedYear, selectedMonth, selectedWeek]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const params = { 
                period: viewMode,
                year: selectedYear,
                month: selectedMonth,
                week: selectedWeek,
                startDate: customRange.start,
                endDate: customRange.end
            };
            const res = await getVendorDashboardData(isSuperAdmin ? vendor.id : null, params);
            if (res.success) setData(res.data);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCustom = () => {
        if (customRange.start && customRange.end) fetchDashboardData();
    };

    const handleDrillDown = (label) => {
        if (viewMode === 'yearly') {
            const monthMap = { "Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12 };
            if (monthMap[label]) {
                setSelectedMonth(monthMap[label]);
                setViewMode('monthly');
            }
        } else if (viewMode === 'monthly') {
            const weekNum = parseInt(label.replace('Week ', ''));
            if (!isNaN(weekNum)) {
                setSelectedWeek(weekNum);
                setViewMode('weekly');
            }
        }
    };

    const stats = data?.stats || {};
    const recentOrders = data?.recentOrders || [];
    const inventoryAlerts = data?.inventoryAlerts || [];
    const feedback = data?.feedback || {};
    const topProducts = data?.topProducts || [];
    const revenueAnalytics = data?.revenueAnalytics || [];

    const maxRev = Math.max(...revenueAnalytics.map(d => d.revenue || 0), 1000);

    const getPathData = () => {
        if (revenueAnalytics.length === 0) return "";
        const points = revenueAnalytics.map((d, i) => ({
            x: (i / (revenueAnalytics.length - 1)) * 100,
            y: 100 - ((d.revenue / maxRev) * 75)
        }));
        if (points.length < 2) return "";
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            d += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    const getAreaPathData = () => {
        const path = getPathData();
        if (!path) return "";
        return `${path} L 100,100 L 0,100 Z`;
    };

    return (
        <div className="vendor-dashboard">
            {isSuperAdmin && (
                <div style={{ marginBottom: '16px' }}>
                    <button className="icon-btn-sm" onClick={() => navigate('/vendors')}><ArrowLeft size={20} /> Back to Vendors</button>
                </div>
            )}

            <div className="vendor-stats-grid">
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-staff')}>
                    <StatCard title="Active Staff" value={stats.staff?.active || 0} subText={`${stats.staff?.total || 0} total members`} icon={Users2} color="#6366f1" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-staff')}>
                    <StatCard title="Inactive Staff" value={stats.staff?.inactive || 0} subText="Requires activation" icon={Users} color="#94a3b8" loading={loading} />
                </div>
                <StatCard title="Weekly Revenue" value={`₹${parseFloat(stats.revenue?.weekly || 0).toLocaleString()}`} subText="Past 7 days" icon={IndianRupee} color="#10b981" loading={loading} />
                <StatCard title="Monthly Revenue" value={`₹${parseFloat(stats.revenue?.monthly || 0).toLocaleString()}`} subText="Past 30 days" icon={CreditCard} color="#059669" loading={loading} />
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                    <StatCard title="Total Products" value={stats.products?.total || 0} subText="Live in store" icon={Package} color="#8b5cf6" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-orders')}>
                    <StatCard title="Total Orders" value={stats.orders?.total || 0} subText="Lifetime orders" icon={ShoppingBag} color="#f59e0b" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-orders')}>
                    <StatCard title="Pending Orders" value={stats.orders?.pending || 0} subText={`${stats.orders?.highPriority || 0} high priority`} icon={Clock} color="#ef4444" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-reviews')}>
                    <StatCard title="Total Reviews" value={stats.reviews?.total || 0} subText={`${stats.reviews?.avg || 0} avg rating`} icon={MessageSquare} color="#ec4899" loading={loading} />
                </div>
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                    <StatCard title="Low Stock" value={stats.lowStock?.count || 0} subText="Alert items" icon={PackageSearch} color="#dc2626" loading={loading} />
                </div>
                <StatCard title="Voucher Usage" value={stats.voucherUsage?.value || "18%"} subText="Of total orders" icon={Ticket} color="#2563eb" loading={loading} />
            </div>

            <div className="vendor-content-grid vendor-grid-2-1">
                {/* Revenue Card Remains Same */}
                <div className="dash-card">
                    <div className="dash-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <h4>Revenue Performance</h4>
                            <div className="analytics-tabs">
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
                            <div className="filter-action-bar">
                                {(viewMode === 'weekly' || viewMode === 'monthly' || viewMode === 'yearly') && (
                                    <div className="filter-field">
                                        <label>Year</label>
                                        <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ width: '100px' }} />
                                    </div>
                                )}
                                {viewMode === 'weekly' && (
                                    <div className="filter-field">
                                        <label>Week Num</label>
                                        <input type="number" min="1" max="53" value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))} />
                                    </div>
                                )}
                                {viewMode === 'monthly' && (
                                    <div className="filter-field">
                                        <label>Month</label>
                                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                        </select>
                                    </div>
                                )}
                                {viewMode === 'custom' && (
                                    <>
                                        <div className="filter-field"><label>Start</label><input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} /></div>
                                        <div className="filter-field"><label>End</label><input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} /></div>
                                        <button className="apply-btn" onClick={handleApplyCustom}>Apply</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="dash-card-body">
                        {loading ? <div className="skeleton" style={{ height: '200px' }}></div> : (
                            <div className="vendor-chart-container">
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={getAreaPathData()} fill="url(#chartGrad)" />
                                    <path d={getPathData()} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                                    {revenueAnalytics.map((d, i) => {
                                        const x = (i / (revenueAnalytics.length - 1)) * 100;
                                        const y = 100 - ((d.revenue / maxRev) * 75);
                                        return <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#6366f1" strokeWidth="1" className="chart-dot" />;
                                    })}
                                </svg>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                    {revenueAnalytics.map((d, i) => {
                                        const show = revenueAnalytics.length <= 12 || i % Math.ceil(revenueAnalytics.length/8) === 0 || i === revenueAnalytics.length-1;
                                        return (
                                            <div key={i} style={{ textAlign: 'center', cursor: 'pointer', minWidth: '40px' }} onClick={() => handleDrillDown(d.day)}>
                                                <div style={{ fontSize: '0.65rem', color: show ? '#6366f1' : '#94a3b8', fontWeight: 800 }}>{d.day}</div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>₹{d.revenue >= 1000 ? `${(d.revenue/1000).toFixed(1)}k` : Math.round(d.revenue)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header"><h4>Recent Orders</h4><span className="view-all-link" onClick={() => navigate('/vendor-orders')}>View All</span></div>
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

            <div className="vendor-content-grid vendor-grid-1-1">
                <div className="dash-card">
                    <div className="dash-card-header"><h4>Inventory Alerts</h4><span className="view-all-link" onClick={() => navigate('/vendor-products')}>View All</span></div>
                    <div className="dash-card-body" style={{ padding: '0' }}>
                        {inventoryAlerts.map((alert, i) => (
                            <div key={i} className="alert-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                                <div className="alert-info"><span className="alert-name">{alert.name}</span><span className="alert-stock">{alert.stock} left</span></div>
                                <div className="alert-bar-bg"><div className="alert-bar-fill" style={{ width: `${Math.min((alert.stock/20)*100, 100)}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header"><h4>Customer Feedback</h4><span className="view-all-link" onClick={() => navigate('/vendor-reviews')}>View All</span></div>
                    <div className="dash-card-body" style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-reviews')}>
                        <div className="vendor-rating-box">
                            <div style={{ textAlign: 'center' }}><div className="rating-big-value">{feedback.avgRating || 0}</div><div className="rating-stars-group">★★★★★</div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{feedback.totalReviews} Reviews</div></div>
                            <div className="rating-bar-stack">{(feedback.ratings || []).map((r, i) => (
                                <div key={i} className="rating-row"><span className="rating-num">{r.star}</span><div className="rating-progress-bg"><div className="rating-progress-fill" style={{ width: `${r.percentage}%` }}></div></div><span className="rating-num" style={{ width: '30px' }}>{r.percentage}%</span></div>
                            ))}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dash-card" style={{ marginTop: '24px' }}>
                <div className="dash-card-header"><h4>Top Products</h4><span className="view-all-link" onClick={() => navigate('/vendor-products')}>View All</span></div>
                <div className="dash-card-body" style={{ padding: '0' }}>
                    <table className="dash-table">
                        <thead><tr><th>Product Details</th><th>Category</th><th>Stock</th><th>Revenue</th><th>Status</th></tr></thead>
                        <tbody>{topProducts.map((prod, i) => (
                            <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate('/vendor-products')}>
                                <td><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{prod.name}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{prod.sku}</div></td>
                                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{prod.cat}</td>
                                <td><span style={{ fontWeight: 700, color: prod.stock < 10 ? '#ef4444' : '#1e293b' }}>{prod.stock}</span></td>
                                <td style={{ fontWeight: 800 }}>{prod.rev}</td>
                                <td><span className="status-pill success">Live</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorOwnerDashboard;
