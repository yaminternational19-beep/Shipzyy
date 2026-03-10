import React, { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';

const SubCategoryForm = ({ initialData, categories = [], onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        image: '',
        imageFile: null,
        description: '',
        status: 'Active'
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.image && initialData.image.startsWith('data:')) {
                setImagePreview(initialData.image);
            }
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result, imageFile: file }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="cat-modal-overlay">
            <div className="cat-modal-card">

                {/* Header */}
                <div className="cat-modal-header">
                    <h3>{initialData ? 'Edit Sub Category' : 'Add New Sub Category'}</h3>
                    <button className="icon-btn-sm" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="cat-modal-body">

                        {/* Parent Category */}
                        <div className="cat-form-group">
                            <label>Parent Category</label>
                            <select
                                className="cat-input"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sub Category Name */}
                        <div className="cat-form-group">
                            <label>Sub Category Name</label>
                            <input
                                type="text"
                                className="cat-input"
                                placeholder="e.g. Mobile Phones"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="cat-form-group">
                            <label>Sub Category Image</label>
                            <div className="cat-upload-zone">
                                {/* Full-zone clickable file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {imagePreview || initialData?.icon ? (
                                    <img
                                        src={imagePreview || initialData?.icon}
                                        alt="Preview"
                                        className="cat-upload-preview"
                                    />
                                ) : (
                                    <div className="cat-upload-icon-wrapper">
                                        <Upload size={20} color="var(--primary-color)" />
                                    </div>
                                )}
                                <span className="cat-upload-text">
                                    {imagePreview ? 'Click to change image' : 'Upload sub-category image'}
                                </span>
                                <span className="cat-upload-hint">SVG, PNG, JPG (max 2MB)</span>
                            </div>
                        </div>

                        {/* Description / Items */}
                        <div className="cat-form-group">
                            <label>Items under this sub-category</label>
                            <textarea
                                className="cat-input"
                                rows="2"
                                placeholder="e.g. iPhone, Samsung, Motorola..."
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
                                        name="scStatus"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Active
                                </label>
                                <label className="cat-status-option">
                                    <input
                                        type="radio"
                                        name="scStatus"
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
                            {initialData ? 'Save Changes' : 'Create Sub Category'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default SubCategoryForm;
