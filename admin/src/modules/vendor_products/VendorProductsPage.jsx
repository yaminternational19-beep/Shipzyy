import React, { useState, useMemo, useEffect } from 'react';
import VendorProductStats from './components/VendorProductStats';
import VendorProductFilters from './components/VendorProductFilters';
import VendorProductList from './components/VendorProductList';
import AddProduct from './components/AddProduct/AddProduct';
import ProductView from './components/ProductView';
import Toast from '../../components/common/Toast/Toast';
import { Plus, ChevronLeft, ChevronRight, ArrowLeft, Trash2, Download, FileSpreadsheet } from 'lucide-react';
import './VendorProducts.css';
import { fetchProducts, toggleProductLiveAPI, updateStockAPI, deleteProductAPI } from '../../api/product.api';
import { exportVendorProductsToPDF, exportVendorProductsToExcel } from './services/export.service';
import { getCategoriesApi } from '../../api/categories.api';
import { getBrandsApi } from '../../api/brands.api';
import * as XLSX from 'xlsx';

const VendorProductsPage = () => {
    // State
    const [products, setProducts] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [allCategories, setAllCategories] = useState({});
    const [allBrands, setAllBrands] = useState([]);
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

    const loadProductsList = async () => {
        try {
            const apiParams = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                category_id: filters.category, 
                subcategory_id: filters.subCategory,
                brand_id: filters.brand,
                stock_status: filters.stock,
                // Status Mapping: 
                // 'approved' in UI check both approval_status=APPROVED and is_live=true
                // 'pending' in UI checks approval_status=PENDING
                is_live: filters.status === 'approved' ? 'true' : undefined,
                approval_status: filters.status === 'pending' ? 'PENDING' : (filters.status === 'rejected' ? 'REJECTED' : undefined)
            };

            const res = await fetchProducts(apiParams);

            let remoteData = [];
            let paginationData = { totalRecords: 0 };

            if (res.data?.data?.records) {
                remoteData = res.data.data.records;
                paginationData = res.data.data.pagination || res.data.data.meta || paginationData;
            } else if (Array.isArray(res.data?.data)) {
                remoteData = res.data.data;
            } else if (res.data?.records) {
                remoteData = res.data.records;
                paginationData = res.data.pagination || res.data.meta || paginationData;
            }

            const mappedProducts = remoteData.map(prod => ({
                id: prod.id,
                variant_id: prod.variant_id || prod.inventory_info?.variant_id, // Multiple fallbacks to ensure ID is captured
                itemId: prod.slug || `ITEM-${prod.id}`,
                name: prod.name,
                brand: prod.brand_name || 'N/A',
                category: prod.category_name || 'N/A',
                subCategory: prod.subcategory_name || '--',
                MRP: prod.inventory_info?.min_mrp || 0,
                salePrice: prod.inventory_info?.min_price || 0,
                discountValue: prod.inventory_info?.max_discount || 0,
                discountType: prod.inventory_info?.discount_type || 'Percent',
                image: prod.primary_image || 'https://via.placeholder.com/200',
                isApproved: prod.approval_status === 'APPROVED',
                rejectionReason: prod.rejection_reason,
                isActive: prod.is_live === 1,
                createdAt: prod.created_at,
                stock: prod.inventory_info?.total_stock || 0,
                
                description: prod.description || '',
                country_of_origin: prod.country_of_origin || '',
                category_id: prod.category_id,
                subcategory_id: prod.subcategory_id,
                brand_id: prod.brand_id || (prod.custom_brand ? 'Other' : ''),
                custom_brand: prod.custom_brand || '',
                
                mrp: prod.inventory_info?.min_mrp || 0,
                sale_price: prod.inventory_info?.min_price || 0,
                discount_value: prod.inventory_info?.max_discount || 0,
                unit: prod.inventory_info?.unit || 'PCS',
                variant_name: prod.inventory_info?.variant_name || 'Standard',
                color: prod.inventory_info?.color || 'N/A',
                sku: prod.inventory_info?.sku || '',
                specification: prod.specification || '',
                low_stock_alert: prod.inventory_info?.low_stock_alert || 5,
                min_order: prod.inventory_info?.min_order || 1,
                return_allowed: prod.return_allowed === 1,
                return_days: prod.return_days || 0,
                manufacture_date: prod.manufacture_date || '',
                expiry_date: prod.expiry_date || '',
                manufactureDate: prod.manufacture_date || '',
                expiryDate: prod.expiry_date || '',
                images: (prod.all_images || []).map(img => img.image_url || img)
            }));

            setProducts(mappedProducts);
            setTotalRecords(paginationData.totalRecords || mappedProducts.length);
        } catch (error) {
            console.error("GET Products Error:", error);
        }
    };

    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    getCategoriesApi(),
                    getBrandsApi()
                ]);
                const cats = catRes.data?.data?.records || catRes.data?.records || [];
                const brands = brandRes.data?.data?.records || brandRes.data?.records || [];
                
                const catObj = {};
                cats.forEach(c => catObj[c.name] = []);
                setAllCategories(catObj);
                setAllBrands(brands.map(b => b.name));
            } catch (err) {
                console.error("Fetch Filters Data Error:", err);
            }
        };
        fetchFiltersData();
    }, []);

    useEffect(() => {
        // Reset to page 1 whenever filters change, except when filters themselves are being reset
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProductsList();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [pagination.page, pagination.limit, filters]);

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

    const totalPages = Math.ceil(totalRecords / pagination.limit);

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
            setSelectedRows(products.map(p => p.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportVendorProductsToPDF(products);
        } else if (format === 'excel') {
            exportVendorProductsToExcel(products);
        }
    };

    const handleToggleStatus = async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newLiveStatus = !product.isActive;

        try {
            await toggleProductLiveAPI(id, newLiveStatus);
            setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: newLiveStatus } : p));
            showToast(`Product is now ${newLiveStatus ? 'Live' : 'Hidden'}`, 'success');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update live status';
            showToast(errorMsg, 'error');
            console.error("Toggle Live Error:", error);
        }
    };

    const handleStockUpdate = (product) => {
        showToast(`Stock management for ${product.name} coming soon!`, 'info');
        console.log("Manage stock for:", product);
    };

    const handleQuickStockUpdate = async (product, newTotal) => {
        const oldStock = Number(product.stock) || 0;
        if (newTotal === oldStock) return;

        const delta = newTotal - oldStock;
        const change_type = delta > 0 ? 'ADD' : 'REMOVE';
        const absQty = Math.abs(delta);

        try {
            await updateStockAPI({
                product_id: product.id,
                variant_id: product.variant_id,
                change_type: change_type,
                quantity: absQty,
                note: `Stock updated from dashboard (Quick Edit: ${oldStock} -> ${newTotal})`
            });

            // Update local state for immediate feedback
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newTotal } : p));
            showToast('Stock updated successfully', 'success');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update stock';
            showToast(msg, 'error');
            console.error("Stock Update Error:", error);
        }
    };

    const handleView = (product) => setViewingProduct(product);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowAddPage(true);
    };

    const handleDelete = async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        if (!window.confirm(`Are you sure you want to delete "${product.name}"? This will permanently remove it from the store and delete all variant/image data.`)) {
            return;
        }

        try {
            await deleteProductAPI(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            showToast('Product deleted successfully', 'success');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete product';
            showToast(msg, 'error');
            console.error("Delete Product Error:", error);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "category_id", "subcategory_id", "brand_id", "custom_brand", "name", "description",
            "country_of_origin", "manufacture_date", "expiry_date", "return_allowed", "return_days",
            "variant_name", "unit", "color", "stock", "mrp", "sale_price", "discount_type", "discount_value", "low_stock_alert"
        ];
        
        const sampleData = [
            {
                category_id: 1,
                subcategory_id: "",
                brand_id: "",
                custom_brand: "Example Brand",
                name: "Product Name",
                description: "Product details here",
                country_of_origin: "India",
                manufacture_date: "2024-01-01",
                expiry_date: "2025-01-01",
                return_allowed: 1,
                return_days: 7,
                variant_name: "Default",
                unit: "kg",
                color: "Red",
                stock: 100,
                mrp: 500,
                sale_price: 450,
                discount_type: "Percent",
                discount_value: 10,
                low_stock_alert: 10
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Import Template");
        
        // Final Download
        XLSX.writeFile(workbook, "Shipzzy_Bulk_Product_Template.xlsx");
        showToast("Bulk Excel Template Downloaded!", "success");
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
                            <button 
                                className="btn btn-secondary" 
                                style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={handleDownloadTemplate}
                            >
                                <FileSpreadsheet size={18} color="#10b981" /> Download Template
                            </button>
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
                            categories={allCategories}
                            brands={allBrands}
                            selectedCount={selectedRows.length}
                            onExport={showToast}
                            onDownload={handleExport}
                            onClear={() => setFilters({
                                search: '', brand: '', category: '', subCategory: '', stock: '', status: ''
                            })}
                        />

                        <VendorProductList
                            products={products}
                            totalFilteredCount={totalRecords}
                            selectedRows={selectedRows}
                            onSelectRow={handleSelectRow}
                            onSelectAll={handleSelectAll}
                            onView={handleView}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            onUpdateStock={handleQuickStockUpdate}
                            onDelete={handleDelete}
                        />

                        {/* Pagination */}
                        <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                            <span className="c-pagination-info">
                                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, totalRecords)}–{Math.min(pagination.page * pagination.limit, totalRecords)} of {totalRecords} products
                            </span>
                            <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span>Rows:</span>
                                    <select 
                                        value={pagination.limit} 
                                        onChange={(e) => setPagination(prev => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
                                        style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        onBack={handleBack}
                        initialData={editingProduct}
                        onSave={() => {
                            handleBack();
                            loadProductsList();
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
