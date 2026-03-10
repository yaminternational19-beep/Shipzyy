import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const BrandForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        subCategoryId: '',
        logo: '',
        description: '',
        status: 'Active'
    });
    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        { id: 'CAT001', name: 'Electronics' },
        { id: 'CAT005', name: 'Fashion' }
    ];

    const subCategories = [
        { id: 'SC001', name: 'Mobile Phones', catId: 'CAT001' },
        { id: 'SC002', name: 'Laptops', catId: 'CAT001' },
        { id: 'SC006', name: 'Footwear', catId: 'CAT005' }
    ];

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.logo && initialData.logo.startsWith('data:')) {
                setImagePreview(initialData.logo);
            }
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredSubCats = subCategories.filter(
        sc => !formData.categoryId || sc.catId === formData.categoryId
    );

    return (
        <div className="cat-modal-overlay">
            <div className="cat-modal-card">

                {/* Header */}
                <div className="cat-modal-header">
                    <h3>{initialData ? 'Edit Brand' : 'Add New Brand'}</h3>
                    <button className="icon-btn-sm" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="cat-modal-body">

                        {/* Category */}
                        <div className="cat-form-group">
                            <label>Category</label>
                            <select
                                className="cat-input"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub Category */}
                        <div className="cat-form-group">
                            <label>Sub Category</label>
                            <select
                                className="cat-input"
                                value={formData.subCategoryId}
                                onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                                required
                            >
                                <option value="">Select Sub Category</option>
                                {filteredSubCats.map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Brand Name */}
                        <div className="cat-form-group">
                            <label>Brand Name</label>
                            <input
                                type="text"
                                className="cat-input"
                                placeholder="e.g. Apple, Nike"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="cat-form-group">
                            <label>Brand Logo</label>
                            <div className="cat-upload-zone">
                                {/* Full-zone clickable file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                />
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Logo Preview"
                                        className="cat-upload-preview"
                                    />
                                ) : (
                                    <div className="cat-upload-icon-wrapper">
                                        <Upload size={20} color="var(--primary-color)" />
                                    </div>
                                )}
                                <span className="cat-upload-text">
                                    {imagePreview ? 'Click to change logo' : 'Upload brand logo or icon'}
                                </span>
                                <span className="cat-upload-hint">SVG, PNG, JPG (max 2MB)</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="cat-form-group">
                            <label>Brand Description</label>
                            <textarea
                                className="cat-input"
                                rows="2"
                                placeholder="Brief details about the brand..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Status */}
                        <div className="cat-form-group">
                            <label>Status</label>
                            <div className="cat-status-group">
                                <label className="cat-status-option">
                                    <input
                                        type="radio"
                                        name="brandStatus"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Active
                                </label>
                                <label className="cat-status-option">
                                    <input
                                        type="radio"
                                        name="brandStatus"
                                        value="Inactive"
                                        checked={formData.status === 'Inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Inactive
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="cat-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {initialData ? 'Save Changes' : 'Create Brand'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default BrandForm;
