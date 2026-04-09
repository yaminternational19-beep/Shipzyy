import React, { useState } from 'react';
import ProductForm from './ProductForm';
import BulkUploadForm from './BulkUploadForm';
import { ChevronLeft } from 'lucide-react';
import Toast from '../../../../components/common/Toast/Toast';
import './AddProduct.css';

import { createProductAPI } from '../../../../api/product.api';

const AddProduct = ({ onSave, categories = {}, brands = [], onBack, initialData = null }) => {
    const [mode, setMode] = useState(initialData ? 'single' : 'single'); // Default to single if editing
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleSingleSave = () => {
        onSave();
    };

    const handleBulkSave = async (products) => {
        showToast('Processing bulk upload... please wait', 'success');
        const summary = { total: products.length, saved: 0, failed: 0 };
        const failedProductsList = [];

        // Check if any product has images. 
        // If NO images are present in the whole batch, we use the high-speed Bulk JSON API.
        const hasAnyImages = products.some(p => p.images && p.images.length > 0);

        if (!hasAnyImages) {
            try {
                // High-speed JSON Bulk Upload
                const res = await bulkCreateProductAPI(products);
                const { saved, failed, errors } = res.data.data;
                summary.saved = saved;
                summary.failed = failed;

                if (failed > 0) {
                    errors.forEach(err => {
                        failedProductsList.push({
                            ...products[err.index],
                            uploadError: err.error
                        });
                    });
                }
            } catch (error) {
                showToast('Bulk API Error: ' + (error.response?.data?.message || 'Server Error'), 'error');
                return products;
            }
        } else {
            // Concurrent Upload (5 at a time) for products with images
            const CONCURRENCY = 5;
            for (let i = 0; i < products.length; i += CONCURRENCY) {
                const chunk = products.slice(i, i + CONCURRENCY);
                await Promise.all(chunk.map(async (data) => {
                    try {
                        const payloadData = new FormData();
                        payloadData.append('category_id', data.category_id ?? '');
                        payloadData.append('subcategory_id', data.subcategory_id ?? '');
                        payloadData.append('name', data.name || '');
                        payloadData.append('description', data.description || '');
                        
                        const isOtherBrand = data.brand_id === 'Other';
                        payloadData.append('brand_id', isOtherBrand ? '' : (data.brand_id ?? ''));
                        payloadData.append('custom_brand', isOtherBrand ? (data.custom_brand || '') : '');

                        const specData = { details: data.specification ? data.specification.split('\n') : [] };
                        payloadData.append('specification', JSON.stringify(specData));

                        payloadData.append('country_of_origin', data.country_of_origin || '');
                        payloadData.append('manufacture_date', data.manufacture_date || '');
                        payloadData.append('expiry_date', data.expiry_date || '');
                        
                        const isReturnAllowed = data.return_allowed === true || String(data.return_allowed).toLowerCase() === 'true' || Number(data.return_allowed) === 1;
                        payloadData.append('return_allowed', isReturnAllowed ? 'true' : 'false');
                        payloadData.append('return_days', isReturnAllowed ? (Number(data.return_days) || 0) : 0);

                        payloadData.append('variant_name', data.variant_name || 'Standard');
                        payloadData.append('unit', data.unit || 'PCS');
                        payloadData.append('color', data.color || 'N/A');
                        payloadData.append('sku', data.sku || '');
                        payloadData.append('mrp', Number(data.mrp) || 0);
                        payloadData.append('sale_price', Number(data.sale_price) || 0);
                        payloadData.append('discount_value', Number(data.discount_value) || 0);
                        payloadData.append('discount_type', 'Percent');
                        payloadData.append('stock', Number(data.stock) || 0);
                        payloadData.append('min_order', Number(data.min_order) || 1);
                        payloadData.append('low_stock_alert', Number(data.low_stock_alert) || 5);

                        if (data.images && data.images.length > 0) {
                            data.images.forEach(img => {
                                if (img.file) payloadData.append('images', img.file);
                            });
                        }

                        await createProductAPI(payloadData);
                        summary.saved++;
                    } catch (error) {
                        summary.failed++;
                        failedProductsList.push({
                            ...data,
                            uploadError: error.response?.data?.message || 'Backend Error'
                        });
                    }
                }));
            }
        }

        if (summary.failed === 0) {
            showToast(`Success! All ${summary.total} products added.`, 'success');
            onSave();
            return [];
        } else {
            showToast(`${summary.saved} Saved, ${summary.failed} Failed. Fix errors and retry.`, 'error');
            return failedProductsList;
        }
    };

    return (
        <div className="add-product-wrapper">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}


            <header className="add-product-header">
                <div className="header-text">
                    <h1>{initialData ? 'Edit Product' : 'Add New Products'}</h1>
                    <p>{initialData ? `Updating ${initialData.name}` : 'Manage single entries or bulk inventory imports effortlessly.'}</p>
                </div>
                {!initialData && (
                    <div className="mode-tabs">
                        <button
                            className={`mode-tab ${mode === 'single' ? 'active' : ''}`}
                            onClick={() => setMode('single')}
                        >
                            Single Product
                        </button>
                        <button
                            className={`mode-tab ${mode === 'bulk' ? 'active' : ''}`}
                            onClick={() => setMode('bulk')}
                        >
                            Bulk Upload
                        </button>
                    </div>
                )}
            </header>

            <main className="add-product-main">
                {mode === 'single' ? (
                    <ProductForm
                        key={initialData?.id || 'new-product'}
                        onSave={handleSingleSave}
                        showToast={showToast}
                        categories={categories}
                        brands={brands}
                        initialData={initialData}
                    />
                ) : (
                    <BulkUploadForm
                        onSaveAll={handleBulkSave}
                        showToast={showToast}
                        categories={categories}
                        brands={brands}
                    />
                )}
            </main>
        </div>
    );
};

export default AddProduct;
