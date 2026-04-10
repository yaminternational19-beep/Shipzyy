import React, { useState, useEffect, useCallback } from 'react';
import { Plus, HelpCircle, Save, Trash2, Edit2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import SettingTabs from './SettingTabs';
import { getFAQsApi, createFAQApi, updateFAQApi, deleteFAQApi } from '../../../api/settings.api';

const FAQ = ({ onShowToast }) => {
    const [activeTab, setActiveTab] = useState('customer');
    const [expandedId, setExpandedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [faqs, setFaqs] = useState({
        customer: [],
        rider: [],
        vendor: []
    });

    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'customer' });
    const [editId, setEditId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadFAQs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getFAQsApi();
            if (response.data.success) {
                const grouped = { customer: [], rider: [], vendor: [] };
                response.data.data.forEach(faq => {
                    if (grouped[faq.category]) grouped[faq.category].push(faq);
                });
                setFaqs(grouped);
            }
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to load FAQs', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [onShowToast]);

    useEffect(() => {
        loadFAQs();
    }, []); // Only load on mount

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSave = async () => {
        if (!newFAQ.question || !newFAQ.answer) {
            onShowToast('Please fill in both question and answer', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            if (editId) {
                await updateFAQApi(editId, newFAQ);
                onShowToast('FAQ updated successfully');
            } else {
                await createFAQApi(newFAQ);
                onShowToast('FAQ added successfully');
            }
            setShowModal(false);
            setEditId(null);
            setNewFAQ({ question: '', answer: '', category: activeTab });
            loadFAQs();
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to save FAQ', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        
        try {
            await deleteFAQApi(id);
            onShowToast('FAQ deleted', 'success');
            loadFAQs();
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to delete FAQ', 'error');
        }
    };

    return (
        <div className="faq-manager" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <SettingTabs activeTab={activeTab} onTabChange={setActiveTab} showAll={false} />
                <button 
                    className="btn btn-primary" 
                    onClick={() => { setNewFAQ({ question: '', answer: '', category: activeTab }); setEditId(null); setShowModal(true); }} 
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Plus size={16} /> Add FAQ
                </button>
            </div>

            <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px', position: 'relative' }}>
                {isLoading ? (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading FAQs...</p>
                    </div>
                ) : (
                    <>
                        {faqs[activeTab].length === 0 && !showModal && (
                            <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <HelpCircle size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                <h3 style={{ color: '#475569', margin: 0 }}>No FAQs found</h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>Click the "Add FAQ" button to create one for this category.</p>
                            </div>
                        )}

                        {faqs[activeTab].map(item => (
                            <div key={item.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
                                <div 
                                    style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => toggleExpand(item.id)}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 600 }}>{item.question}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setEditId(item.id); 
                                                    setNewFAQ({ question: item.question, answer: item.answer, category: item.category }); 
                                                    setShowModal(true); 
                                                }}
                                                style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        {expandedId === item.id ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                                    </div>
                                </div>
                                {expandedId === item.id && (
                                    <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #f1f5f9', animation: 'slideDown 0.3s ease' }}>
                                        <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {showModal && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease'
                    }}
                    onClick={() => { setShowModal(false); setEditId(null); setNewFAQ({ question: '', answer: '', category: activeTab }); }}
                >
                    <div 
                        style={{ 
                            backgroundColor: 'white', 
                            borderRadius: '12px', 
                            padding: '24px', 
                            width: '90%', 
                            maxWidth: '500px', 
                            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                            animation: 'slideUp 0.3s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px' }}>{editId ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Category</label>
                            <select 
                                className="form-control"
                                value={newFAQ.category}
                                onChange={(e) => setNewFAQ({...newFAQ, category: e.target.value})}
                                style={{ padding: '12px', borderRadius: '8px' }}
                            >
                                <option value="customer">Customer</option>
                                <option value="rider">Rider</option>
                                <option value="vendor">Vendor</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Question</label>
                            <input 
                                type="text"
                                className="form-control"
                                value={newFAQ.question}
                                onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                                placeholder="Enter common question..."
                                style={{ padding: '12px', borderRadius: '8px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Answer</label>
                            <textarea 
                                className="form-control"
                                value={newFAQ.answer}
                                onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                                placeholder="Provide detailed answer..."
                                style={{ padding: '12px', borderRadius: '8px', minHeight: '160px', minWidth: '100%', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => { setShowModal(false); setEditId(null); setNewFAQ({ question: '', answer: '', category: activeTab }); }}
                                style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSave}
                                style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : (editId ? 'Update FAQ' : 'Save FAQ')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQ;
