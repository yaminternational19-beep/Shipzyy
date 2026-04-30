import React, { useState } from 'react';
import { Star, MessageSquare, Filter, Search, Calendar, X, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Toast from '../../components/common/Toast/Toast';
import ExportActions from '../../components/common/ExportActions';
import { exportReviewsToPDF, exportReviewsToExcel } from './services/review_export.service';
import * as reviewsService from './services/vendor_reviews.service';
import { getSafeImage } from '../../utils/imageUtils';
import '../reviews/Reviews.css';

const VendorReviewsPage = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [selectedRows, setSelectedRows] = useState([]);
    
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [filters, setFilters] = useState({ search: '', rating: '', fromDate: '', toDate: '' });

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const data = await reviewsService.fetchReviews({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
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
            showToast(error.message || "Failed to load reviews", "error");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadReviews();
    }, [pagination.page, filters.rating]);

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

    const handleExportDownload = (type) => {
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
        <div className="vendor-orders-module management-module">
            {/* Header */}
            <div className="orders-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Product Reviews
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage customer feedback for items belonging to your company only
                    </p>
                </div>
            </div>

            {/* Integrated Section (Filters + Table Merged) */}
            <div className="o-table-wrapper" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Filter Bar */}
                <div className="order-filters-container" style={{ borderBottom: '1px solid #f1f5f9', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="o-search">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search product or customer..." 
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
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
                            onDownload={handleExportDownload} 
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
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Image</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Order & Product</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rating</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Review Detail</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Review Images</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
                                        <p style={{ color: '#64748b' }}>Loading reviews...</p>
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No reviews found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(review => (
                                <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div onClick={() => handleSelectOne(review.id)} style={{ cursor: 'pointer' }}>
                                            {selectedRows.includes(review.id)
                                                ? <CheckSquare size={17} color="var(--primary-color)" />
                                                : <Square size={17} color="#94a3b8" />
                                            }
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <img 
                                            src={getSafeImage(review.product_image, 'PRODUCT')} 
                                            alt="Product" 
                                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                                        />
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.75rem' }}>#{review.order_number}</span>
                                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.2 }}>{review.product_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                            {review.profile_image ? (
                                                <img src={getSafeImage(review.profile_image, 'USER')} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
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
                                    <td style={{ padding: '16px 12px', textAlign: 'center', maxWidth: '300px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', textAlign: 'center' }}>{review.review}</p>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '120px', margin: '0 auto' }}>
                                            {review.images && review.images.length > 0 ? review.images.map((img, i) => (
                                                <img key={i} src={getSafeImage(img, 'PRODUCT')} alt="review" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                            )) : (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Images</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                                        {review.created_at || review.createdDate}
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalRecords > 0 && (
                    <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc', padding: '16px' }}>
                        <span className="c-pagination-info">
                            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalRecords)}–{Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} reviews
                        </span>
                        <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className="c-page-btn"
                                disabled={!pagination.hasPrevPage || isLoading}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                                {pagination.page} / {pagination.totalPages || 1}
                            </span>
                            <button
                                className="c-page-btn"
                                disabled={!pagination.hasNextPage || isLoading}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
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
                .vendor-orders-module { padding: 0; }
                .dashboard-table tr:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default VendorReviewsPage;
