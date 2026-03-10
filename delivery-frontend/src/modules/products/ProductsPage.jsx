import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductStats from './components/ProductStats';
import ProductFilters from './components/ProductFilters';
import ProductList from './components/ProductList';
import Toast from '../../components/common/Toast/Toast';
import './Products.css';

// Mock Data Generation with better demo images
const MOCK_PRODUCTS = Array.from({ length: 50 }, (_, i) => ({
    id: `PROD-${1000 + i}`,
    itemId: `ITEM-${1000 + i}`,
    name: i % 3 === 0 ? `Premium Wireless Headphones ${i}` : i % 3 === 1 ? `Organic Green Tea ${i}` : `Smart Fitness Watch ${i}`,
    productFullName: i % 3 === 0 ? `Premium Wireless Noise Cancelling Headphones v${i}` : i % 3 === 1 ? `100% Organic Himalayan Green Tea ${i}` : `Smart Fitness Track Pro Series ${i}`,
    brand: i % 4 === 0 ? 'Sony' : i % 4 === 1 ? 'Organic India' : i % 4 === 2 ? 'Noise' : 'Samsung',
    vendor: `VEN-${100 + (i % 5)}`,
    vendorName: i % 5 === 0 ? 'John Doe' : 'Jane Smith',
    vendorCompanyName: i % 5 === 0 ? 'TechSolution Ltd' : i % 5 === 1 ? 'GroceryMart' : 'FashionHub Inc',
    vendorPhone: i % 5 === 0 ? '+91 98765 43210' : '+91 87654 32109',
    vendorEmail: i % 5 === 0 ? 'john.doe@techsolution.com' : 'jane.smith@grocerymart.in',
    category: i % 3 === 0 ? 'Electronics' : i % 3 === 1 ? 'Groceries' : 'Fashion',
    subCategory: i % 3 === 0 ? (i % 2 === 0 ? 'Mobile' : 'Laptop') : (i % 3 === 1 ? 'Drinks' : 'Shoes'),
    MRP: (i + 1) * 150 + 99,
    // Using a more reliable image source for demo
    image: `https://images.unsplash.com/photo-${[
        '1505740420928-5e560c06d30e', // Headphones
        '1592318763191-3485607062ec', // Tea
        '1523275335684-37898b6baf30', // Watch
        '1542291026-7eec264c27ff', // Shoes
        '1526170375885-4d8ec6477614', // Camera
        '1503602642637-0cf0299b66ba'  // Product
    ][i % 6]}?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80`,
    isApproved: i % 10 < 7, // 70% approved
    rejectionReason: i % 10 === 8 ? 'Incorrect image format provided' : i % 10 === 9 ? 'Price exceeds range' : null,
    raisedDate: new Date(Date.now() - 86400000 * (i + 5)).toISOString().split('T')[0],
    actionDate: (i % 10 < 8 || i % 10 >= 8) ? new Date(Date.now() - 86400000 * i).toISOString().split('T')[0] : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
}));

const ProductsPage = () => {
    // State
    const [products, setProducts] = useState([]);
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

    // Simulate Fetching Data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setProducts(MOCK_PRODUCTS);
            setLoading(false);
        }, 800);
    }, []);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchMatch = !filters.search ||
                product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.vendorCompanyName.toLowerCase().includes(filters.search.toLowerCase());

            const vendorMatch = !filters.vendor || product.vendorCompanyName.includes(filters.vendor);
            const brandMatch = !filters.brand || product.brand === filters.brand;
            const categoryMatch = !filters.category || product.category === filters.category;
            const subCategoryMatch = !filters.subCategory || product.subCategory === filters.subCategory;

            const statusMatch = filters.isApproved === '' ||
                (filters.isApproved === 'true' && product.isApproved) ||
                (filters.isApproved === 'false' && !product.isApproved && !product.rejectionReason) ||
                (filters.isApproved === 'rejected' && product.rejectionReason);

            return searchMatch && vendorMatch && brandMatch && categoryMatch && subCategoryMatch && statusMatch;
        });
    }, [products, filters]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, pagination.page, pagination.limit]);

    // Update Pagination Stats
    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            total: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / prev.limit)
        }));
        if (pagination.page > Math.ceil(filteredProducts.length / pagination.limit) && filteredProducts.length > 0) {
            setPagination(prev => ({ ...prev, page: 1 }));
        }
    }, [filteredProducts.length, pagination.limit]);


    // Handlers
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleAction = (action, product) => {
        if (action === 'approve') {
            const updatedProducts = products.map(p =>
                p.id === product.id ? { ...p, isApproved: true, rejectionReason: null, actionDate: new Date().toISOString().split('T')[0] } : p
            );
            setProducts(updatedProducts);
            showToast(`Product "${product.name}" approved successfully!`);
        } else if (action === 'reject') {
            const reason = prompt(`Please enter a rejection reason for "${product.name}":`);
            if (reason) {
                const updatedProducts = products.map(p =>
                    p.id === product.id ? { ...p, isApproved: false, rejectionReason: reason, actionDate: new Date().toISOString().split('T')[0] } : p
                );
                setProducts(updatedProducts);
                showToast(`Product "${product.name}" rejected.`, 'error');
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
            setSelectedRows(paginatedData.map(p => p.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = (format) => {
        const dataToExport = selectedRows.length > 0
            ? products.filter(p => selectedRows.includes(p.id))
            : filteredProducts;

        showToast(`Exporting ${dataToExport.length} items to ${format.toUpperCase()}...`);
    };

    // Calculate Stats
    const stats = {
        total: products.length,
        active: products.filter(p => p.isApproved).length,
        pending: products.filter(p => !p.isApproved && !p.rejectionReason).length,
        outOfStock: products.filter(p => p.rejectionReason).length
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
                    setFilters={setFilters}
                    selectedCount={selectedRows.length}
                    onExport={handleExport}
                    onClear={() => setFilters({
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
                        products={paginatedData}
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
