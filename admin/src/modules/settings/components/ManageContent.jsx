import React, { useState, useEffect } from 'react';
import { Edit2, X, Save, FileText, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { getSettingsContentApi, createSettingsContentApi, updateSettingsContentApi, deleteSettingsContentApi } from '../../../api/settings.api';

const iconMap = {
    FileText,
    LinkIcon
};

const ManageContent = ({ onShowToast }) => {
    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await getSettingsContentApi();
            if (response.data.success) {
                const fetchedSections = response.data.data.map(item => ({
                    ...item,
                    icon: iconMap[item.icon] || FileText,
                    key: item.page_key,
                    deletable: !!item.is_deletable
                }));
                setSections(fetchedSections);
                
                if (fetchedSections.length > 0) {
                    setActiveSection(fetchedSections[0]);
                    setEditValue(fetchedSections[0].content || '');
                }
            }
        } catch (error) {
            console.error("Error fetching content:", error);
            onShowToast("Failed to load content settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTabClick = (section) => {
        setActiveSection(section);
        setEditValue(section.content || '');
    };

    const handleSave = async () => {
        if (!activeSection) return;
        
        try {
            setLoading(true);
            const response = await updateSettingsContentApi(activeSection.key, { content: editValue });
            if (response.data.success) {
                // Update local state
                setSections(prev => prev.map(s => s.key === activeSection.key ? { ...s, content: editValue } : s));
                onShowToast(`${activeSection.title} updated successfully!`, 'success');
            }
        } catch (error) {
            console.error("Error updating content:", error);
            onShowToast(error.response?.data?.message || `Failed to update ${activeSection.title}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = async () => {
        if (!newPageTitle.trim()) {
            onShowToast('Please enter a page title', 'warning');
            return;
        }

        // CamelCase key generation for internal mapping
        const newKey = newPageTitle
            .toLowerCase()
            .replace(/^[0-9]+/, '') // Don't allow numbers at start
            .split(' ')
            .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        if (sections.some(s => s.key === newKey)) {
            onShowToast('A page with this name already exists', 'warning');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                page_key: newKey,
                title: newPageTitle,
                content: '',
                type: 'html',
                icon: 'FileText'
            };
            
            const response = await createSettingsContentApi(payload);
            if (response.data.success) {
                const newSection = {
                    ...payload,
                    key: newKey,
                    icon: FileText,
                    deletable: true
                };

                setSections(prev => [...prev, newSection]);
                onShowToast(`Page "${newPageTitle}" created`, 'success');
                setNewPageTitle('');
                setShowModal(false);
                
                // Switch to new page
                setActiveSection(newSection);
                setEditValue('');
            }
        } catch (error) {
            console.error("Error creating page:", error);
            onShowToast(error.response?.data?.message || 'Failed to create page', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePage = async (e, targetSection) => {
        e.stopPropagation(); // Don't trigger tab click
        
        if (window.confirm(`Are you sure you want to delete the "${targetSection.title}" page?`)) {
            try {
                setLoading(true);
                const response = await deleteSettingsContentApi(targetSection.key);
                if (response.data.success) {
                    const updatedSections = sections.filter(s => s.key !== targetSection.key);
                    setSections(updatedSections);
                    
                    // If we deleted the active section, move to first section
                    if (activeSection.key === targetSection.key && updatedSections.length > 0) {
                        const firstSection = updatedSections[0];
                        setActiveSection(firstSection);
                        setEditValue(firstSection.content || '');
                    }
                    
                    onShowToast(`Page "${targetSection.title}" deleted`, 'info');
                }
            } catch (error) {
                console.error("Error deleting page:", error);
                onShowToast(error.response?.data?.message || 'Failed to delete page', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div className="tab-group-pills" style={{ margin: 0, flexWrap: 'wrap', width: 'fit-content', maxWidth: 'calc(100% - 160px)' }}>
                    {sections.map(section => {
                        const IconComponent = section.icon || FileText;
                        return (
                            <button 
                                key={section.key} 
                                className={activeSection?.key === section.key ? 'active' : ''}
                                onClick={() => handleTabClick(section)}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', paddingRight: section.deletable ? '32px' : '12px', marginBottom: '4px' }}
                            >
                                <IconComponent size={14} />
                                {section.title}
                                {section.deletable && (
                                    <span 
                                        onClick={(e) => handleDeletePage(e, section)}
                                        style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'color 0.2s' }}
                                        title="Delete Page"
                                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                                    >
                                        <Trash2 size={12} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    disabled={loading}
                >
                    <Plus size={16} /> Add Page
                </button>
            </div>

            {/* Modal Popup */}
            {showModal && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Create New Content Page</h3>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20}/></button>
                        </div>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Page Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Help Center or Legal Notice"
                                value={newPageTitle}
                                onChange={(e) => setNewPageTitle(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowModal(false)}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleCreatePage}
                                disabled={loading}
                                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? 'Creating...' : 'Create Page'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Editor Area */}
            {activeSection ? (
                <div style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease' }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                            {activeSection.title}
                        </label>
                        {activeSection.type === 'textarea' || activeSection.type === 'html' ? (
                            <textarea 
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder={`Enter ${activeSection.title} content...`}
                                style={{ 
                                    width: '100%', 
                                    minHeight: '250px', 
                                    padding: '16px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #cbd5e1', 
                                    resize: 'vertical', 
                                    fontFamily: 'inherit', 
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                }}
                            />
                        ) : (
                            <input 
                                type="url"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="https://..."
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #cbd5e1', 
                                    fontFamily: 'inherit', 
                                    fontSize: '14px'
                                }}
                            />
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSave}
                            disabled={loading || editValue === activeSection.content}
                            style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: (loading || editValue === activeSection.content) ? 'not-allowed' : 'pointer', opacity: (loading || editValue === activeSection.content) ? 0.7 : 1 }}
                        >
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : !loading && sections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <FileText size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                    <p>No content pages found. Create one to get started.</p>
                </div>
            ) : null}
            
            {loading && !activeSection && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <p>Loading content...</p>
                </div>
            )}
        </div>
    );
};

export default ManageContent;
