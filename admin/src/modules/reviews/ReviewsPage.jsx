import React, { useState } from 'react';
import { Star, MessageSquare, Filter, Search, Calendar, X, Trash2, CheckSquare, Square, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Toast from '../../components/common/Toast/Toast';
import ExportActions from '../../components/common/ExportActions';
import { exportReviewsToPDF, exportReviewsToExcel } from './services/review_export.service';
import * as adminReviewsService from './services/admin_reviews.service';
import { getVendorsApi } from '../../api/vendor.api';
import './Reviews.css';

const ReviewsPage = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [selectedRows, setSelectedRows] = useState([]);

    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1, limit: 10, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false
    });
    const [filters, setFilters] = useState({ search: '', vendor: '', rating: '', fromDate: '', toDate: '' });
    const [vendorOptions, setVendorOptions] = useState([]);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const data = await adminReviewsService.fetchAdminReviews({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                vendor: filters.vendor,
                rating: filters.rating,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            });
            setReviews(data.records || []);
            setPagination(prev => ({
                ...prev,
                totalRecords: data.pagination.totalRecords,
                totalPages: data.pagination.totalPages,
                hasNextPage: data.pagination.page < data.pagination.totalPages,
                hasPrevPage: data.pagination.page > 1
            }));
        } catch (error) {
            showToast(error.message || "Failed to load admin reviews", "error");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadReviews();
    }, [pagination.page, filters.vendor, filters.rating]);

    React.useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await getVendorsApi({ limit: 1000 });
                if (response.data && response.data.data) {
                    setVendorOptions(response.data.data.records || response.data.data);
                }
            } catch (error) {
                console.error("Failed to load vendors for filter:", error);
            }
        };
        fetchVendors();
    }, []);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(reviews.map(r => r.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };

    const handleExport = (type) => {
        const dataToExport = reviews.filter(r => selectedRows.includes(r.id));
        
        if (dataToExport.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportReviewsToPDF(dataToExport);
            } else if (type === 'excel') {
                exportReviewsToExcel(dataToExport);
            }
            showToast(`${type.toUpperCase()} exported successfully!`, 'success');
        } catch (error) {
            showToast('Failed to generate export file', 'error');
        }
    };

    const handleDelete = (id) => {
        showToast(`Review #${id} has been deleted.`, 'success');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star 
                key={index} 
                size={16} 
                className={index < rating ? "star-icon filled" : "star-icon"} 
            />
        ));
    };

    const allSelected = reviews.length > 0 && selectedRows.length === reviews.length;

    return (
        <div className="management-module">
            {/* Header */}
            <div className="module-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Global Feedbacks
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Monitor and moderate customer reviews across all vendors
                    </p>
                </div>
            </div>

            {/* Unified Wrapper */}
            <div className="o-table-wrapper" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Search & Filters */}
                <div className="order-filters-container" style={{ borderBottom: '1px solid #f1f5f9', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="o-search">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search order, customer or product..." 
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <select 
                            className="filter-select"
                            value={filters.vendor}
                            onChange={(e) => setFilter('vendor', e.target.value)}
                        >
                            <option value="">All Vendors</option>
                            {vendorOptions.map(v => (
                                <option key={v.id} value={v.id}>{v.business_name || v.name}</option>
                            ))}
                        </select>
                        
                        <select 
                            className="filter-select"
                            value={filters.rating}
                            onChange={(e) => setFilter('rating', e.target.value)}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        
                        <div className="date-inputs">
                            <Calendar size={16} color="#94a3b8" />
                            <input 
                                type="date" 
                                value={filters.fromDate}
                                onChange={(e) => setFilter('fromDate', e.target.value)}
                            />
                            <span style={{ color: '#cbd5e1' }}>-</span>
                            <input 
                                type="date" 
                                value={filters.toDate}
                                onChange={(e) => setFilter('toDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                        <ExportActions 
                            selectedCount={selectedRows.length} 
                            onExport={showToast} 
                            onDownload={handleExport} 
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="o-table-container">
                    <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 12px', textAlign: 'left', width: '40px' }}>
                                    <div onClick={() => handleSelectAll(!allSelected)} style={{ cursor: 'pointer' }}>
                                        {allSelected 
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PRODUCT</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ORDER & VENDOR</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>VENDOR CONTACT</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CUSTOMER</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RATING</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>REVIEW</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>DATE</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
                                        <p style={{ color: '#64748b' }}>Loading feedbacks...</p>
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No global reviews found.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(review => (
                                <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div onClick={() => handleSelectOne(review.id)} style={{ cursor: 'pointer' }}>
                                            {selectedRows.includes(review.id)
                                                ? <CheckSquare size={17} color="var(--primary-color)" />
                                                : <Square size={17} color="#94a3b8" />
                                            }
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <img src={review.product_image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{review.product_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.75rem' }}>#{review.order_number}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{review.vendor_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700 }}>{review.vendor_country_code || "+91"} {review.vendor_phone}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{review.vendor_email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                            {review.profile_image ? (
                                                <img src={review.profile_image} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                                    {review.customer_name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{review.customer_name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{review.customer_country_code || "+91"} {review.customer_phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div className="rating-stars" style={{ justifyContent: 'center' }}>
                                            {renderStars(review.rating)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', maxWidth: '250px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{review.review}</p>
                                            {review.images && review.images.length > 0 && (
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    {review.images.map((img, i) => (
                                                        <img key={i} src={img} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.85rem' }}>{review.created_at || review.createdDate}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => handleDelete(review.id)} className="icon-btn delete" title="Delete Review">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {pagination.totalRecords > 0 && (
                    <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc', padding: '16px' }}>
                        <span className="c-pagination-info">
                            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalRecords)}–{Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} feedbacks
                        </span>
                        <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="c-page-btn" disabled={!pagination.hasPrevPage || isLoading} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                                {pagination.page} / {pagination.totalPages || 1}
                            </span>
                            <button className="c-page-btn" disabled={!pagination.hasNextPage || isLoading} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            
            <style>{`
                .management-module { padding: 0; }
                .dashboard-table tr:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default ReviewsPage;
