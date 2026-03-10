import React, { useState, useMemo, useEffect } from 'react';
import VendorProductStats from './components/VendorProductStats';
import VendorProductFilters from './components/VendorProductFilters';
import VendorProductList from './components/VendorProductList';
import AddProduct from './components/AddProduct/AddProduct';
import ProductView from './components/ProductView';
import Toast from '../../components/common/Toast/Toast';
import { Plus, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import './VendorProducts.css';

const VendorProductsPage = () => {
    // Configuration Data
    const CATEGORIES_DATA = {
        'Electronics': ['Audio', 'Mobile', 'Laptop', 'Accessories', 'Camera'],
        'Fashion': ['Footwear', 'Men Wear', 'Women Wear', 'Kids Wear', 'Watches'],
        'Groceries': ['Dairy', 'Fruits', 'Vegetables', 'Beverages', 'Snacks'],
        'Furniture': ['Chairs', 'Tables', 'Beds', 'Decor']
    };

    const BRANDS_DATA = ['Sony', 'Samsung', 'Nike', 'Amul', 'Apple', 'Logitech', 'Adidas'];

    const MOCK_PRODUCTS = [
        {
            id: 'PROD-101',
            itemId: 'ITEM-8829',
            name: 'Sony WH-1000XM5 Wireless Headphones',
            brand: 'Sony',
            category: 'Electronics',
            subCategory: 'Audio',
            MRP: 34990,
            salePrice: 29990,
            discountValue: 14,
            discountType: 'Percentage',
            stock: 45,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
            isApproved: true,
            createdAt: '2024-02-10',
            manufactureDate: '2023-11-15',
            expiryDate: '2026-11-15',
            description: 'Industry leading noise canceling headphones',
            unit: 'PCS'
        },
        {
            id: 'PROD-102',
            itemId: 'ITEM-1102',
            name: 'Nike Air Max 270 React',
            brand: 'Nike',
            category: 'Fashion',
            subCategory: 'Footwear',
            MRP: 12995,
            salePrice: 8995,
            discountValue: 4000,
            discountType: 'Flat',
            stock: 12,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
            isApproved: true,
            createdAt: '2024-02-12',
            manufactureDate: '2023-08-20',
            expiryDate: '--',
            description: 'Premium sports shoes for daily use',
            unit: 'Pair'
        },
        {
            id: 'PROD-103',
            itemId: 'ITEM-4492',
            name: 'Samsung Galaxy S24 Ultra',
            brand: 'Samsung',
            category: 'Electronics',
            subCategory: 'Mobile',
            MRP: 129999,
            salePrice: 124999,
            discountValue: 5000,
            discountType: 'Flat',
            stock: 3,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop',
            isApproved: false,
            createdAt: '2024-02-15',
            manufactureDate: '2024-01-10',
            expiryDate: '2027-01-10',
            description: 'Latest flagship smartphone with AI features',
            unit: 'PCS'
        },
        {
            id: 'PROD-104',
            itemId: 'ITEM-9901',
            name: 'Logitech G Pro X Superlight',
            brand: 'Logitech',
            category: 'Electronics',
            subCategory: 'Accessories',
            MRP: 15995,
            salePrice: 13495,
            discountValue: 15,
            discountType: 'Percentage',
            stock: 0,
            image: 'https://images.unsplash.com/photo-1527698266440-12104e498b76?w=200&h=200&fit=crop',
            isApproved: true,
            createdAt: '2024-01-20',
            manufactureDate: '2023-05-15',
            expiryDate: '--',
            description: 'Ultra-lightweight wireless gaming mouse',
            unit: 'PCS'
        },
        {
            id: 'PROD-105',
            itemId: 'ITEM-2231',
            name: 'Amul Gold Milk 1L',
            brand: 'Amul',
            category: 'Groceries',
            subCategory: 'Dairy',
            MRP: 66,
            salePrice: 64,
            discountValue: 2,
            discountType: 'Flat',
            stock: 150,
            image: 'https://images.unsplash.com/photo-1563636619-e910009355dc?w=200&h=200&fit=crop',
            isApproved: true,
            createdAt: '2024-02-18',
            manufactureDate: '2024-02-18',
            expiryDate: '2024-02-20',
            description: 'Full cream fresh milk',
            unit: 'Litre'
        }
    ];

    // State
    const [products, setProducts] = useState(MOCK_PRODUCTS.map(p => ({
        ...p,
        isActive: Math.random() > 0.3
    })));

    const [selectedRows, setSelectedRows] = useState([]);
    const [showAddPage, setShowAddPage] = useState(false);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10
    });

    const [filters, setFilters] = useState({
        search: '',
        brand: '',
        category: '',
        subCategory: '',
        stock: '',
        status: ''
    });

    // Stats Calculation
    const stats = {
        total: products.length,
        live: products.filter(p => p.isActive).length,
        pending: products.filter(p => !p.isApproved && !p.rejectionReason).length,
        outOfStock: products.filter(p => p.stock === 0).length
    };

    // Toast Handler
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const searchMatch = !filters.search ||
                p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.brand.toLowerCase().includes(filters.search.toLowerCase());

            const brandMatch = !filters.brand || p.brand === filters.brand;
            const categoryMatch = !filters.category || p.category === filters.category;
            const subCategoryMatch = !filters.subCategory || p.subCategory === filters.subCategory;
            const stockMatch = !filters.stock ||
                (filters.stock === 'high' && p.stock > 10) ||
                (filters.stock === 'low' && p.stock > 0 && p.stock <= 10) ||
                (filters.stock === 'out' && p.stock === 0);

            const statusMatch = !filters.status ||
                (filters.status === 'approved' && p.isApproved) ||
                (filters.status === 'pending' && !p.isApproved && !p.rejectionReason) ||
                (filters.status === 'rejected' && p.rejectionReason);

            return searchMatch && brandMatch && categoryMatch && subCategoryMatch && stockMatch && statusMatch;
        });
    }, [products, filters]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return filteredProducts.slice(start, start + pagination.limit);
    }, [filteredProducts, pagination]);

    const totalPages = Math.ceil(filteredProducts.length / pagination.limit);

    // Handlers
    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(r => r !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(paginatedData.map(p => p.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = (message, type) => {
        showToast(message, type);
    };

    const handleToggleStatus = (id) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const handleView = (product) => setViewingProduct(product);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowAddPage(true);
    };

    const handleBack = () => {
        setShowAddPage(false);
        setEditingProduct(null);
    };

    return (
        <div className="products-module management-module">
            {viewingProduct && (
                <ProductView
                    product={viewingProduct}
                    onClose={() => setViewingProduct(null)}
                />
            )}

            {!showAddPage ? (
                <>
                    {/* Header */}
                    <div className="products-header">
                        <div>
                            <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                                My Products
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                                Manage your product inventory and track approval status
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-primary" onClick={() => setShowAddPage(true)}>
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <VendorProductStats stats={stats} />

                    {/* Unified Section */}
                    <div className="products-table-section">
                        <VendorProductFilters
                            filters={filters}
                            setFilters={setFilters}
                            categories={CATEGORIES_DATA}
                            brands={BRANDS_DATA}
                            selectedCount={selectedRows.length}
                            onExport={handleExport}
                            onClear={() => setFilters({
                                search: '', brand: '', category: '', subCategory: '', stock: '', status: ''
                            })}
                        />

                        <VendorProductList
                            products={paginatedData}
                            selectedRows={selectedRows}
                            onSelectRow={handleSelectRow}
                            onSelectAll={handleSelectAll}
                            onView={handleView}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                        />

                        {/* Pagination */}
                        <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                            <span className="c-pagination-info">
                                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, filteredProducts.length)}–{Math.min(pagination.page * pagination.limit, filteredProducts.length)} of {filteredProducts.length} products
                            </span>
                            <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    className="c-page-btn"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                                    {pagination.page} / {totalPages || 1}
                                </span>
                                <button
                                    className="c-page-btn"
                                    disabled={pagination.page === totalPages || totalPages === 0}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Add Product Header */}
                    <div className="products-header">
                        <button className="btn btn-secondary" onClick={handleBack}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>

                    <AddProduct
                        categories={CATEGORIES_DATA}
                        brands={BRANDS_DATA}
                        onBack={handleBack}
                        initialData={editingProduct}
                        onSave={(newProducts) => {
                            if (editingProduct) {
                                setProducts(prev => prev.map(p =>
                                    p.id === editingProduct.id ? { ...newProducts[0], id: p.id, isActive: p.isActive } : p
                                ));
                            } else {
                                setProducts(prev => [...newProducts.map(p => ({ ...p, isActive: true })), ...prev]);
                            }
                            handleBack();
                        }}
                    />
                </>
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

export default VendorProductsPage;
