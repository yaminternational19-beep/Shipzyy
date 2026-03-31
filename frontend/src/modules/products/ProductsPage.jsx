import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductStats from './components/ProductStats';
import ProductFilters from './components/ProductFilters';
import ProductList from './components/ProductList';
import ProductView from './components/ProductView';
import Toast from '../../components/common/Toast/Toast';
import { getProductsApi, updateProductStatusApi } from '../../api/admin_products.api';
import { exportProductsToPDF, exportProductsToExcel } from './services/export.service';
import './Products.css';

const ProductsPage = () => {
    // State
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        vendor: '',
        brand: '',
        category: '',
        subCategory: '',
        isApproved: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [viewingProductId, setViewingProductId] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Fetch Data from API
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const statusMap = {
                'true': 'APPROVED',
                'false': 'PENDING',
                'rejected': 'REJECTED'
            };

            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch,
                vendor: filters.vendor,
                brand: filters.brand,
                category: filters.category,
                subCategory: filters.subCategory,
                status: statusMap[filters.isApproved] || filters.isApproved
            };

            const response = await getProductsApi(params);
            if (response.data.success) {
                const { records, stats: apiStats, pagination: apiPagination } = response.data.data;
                
                // Map API records to component format
                const mappedProducts = records.map(item => ({
                    id: item.id,
                    itemId: item.slug,
                    name: item.name,
                    brand: item.brandName || item.custom_brand || 'N/A',
                    vendorCompanyName: item.BusinessName,
                    vendorName: item.vendorName,
                    vendorPhone: `${item.vendorCountryCode} ${item.vendorMobile}`,
                    vendorEmail: item.vendorEmail,
                    category: item.categoryName,
                    subCategory: item.subCategoryName,
                    MRP: parseFloat(item.mrp),
                    Sale: parseFloat(item.sale_price),
                    stockQuantity: parseInt(item.stock),
                    image: item.primaryImage,
                    isApproved: item.approval_status === 'APPROVED',
                    rejectionReason: item.rejection_reason,
                    rejectedAt: item.rejected_at,
                    raisedDate: item.created_at,
                    actionDate: (item.approved_at && item.approved_at !== '-') ? item.approved_at : (item.rejected_at && item.rejected_at !== '-') ? item.rejected_at : null
                }));

                setProducts(mappedProducts);
                setStats({
                    total: apiStats.totalCount,
                    active: parseInt(apiStats.approvedCount),
                    pending: parseInt(apiStats.pendingCount),
                    rejected: parseInt(apiStats.rejectedCount)
                });
                setPagination(prev => ({
                    ...prev,
                    total: apiPagination.totalRecords,
                    totalPages: apiPagination.totalPages
                }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, debouncedSearch, filters.vendor, filters.brand, filters.category, filters.subCategory, filters.isApproved]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFilterUpdate = (updateFn) => {
        setFilters(updateFn);
        setPagination(prev => ({ ...prev, page: 1 }));
    };


    // Handlers
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleAction = async (action, product) => {
        if (action === 'view' || action === 'view-details') {
            setViewingProductId(product.id);
            return;
        }

        if (action === 'approve') {
            try {
                await updateProductStatusApi(product.id, { status: 'APPROVED' });
                showToast(`Product "${product.name}" approved successfully!`);
                fetchProducts();
            } catch (err) {
                showToast(err.response?.data?.message || 'Failed to approve product', 'error');
            }
        } else if (action === 'reject') {
            const reason = prompt(`Please enter a rejection reason for "${product.name}":`);
            if (reason) {
                try {
                    await updateProductStatusApi(product.id, { 
                        status: 'REJECTED', 
                        rejection_reason: reason 
                    });
                    showToast(`Product "${product.name}" rejected successfully.`, 'error');
                    fetchProducts();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to reject product', 'error');
                }
            }
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(products.map(p => p.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportProductsToPDF(products);
        } else if (format === 'excel') {
            exportProductsToExcel(products);
        }
    };

    return (
        <div className="products-module management-module">
            {/* Header */}
            <div className="products-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Product Approvals</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Review and manage product listings from your vendors
                    </p>
                </div>
            </div>

            {/* Stats */}
            <ProductStats stats={stats} />

            {/* Combined Filters and Table Section */}
            <div className="products-table-section">
                <ProductFilters
                    filters={filters}
                    setFilters={handleFilterUpdate}
                    selectedCount={selectedRows.length}
                    onExport={showToast}
                    onDownload={handleExport}
                    onClear={() => handleFilterUpdate({
                        search: '', vendor: '', brand: '', category: '', subCategory: '', isApproved: ''
                    })}
                />

                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderTop: 'none' }}>
                        <div className="spinner" style={{ marginBottom: '16px', margin: '0 auto 16px' }}></div>
                        <div style={{ color: '#64748b', fontWeight: 500 }}>Fetching latest products...</div>
                    </div>
                ) : (
                    <ProductList
                        products={products}
                        onAction={handleAction}
                        selectedRows={selectedRows}
                        onSelectRow={handleSelectRow}
                        onSelectAll={handleSelectAll}
                    />
                )}

                {/* Pagination Controls */}
                <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                    <span className="c-pagination-info">
                        Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                    </span>
                    <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                            {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {viewingProductId && (
                <ProductView 
                    productId={viewingProductId} 
                    onClose={() => setViewingProductId(null)} 
                />
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default ProductsPage;
