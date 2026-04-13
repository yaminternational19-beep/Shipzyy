import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { getVendorFaqsApi } from '../../../api/vendor_support.api';

const FAQSection = ({ faqs = [] }) => {
  const [openId, setOpenId] = useState(null);
  const [faqList, setFaqList] = useState(faqs);
  const [loading, setLoading] = useState(false);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      try {
        const response = await getVendorFaqsApi({ category: 'vendor', status: 'Active' });
        const data = response.data?.records || response.data?.data?.records || response.data?.data || [];
        setFaqList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load vendor FAQs:', error);
        setFaqList(faqs);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [faqs]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Frequently Asked Questions</h3>
        <p style={styles.subtitle}>Quick answers to common questions.</p>
      </div>

      <div style={styles.faqList}>
        {loading ? (
          <div style={{ padding: '16px 20px', color: 'var(--text-secondary, #64748b)' }}>
            Loading FAQs...
          </div>
        ) : faqList.length === 0 ? (
          <div style={{ padding: '16px 20px', color: 'var(--text-secondary, #64748b)' }}>
            No FAQs available at the moment.
          </div>
        ) : faqList.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} style={styles.faqItem}>
              <button
                onClick={() => toggleFAQ(faq.id)}
                style={{
                  ...styles.faqQuestion,
                  backgroundColor: isOpen ? 'var(--primary-light, #f5f3ff)' : '#fff',
                  borderBottom: isOpen ? '1px solid var(--border-color, #e2e8f0)' : 'none'
                }}
              >
                <div style={styles.questionText}>
                  <HelpCircle
                    size={18}
                    style={{
                      marginRight: '12px',
                      color: isOpen ? 'var(--primary, #6366f1)' : 'var(--text-light, #94a3b8)'
                    }}
                  />
                  {faq.question}
                </div>
                {isOpen ? (
                  <ChevronUp size={20} color="var(--primary, #6366f1)" />
                ) : (
                  <ChevronDown size={20} color="var(--text-light, #94a3b8)" />
                )}
              </button>
              
              <div
                style={{
                  ...styles.faqAnswer,
                  maxHeight: isOpen ? '300px' : '0',
                  opacity: isOpen ? 1 : 0,
                  padding: isOpen ? '16px 20px 20px 50px' : '0 20px'
                }}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 'var(--spacing-lg, 24px)',
    backgroundColor: 'var(--bg-card, #fff)',
    borderRadius: 'var(--border-radius-lg, 12px)',
    boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
    border: '1px solid var(--border-color, #e2e8f0)'
  },
  header: {
    marginBottom: 'var(--spacing-lg, 24px)'
  },
  title: {
    fontSize: 'var(--font-size-xl, 1.25rem)',
    fontWeight: 'var(--font-weight-bold, 700)',
    color: 'var(--text-primary, #1e293b)',
    margin: 0
  },
  subtitle: {
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--text-secondary, #64748b)',
    marginTop: '4px'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  faqItem: {
    borderRadius: 'var(--border-radius-md, 8px)',
    border: '1px solid var(--border-color, #e2e8f0)',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  faqQuestion: {
    width: '100%',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base, 1rem)',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--text-primary, #1e293b)',
    transition: 'all 0.2s ease'
  },
  questionText: {
    display: 'flex',
    alignItems: 'center'
  },
  faqAnswer: {
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    fontSize: 'var(--font-size-sm, 0.875rem)',
    color: 'var(--text-secondary, #475569)',
    lineHeight: '1.6',
    backgroundColor: '#fff'
  }
};

export default FAQSection;
