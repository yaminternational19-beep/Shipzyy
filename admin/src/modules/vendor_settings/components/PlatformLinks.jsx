import React, { useState, useEffect } from 'react';
import { Smartphone, Globe, Apple, ExternalLink, Copy, Loader2, BookOpen, FileText, X, Download } from 'lucide-react';
import { getSettingsContentApi } from '../../../api/settings.api';
import { jsPDF } from "jspdf";

const PlatformLinks = ({ showToast }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    // Reserved keys handled by dedicated sidebar pages
    const reservedKeys = [
        'about_us', 'about-us', 'aboutus', 
        'terms_conditions', 'terms-and-conditions', 'terms-conditions', 'terms',
        'privacy_policy', 'privacy-policy', 'privacypolicy', 'privacy'
    ];

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getSettingsContentApi();
                const data = res.data?.data || res.data || [];
                
                // Show everything EXCEPT the 3 main legal pages (which have their own sidebar links)
                const otherRecords = data.filter(item => {
                    const key = (item.page_key || item.slug || "").toLowerCase();
                    return !reservedKeys.some(reserved => key.includes(reserved));
                });
                
                setRecords(otherRecords);
            } catch (error) {
                console.error('Failed to fetch platform content:', error);
                showToast('Failed to load content', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleCopy = (content, title) => {
        const cleanText = content.replace(/<[^>]*>?/gm, '');
        navigator.clipboard.writeText(cleanText);
        showToast(`${title} content copied!`);
    };

    const getIcon = (item) => {
        const key = item.page_key || item.slug || "";
        if (key.toLowerCase().includes('android')) return <Smartphone size={24} style={{ color: '#3ddc84' }} />;
        if (key.toLowerCase().includes('ios') || key.toLowerCase().includes('apple')) return <Apple size={24} style={{ color: '#000000' }} />;
        if (item.type === 'url' || key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) return <Globe size={24} style={{ color: '#2563eb' }} />;
        return <FileText size={24} style={{ color: '#6366f1' }} />;
    };

    const handleAction = (item) => {
        const link = item.content || item.value || "";
        if (item.type === 'url' || link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            setSelectedItem(item);
        }
    };

    const handleDownload = (item) => {
        if (!item) return;
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(37, 99, 235);
            doc.text(item.title, 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            const date = new Date().toLocaleDateString();
            doc.text(`Platform Report - Generated on: ${date}`, 20, 28);
            
            doc.setFontSize(12);
            doc.setTextColor(33, 37, 41);
            const textToFormat = (item.content || item.value || "No content provided.").replace(/<[^>]*>?/gm, '');
            const splitText = doc.splitTextToSize(textToFormat, 170);
            doc.text(splitText, 20, 40);
            
            doc.save(`${item.title.replace(/\s+/g, '_')}.pdf`);
            showToast(`${item.title} downloaded as PDF!`);
        } catch (e) {
            showToast("Failed to generate PDF", "error");
        }
    };

    if (loading) {
        return (
            <div className="legal-loading">
                <Loader2 className="animate-spin" size={40} color="#6366f1" />
                <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading platform updates...</p>
            </div>
        );
    }

    return (
        <div className="platform-links-container">
            <div className="links-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '24px' 
            }}>
                {records.length > 0 ? (
                    records.map((item) => {
                        const isUrl = item.type === 'url' || (item.content && item.content.startsWith('http'));
                        
                        return (
                            <div key={item.id} className="link-card" style={{ 
                                background: 'white', 
                                padding: '24px', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '12px', 
                                        background: '#f8fafc', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>
                                        {getIcon(item)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{item.title}</h4>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            background: isUrl ? '#eff6ff' : '#f5f3ff', 
                                            color: isUrl ? '#2563eb' : '#6366f1',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            {isUrl ? 'Platform Link' : 'Info Page'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ 
                                    fontSize: '0.85rem', 
                                    color: '#64748b', 
                                    height: '40px', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {item.content?.replace(/<[^>]*>?/gm, '') || "View details for more information."}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <button 
                                        onClick={() => handleAction(item)}
                                        style={{ 
                                            flex: 2,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: '8px', 
                                            padding: '10px', 
                                            borderRadius: '10px', 
                                            background: 'var(--primary-color, #6366f1)', 
                                            color: 'white', 
                                            border: 'none', 
                                            fontWeight: 600, 
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isUrl ? <ExternalLink size={16} /> : <BookOpen size={16} />}
                                        {isUrl ? 'Open Link' : 'View Page'}
                                    </button>
                                    <button 
                                        onClick={() => handleCopy(item.content || item.value, item.title)}
                                        style={{ 
                                            padding: '10px 14px', 
                                            borderRadius: '10px', 
                                            background: '#f8fafc', 
                                            color: '#64748b', 
                                            border: '1px solid #e2e8f0', 
                                            cursor: 'pointer'
                                        }}
                                        title="Copy Content"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', border: '2px dashed #e2e8f0', borderRadius: '20px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>No additional platform content found.</p>
                    </div>
                )}
            </div>

            {/* Content Preview Modal */}
            {selectedItem && (
                <div className="ticket-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="ticket-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="ticket-modal-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {getIcon(selectedItem)}
                                {selectedItem.title}
                            </h3>
                            <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="ticket-modal-body" style={{ padding: '32px', lineHeight: '1.8' }}>
                            <div 
                                className="legal-inner-content"
                                dangerouslySetInnerHTML={{ __html: selectedItem.content || selectedItem.value }} 
                            />
                        </div>
                        <div className="ticket-modal-footer" style={{ gap: '12px' }}>
                            <button 
                                className="btn-legal-action btn-copy"
                                onClick={() => handleCopy(selectedItem.content || selectedItem.value, selectedItem.title)}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <Copy size={16} /> Copy Content
                            </button>
                            <button 
                                className="btn-legal-action btn-download"
                                onClick={() => handleDownload(selectedItem)}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                <Download size={16} /> Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformLinks;
