import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Package,
    AlertTriangle,
    UserPlus,
    CreditCard,
    Settings,
    MoreHorizontal,
    Clock,
    Eye,
    EyeOff,
    Trash2
} from 'lucide-react';
import '../styles/Notifications.css';
import Toast from '../components/common/Toast/Toast';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('unread');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Sample Data with paths
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New Order Received',
            description: 'Order #ORD-8273 has been placed by John Doe and is pending confirmation.',
            time: '2 mins ago',
            type: 'order',
            unread: true,
            path: '/orders',
            icon: <Package size={22} />
        },
        {
            id: 2,
            title: 'System Maintenance',
            description: 'Scheduled maintenance will occur on Sunday, Feb 23 from 2:00 AM to 4:00 AM EST.',
            time: '1 hour ago',
            type: 'system',
            unread: true,
            path: '/settings',
            icon: <Settings size={22} />
        },
        {
            id: 3,
            title: 'New Vendor Application',
            description: 'Fresh Foods Ltd has applied to join the platform as a Premium Vendor.',
            time: '3 hours ago',
            type: 'success',
            unread: true,
            path: '/vendors',
            icon: <UserPlus size={22} />
        },
        {
            id: 4,
            title: 'Payment Failed',
            description: 'The payout for Vendor #V-912 failed due to incorrect bank details.',
            time: '5 hours ago',
            type: 'danger',
            unread: false,
            path: '/vendors',
            icon: <CreditCard size={22} />
        },
        {
            id: 5,
            title: 'Inventory Alert',
            description: 'Low stock warning for "Organic Apples" (Remaining: 5 units).',
            time: 'Yesterday',
            type: 'system',
            unread: false,
            path: '/products',
            icon: <AlertTriangle size={22} />
        },
        {
            id: 6,
            title: 'New Category Added',
            description: 'A new category "Electronics" has been created by the Admin.',
            time: '2 days ago',
            type: 'success',
            unread: false,
            path: '/categories',
            icon: <Package size={22} />
        },
        {
            id: 7,
            title: 'New Rider Registered',
            description: 'Rider "Mike Johnson" is awaiting document verification.',
            time: '3 days ago',
            type: 'order',
            unread: false,
            path: '/riders',
            icon: <UserPlus size={22} />
        },
        {
            id: 8,
            title: 'Customer Feedback',
            description: 'A new 5-star review has been posted for Order #ORD-1122.',
            time: '4 days ago',
            type: 'success',
            unread: false,
            path: '/customers',
            icon: <Bell size={22} />
        }
    ]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const unreadCount = notifications ? notifications.filter(n => n.unread).length : 0;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
        showToast("All notifications marked as read", "success");
    };

    const handleToggleReadStatus = (id, e) => {
        if (e) e.stopPropagation();
        const notification = notifications.find(n => n.id === id);
        const newStatus = !notification.unread;
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: newStatus } : n
        ));
        showToast(`Notification marked as ${newStatus ? 'unread' : 'read'}`, "info");
    };

    const handleDeleteNotification = (id, e) => {
        if (e) e.stopPropagation();
        setNotifications(notifications.filter(n => n.id !== id));
        showToast("Notification deleted successfully", "success");
    };

    const handleViewDetails = (path, id) => {
        // Automatically mark as read when viewing details
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ));
        navigate(path);
    };

    const filteredNotifications = notifications ? notifications.filter(n => {
        if (activeTab === 'unread') return n.unread;
        return true;
    }) : [];

    return (
        <div className="notifications-container">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <header className="notifications-header">
                <div className="notifications-title">
                    <h1>Notifications</h1>
                    <p>Stay updated with the latest activity across the platform</p>
                </div>
                <div className="notifications-actions">
                    <button className="btn-mark-all" onClick={markAllRead}>
                        <CheckCheck size={18} />
                        Mark all as read
                    </button>
                </div>
            </header>

            <div className="notif-tabs">
                <div
                    className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                    <span className="notif-count">{unreadCount}</span>
                </div>
                <div
                    className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Notifications
                    <span className="notif-count">{notifications.length || 0}</span>
                </div>
            </div>

            <div className="notif-list">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`notif-item ${notif.unread ? 'unread' : ''}`}
                            style={{ cursor: 'default' }}
                        >
                            {notif.unread && <div className="unread-dot" />}
                            <div className={`notif-icon-wrapper ${notif.type}`}>
                                {notif.icon}
                            </div>
                            <div className="notif-content">
                                <div className="notif-top">
                                    <h3>{notif.title}</h3>
                                    <div className="notif-time">
                                        <Clock size={12} style={{ marginRight: '4px' }} />
                                        {notif.time}
                                    </div>
                                </div>
                                <p className="notif-desc">{notif.description}</p>
                                <div className="notif-footer">
                                    <button
                                        className="notif-action-btn"
                                        style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(notif.path, notif.id); }}
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="notif-action-btn"
                                        style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        onClick={(e) => handleToggleReadStatus(notif.id, e)}
                                    >
                                        {notif.unread ? <><Eye size={14} /> Mark as Read</> : <><EyeOff size={14} /> Mark as Unread</>}
                                    </button>
                                    <button
                                        className="notif-action-btn"
                                        style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#f1f5f9',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            color: '#94a3b8'
                        }}>
                            <Bell size={40} />
                        </div>
                        <h3 style={{ color: '#111827', margin: 0 }}>No notifications found</h3>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>
                            You're all caught up! There are no {activeTab === 'unread' ? 'unread' : ''} notifications.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
