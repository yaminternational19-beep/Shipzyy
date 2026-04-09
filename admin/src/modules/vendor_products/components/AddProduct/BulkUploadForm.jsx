import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, X, Archive, CheckSquare, Square, ImageIcon } from 'lucide-react';
import { parseExcel } from './ExcelParser';
import productFields from '../../config/fields';
import { getCategoriesApi } from '../../../../api/categories.api';
import { getSubCategoriesApi } from '../../../../api/subcategory.api';
import { getBrandsApi } from '../../../../api/brands.api';

const BulkUploadForm = ({ onSaveAll, showToast }) => {
    // Get all fields flattened for table mapping
    const allFields = Object.values(productFields).flat();

    const createInitialProduct = () => {
        const p = { id: Date.now(), images: [] };
        allFields.forEach(field => {
            p[field.name] = field.type === 'checkbox' ? false : '';
        });
        if (p.hasOwnProperty('min_order') && !p.min_order) p.min_order = '1';
        return p;
    };

    const [subMode, setSubMode] = useState('manual'); // 'manual' | 'csv'
    const [products, setProducts] = useState([createInitialProduct()]);
    const [errors, setErrors] = useState({});
    
    const [rawCategories, setRawCategories] = useState([]);
    const [rawSubCategories, setRawSubCategories] = useState([]);
    const [rawBrands, setRawBrands] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [catRes, subRes, brandRes] = await Promise.all([
                    getCategoriesApi(),
                    getSubCategoriesApi(),
                    getBrandsApi()
                ]);
                
                const cats = catRes.data?.data?.records || catRes.data?.records || catRes.data || [];
                const subs = subRes.data?.data?.records || subRes.data?.records || subRes.data || [];
                const brnds = brandRes.data?.data?.records || brandRes.data?.records || brandRes.data || [];

                setRawCategories(Array.isArray(cats) ? cats : []);
                setRawSubCategories(Array.isArray(subs) ? subs : []);
                setRawBrands(Array.isArray(brnds) ? brnds : []);
            } catch (err) {
                console.error("Failed to load form dropdowns:", err);
            }
        };
        fetchDropdownData();
    }, []);

    const addRow = () => {
        setProducts([...products, createInitialProduct()]);
    };

    const removeRow = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (index, fieldName, value) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [fieldName]: value };

        const target = updated[index];

        // Dependency logic
        if (fieldName === 'category_id') {
            target.subcategory_id = '';
        }

        // Two-way interactive pricing calculation
        if (fieldName === 'mrp' || fieldName === 'discount_value') {
            const mrp = Number(target.mrp) || 0;
            const disc = Number(target.discount_value) || 0;
            target.sale_price = Math.max(0, mrp - (mrp * disc / 100)).toFixed(2);
        } else if (fieldName === 'sale_price') {
            const sale = Number(target.sale_price) || 0;
            const mrp = Number(target.mrp) || 0;
            if (mrp > 0 && sale <= mrp) {
                target.discount_value = Math.max(0, ((mrp - sale) / mrp) * 100).toFixed(2);
            } else {
                target.discount_value = 0;
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

                // Create a record of row keys without asterisks for easier matching
                const cleanRow = {};
                Object.keys(row).forEach(key => {
                    const cleanKey = key.replace(/\*/g, '').trim().toLowerCase();
                    cleanRow[cleanKey] = row[key];
                });

                allFields.forEach(field => {
                    const cleanLabel = field.label.replace(/\*/g, '').trim().toLowerCase();
                    const cleanName = field.name.toLowerCase();
                    
                    // Try matching by cleaned label or name
                    let excelVal = cleanRow[cleanLabel] || cleanRow[cleanName];

                    // Special fuzzy matching for common variants
                    if (!excelVal) {
                        if (cleanLabel.includes('minimum order')) excelVal = cleanRow['minimum order'];
                        if (cleanLabel.includes('mrp')) excelVal = cleanRow['mrp'];
                        if (cleanLabel === 'made in') excelVal = cleanRow['country of origin'];
                    }
                    
                    if (excelVal !== undefined && excelVal !== null) {
                        // Translation from Excel String identifiers back into strictly ID mapped structures
                        if (field.name === 'category_id') {
                            const matched = rawCategories.find(c => c.name.toLowerCase().trim() === String(excelVal).toLowerCase().trim());
                            excelVal = matched ? matched.id : excelVal;
                        }
                        if (field.name === 'subcategory_id') {
                            const matched = rawSubCategories.find(s => s.name.toLowerCase().trim() === String(excelVal).toLowerCase().trim());
                            excelVal = matched ? matched.id : excelVal;
                        }
                        if (field.name === 'brand_id') {
                            const matched = rawBrands.find(b => b.name.toLowerCase().trim() === String(excelVal).toLowerCase().trim());
                            excelVal = matched ? matched.id : excelVal;
                        }
                    }

                    p[field.name] = field.type === 'checkbox' ? (excelVal === 'true' || excelVal === true || excelVal === '1' || excelVal === 1 || String(excelVal).toLowerCase() === 'yes') : (excelVal || '');
                });
                return p;
            });
            setProducts([...products, ...normalized]);
            showToast(`Imported ${normalized.length} products. Verify and confirm.`, 'success');
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
            if ((p.images || []).length === 0) {
                rowErrors['images'] = true;
                isValid = false;
            }

            if (Object.keys(rowErrors).length > 0) {
                newErrors[i] = rowErrors;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleConfirm = async () => {
        if (validateAll()) {
            const survivors = await onSaveAll(products);
            
            if (survivors && survivors.length > 0) {
                // Update table with only failed products (includes error msg)
                setProducts(survivors);
                setErrors({});
            } else {
                // Everything saved
                setProducts([createInitialProduct()]);
                setErrors({});
            }
        } else {
            showToast('Missing Fields: Please fill out all required attributes highlighted in red', 'error');
        }
    };

    const getOptions = (fieldName, product) => {
        if (fieldName === 'category_id') {
            return rawCategories.map(c => ({ value: c.id, label: c.name }));
        }
        if (fieldName === 'subcategory_id') {
            return rawSubCategories
                .filter(s => (s.categoryId || s.category_id) === Number(product.category_id))
                .map(s => ({ value: s.id, label: s.name }));
        }
        if (fieldName === 'brand_id') {
            const mappedBrands = rawBrands.map(b => ({ value: b.id, label: b.name }));
            mappedBrands.push({ value: 'Other', label: 'Other' });
            return mappedBrands;
        }

        const field = allFields.find(f => f.name === fieldName);
        return field?.options || [];
    };

    const renderCellInput = (field, product, index) => {
        const commonProps = {
            value: product[field.name] || '',
            onChange: (e) => updateProduct(index, field.name, field.type === 'checkbox' ? e.target.checked : e.target.value),
            className: errors[index]?.[field.name] ? 'field-error' : '',
            placeholder: field.label + (field.required ? ' *' : ''),
            disabled: field.readOnly || (field.name === 'subcategory_id' && !product.category_id)
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
                        {getOptions(field.name, product).map((opt, i) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <option key={i} value={val}>{lbl}</option>
                            );
                        })}
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
                            <th style={{ minWidth: '150px' }} rowSpan="2">Status / Media</th>
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
                            <tr key={p.id} className={`${errors[i] ? 'row-has-error' : ''} ${p.uploadError ? 'api-error-row' : ''}`}>
                                <td className="row-index sticky-col">{i + 1}</td>
                                <td>
                                    {p.uploadError && (
                                        <div className="row-api-error-alert" title={p.uploadError}>
                                            <X size={12} /> {p.uploadError}
                                        </div>
                                    )}
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
                    <button className="save-all-btn" onClick={handleConfirm}>
                        {products.some(p => p.uploadError) ? 'Retry Failed Products' : 'Confirm & Save All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadForm;


