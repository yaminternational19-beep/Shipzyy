import React from 'react';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, Square, CheckSquare, Image as ImageIcon } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import { getSafeImage } from '../../../utils/imageUtils';

const BannerList = ({
    banners,
    pagination,
    filters,
    setFilters,
    loading,
    selectedRows,
    setSelectedRows,
    onSelectAll,
    onEdit,
    onDelete,
    onRefresh,
    showToast
}) => {
    const { currentPage, itemsPerPage } = pagination || { currentPage: 1, itemsPerPage: 10, totalRecords: 0 };
    const totalCount = pagination?.totalRecords || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return (
        <>
            <div className="vendor-table-controls">
                <div className="vendor-controls-left">
                    <div className="vendor-search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="banner-grid-container">
                {loading ? (
                    <div className="vendor-empty-state">
                        <div className="loading-spinner"></div>
                        <p>Loading banners...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="vendor-empty-state">
                        <div className="empty-state-icon">
                            <ImageIcon size={48} color="#cbd5e1" />
                        </div>
                        <p>No Banners Found</p>
                    </div>
                ) : (
                    <div className="banner-grid">
                        {banners.map((item) => (
                            <div key={item.id} className={`banner-card ${selectedRows.includes(item.id) ? 'selected' : ''}`}>
                                
                                <div className="banner-card-image-box">
                                    <div className="banner-card-checkbox" onClick={() => toggleSelectRow(item.id)}>
                                        {selectedRows.includes(item.id)
                                            ? <CheckSquare size={20} color="var(--primary-color)" />
                                            : <Square size={20} color="rgba(255,255,255,0.8)" style={{ background: 'rgba(0,0,0,0.2)', borderRadius:'4px' }} />
                                        }
                                    </div>
                                    
                                    <div className="banner-card-actions">
                                        <ActionButton
                                            icon={Edit2}
                                            onClick={() => onEdit(item)}
                                            variant="secondary"
                                            size={16}
                                            tooltip="Edit"
                                        />
                                        <ActionButton
                                            icon={Trash2}
                                            onClick={() => onDelete(item)}
                                            variant="secondary"
                                            size={16}
                                            tooltip="Delete"
                                        />
                                    </div>

                                    <img src={getSafeImage(item.banner_image, 'BANNER')} alt={item.banner_name} />
                                </div>

                                <div className="banner-card-content">
                                    <h3 className="banner-card-title">{item.banner_name}</h3>
                                    <p className="banner-card-description">
                                        {item.description || "No description provided."}
                                    </p>
                                </div>
                                
                                <div className="banner-card-footer">
                                    <span className="id-badge">BAN-{item.id}</span>
                                    <span className="vendor-date-text">
                                        {new Date(item.createdAt || item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default BannerList;
