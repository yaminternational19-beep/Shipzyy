
import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import '../VendorSupport.css';
import { getVendorSupportApi, submitVendorQueryApi } from '../../../api/vendor_support.api';

const RaiseQueryForm = ({ onAddQuery }) => {
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

  const [formData, setFormData] = useState({
    recipientIndex: 0,
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const vendorScenarios = [
    "Menu update taking too long",
    "Cannot accept orders",
    "App crashing on map screen",
    "Payment payout issue",
    "Account Verification Delay",
    "Missing Reward Points",
    "Product List Update",
    "Order Payment Issue",
    "Other Issue"
  ];

  // 🔹 Fetch support contacts (replaces static array)
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await getVendorSupportApi();
        const data =
          res.data?.records ||
          res.data?.data?.records ||
          res.data?.data ||
          [];

        setRecipients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load vendor support contacts:', error);
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadContacts();
  }, []);

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.subject || !formData.message || recipients.length === 0) return;

      setLoading(true);

      const selectedRecipient = recipients[formData.recipientIndex];

      const payload = {
        subject: formData.subject,
        message: formData.message,
        supportContactId: selectedRecipient.id
      };

      try {
        await submitVendorQueryApi(payload);

        onAddQuery({
          ...payload,
          recipientName: selectedRecipient.name,
          status: 'Open',
          created_at: new Date().toISOString()
        });

        setFormData({
          recipientIndex: 0,
          subject: '',
          message: ''
        });

      } catch (error) {
        console.error("Failed to create ticket:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="query-form-card">
      <div className="query-form-header">
        <h3>Raise a Support Ticket</h3>
        <p>Direct your query to the right department for faster resolution.</p>
      </div>

      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label>Select Recipient Department</label>

          <div className="recipient-grid">
            {loadingRecipients ? (
              <p>Loading departments...</p>
            ) : (
              recipients.map((dept, index) => (
                <div
                  key={dept.id || dept.name}
                  onClick={() =>
                    setFormData(prev => ({ ...prev, recipientIndex: index }))
                  }
                  className={`recipient-item ${
                    formData.recipientIndex === index ? 'active' : ''
                  }`}
                >
                  <span className="dept-name">{dept.name}</span>
                  <span className="dept-email">{dept.email}</span>
                  <span className="dept-phone">{dept.country_code} {dept.phone_number}</span>
                  <span className="dept-working">{dept.working_hours}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Query Subject</label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="support-select"
            required
          >
            <option value="" disabled>Select a scenario...</option>
            {vendorScenarios.map(scenario => (
              <option key={scenario} value={scenario}>
                {scenario}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Message Details</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Please describe your issue clearly..."
            rows="5"
            className="support-textarea"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.subject || recipients.length === 0}
          className="support-submit-btn"
        >
          {loading ? (
            'Sending Ticket...'
          ) : (
            <>
              Send Query to {recipients[formData.recipientIndex]?.name || 'support'}
              <Send size={18} style={{ marginLeft: '8px' }} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RaiseQueryForm;

