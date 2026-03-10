import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, X, Archive, CheckSquare, Square, ImageIcon } from 'lucide-react';
import { parseExcel } from './ExcelParser';
import productFields from '../../config/fields';

const BulkUploadForm = ({ onSaveAll, showToast, categories = {}, brands = [] }) => {
    // Get all fields flattened for table mapping
    const allFields = Object.values(productFields).flat();

    const createInitialProduct = () => {
        const p = { id: Date.now(), images: [] };
        allFields.forEach(field => {
            p[field.name] = field.type === 'checkbox' ? false : '';
        });
        if (p.hasOwnProperty('minOrder') && !p.minOrder) p.minOrder = '1';
        return p;
    };

    const [subMode, setSubMode] = useState('manual'); // 'manual' | 'csv'
    const [products, setProducts] = useState([createInitialProduct()]);
    const [errors, setErrors] = useState({});

    const addRow = () => {
        setProducts([...products, createInitialProduct()]);
    };

    const removeRow = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (index, fieldName, value) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [fieldName]: value };

        // Dependency logic
        if (fieldName === 'category') {
            updated[index].subCategory = '';
        }

        // Auto-calculation logic for Selling Price (MIRRORED FROM ProductForm)
        if (['price', 'discountValue', 'discountType'].includes(fieldName) || fieldName === 'price') {
            const { price, discountValue, discountType } = updated[index];
            if (price) {
                let sellingPrice = Number(price);
                // Note: Bulk mode might not have discountType if it's not in fields.js or if it's hardcoded
                // But we should follow fields.js structure.
                if (discountType === 'Percentage' && discountValue) {
                    sellingPrice = price - (price * Number(discountValue) / 100);
                } else if (discountType === 'Flat' && discountValue) {
                    sellingPrice = price - Number(discountValue);
                } else if (!discountType && discountValue) {
                    // Default fallback if discountType is missing but value exists
                    sellingPrice = price - Number(discountValue);
                }
                updated[index].salePrice = Math.max(0, sellingPrice).toFixed(2);
            }
        }

        setProducts(updated);
    };

    const handleImageUpload = (index, e) => {
        const files = Array.from(e.target.files);
        if (products[index].images.length + files.length > 10) {
            showToast('Max 10 images per product', 'error');
            return;
        }
        const updated = [...products];
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            preview: URL.createObjectURL(file)
        }));
        updated[index].images = [...updated[index].images, ...newImages];
        setProducts(updated);
    };

    const removeImage = (prodIndex, imgId) => {
        const updated = [...products];
        updated[prodIndex].images = updated[prodIndex].images.filter(img => img.id !== imgId);
        setProducts(updated);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await parseExcel(file);
            const normalized = data.map((row, idx) => {
                const p = { id: Date.now() + idx, images: [] };
                allFields.forEach(field => {
                    // Simple mapping from excel column names (case insensitive)
                    const excelVal = row[field.label] || row[field.name] || row[field.label.toLowerCase()] || '';
                    p[field.name] = field.type === 'checkbox' ? (excelVal === 'true' || excelVal === true) : excelVal;
                });
                return p;
            });
            setProducts([...products, ...normalized]);
            showToast(`Imported ${normalized.length} products`, 'success');
        } catch (err) {
            showToast('Failed to parse file', 'error');
        }
    };

    const validateAll = () => {
        const newErrors = {};
        let isValid = true;
        if (products.length === 0) {
            showToast('Add at least one product', 'error');
            return false;
        }

        products.forEach((p, i) => {
            const rowErrors = {};
            allFields.forEach(field => {
                if (field.required && !p[field.name]) {
                    rowErrors[field.name] = true;
                    isValid = false;
                }
            });
            if (Object.keys(rowErrors).length > 0) {
                newErrors[i] = rowErrors;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleConfirm = () => {
        if (validateAll()) {
            onSaveAll(products);
            setProducts([]);
            setErrors({});
            showToast('All products saved successfully!', 'success');
        } else {
            showToast('Please correct validation errors', 'error');
        }
    };

    const getOptions = (fieldName, product) => {
        if (fieldName === 'category') return Object.keys(categories);
        if (fieldName === 'subCategory') return categories[product.category] || [];
        if (fieldName === 'brand') return brands;

        const field = allFields.find(f => f.name === fieldName);
        return field?.options || [];
    };

    const renderCellInput = (field, product, index) => {
        const commonProps = {
            value: product[field.name],
            onChange: (e) => updateProduct(index, field.name, field.type === 'checkbox' ? e.target.checked : e.target.value),
            className: errors[index]?.[field.name] ? 'field-error' : '',
            placeholder: field.label + (field.required ? ' *' : ''),
            disabled: field.readOnly || (field.name === 'subCategory' && !product.category)
        };

        if (field.condition) {
            const dependVal = product[field.condition.field];
            if (dependVal !== field.condition.value) return null;
        }

        switch (field.type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">{field.label}</option>
                        {getOptions(field.name, product).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'textarea':
                return <textarea {...commonProps} rows="2" style={{ height: 'auto', minHeight: '40px' }} />;
            case 'checkbox':
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                        <input type="checkbox" checked={product[field.name] || false} onChange={commonProps.onChange} style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: '12px' }}>{field.label}</span>
                    </div>
                );
            default:
                return (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {field.type === 'number' && field.name.toLowerCase().includes('price') && (
                            <span style={{ position: 'absolute', left: '8px', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>$</span>
                        )}
                        <input
                            type={field.type}
                            {...commonProps}
                            style={{ paddingLeft: field.type === 'number' && field.name.toLowerCase().includes('price') ? '20px' : '12px' }}
                        />
                    </div>
                );
        }
    };

    // Grouping fields by section for header
    const sections = Object.keys(productFields);

    return (
        <div className="premium-bulk-panel">
            <style>{`
                .bulk-table-wrapper {
                    overflow-x: auto;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }
                .bulk-table-wrapper::-webkit-scrollbar {
                    height: 10px;
                }
                .bulk-table-wrapper::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                    border: 2px solid white;
                }
                .bulk-table-wrapper::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .bulk-data-table {
                    min-width: 2500px;
                    border-collapse: collapse;
                }
            `}</style>
            <div className="bulk-header-actions">
                <div className="sub-mode-pills">
                    <button
                        className={`pill-btn ${subMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setSubMode('manual')}
                    >
                        Manual Entry
                    </button>
                    <button
                        className={`pill-btn ${subMode === 'csv' ? 'active' : ''}`}
                        onClick={() => setSubMode('csv')}
                    >
                        Excel Import
                    </button>
                </div>
                {subMode === 'csv' && (
                    <div className="quick-import-bar">
                        <Upload size={18} />
                        <input type="file" onChange={handleFileUpload} accept=".csv, .xlsx, .xls" id="csv-input" hidden />
                        <label htmlFor="csv-input">Upload Excel/CSV</label>
                    </div>
                )}
            </div>

            <div className="bulk-table-wrapper">
                <table className="bulk-data-table">
                    <thead>
                        <tr>
                            <th className="sticky-col" rowSpan="2">#</th>
                            <th style={{ minWidth: '150px' }} rowSpan="2">Media</th>
                            {sections.map(section => (
                                <th
                                    key={section}
                                    colSpan={productFields[section].length}
                                    style={{
                                        textAlign: 'center',
                                        background: '#f1f5f9',
                                        borderBottom: '1px solid #e2e8f0',
                                        fontSize: '10px'
                                    }}
                                >
                                    {section.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                </th>
                            ))}
                            <th className="action-col" rowSpan="2"></th>
                        </tr>
                        <tr>
                            {allFields.map(field => (
                                <th key={field.name} style={{ minWidth: field.type === 'textarea' ? '200px' : '140px' }}>
                                    {field.label} {field.required && '*'}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <tr key={p.id} className={errors[i] ? 'row-has-error' : ''}>
                                <td className="row-index sticky-col">{i + 1}</td>
                                <td>
                                    <div className="bulk-image-manager">
                                        <label className="add-img-cell">
                                            <Plus size={16} />
                                            <input type="file" hidden multiple accept="image/*" onChange={(e) => handleImageUpload(i, e)} />
                                        </label>
                                        <div className="img-cell-strip">
                                            {p.images.map((img) => (
                                                <div key={img.id} className="mini-preview">
                                                    <img src={img.preview} alt="" />
                                                    <button onClick={() => removeImage(i, img.id)} className="del-btn"><X size={10} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                {allFields.map(field => (
                                    <td key={field.name}>
                                        {renderCellInput(field, p, i)}
                                    </td>
                                ))}
                                <td className="action-col">
                                    <button className="row-action-btn del" onClick={() => removeRow(p.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="bulk-empty-state">
                        <div className="empty-visual">
                            <Archive size={48} />
                        </div>
                        <h3>No Products Added</h3>
                        <p>Click below to start manual entry or upload an Excel file.</p>
                        <button className="empty-add-btn" onClick={addRow}>
                            <Plus size={18} /> Add Your First Row
                        </button>
                    </div>
                )}
            </div>

            <div className="bulk-panel-footer">
                {products.length > 0 && (
                    <button className="add-row-btn-secondary" onClick={addRow}>
                        <Plus size={18} /> Add Another Row
                    </button>
                )}
                <div className="footer-right-group">
                    <button className="save-all-btn" onClick={handleConfirm}>Confirm & Save All</button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadForm;
