import React, { useState } from 'react';
import { X, Save, Building, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const AccountEditModal = ({ company, onClose, onSuccess }) => {
  const [phone, setPhone] = useState(company?.phone || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [street, setStreet] = useState(company?.address?.street || '');
  const [city, setCity] = useState(company?.address?.city || '');
  const [state, setState] = useState(company?.address?.state || '');
  const [postalCode, setPostalCode] = useState(company?.address?.postalCode || '');
  const [country, setCountry] = useState(company?.address?.country || 'United Kingdom');

  const [billingName, setBillingName] = useState(company?.billingContact?.name || '');
  const [billingEmail, setBillingEmail] = useState(company?.billingContact?.email || '');
  const [billingPhone, setBillingPhone] = useState(company?.billingContact?.phone || '');
  const [billingAddress, setBillingAddress] = useState(company?.billingContact?.address || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (phone.trim() && !/^[\d\s+\-]{7,}$/.test(phone.trim())) {
      setError('Main switchboard telephone must be at least 7 characters and contain only digits, spaces, + or -.');
      return;
    }

    if (website.trim() && !/^https?:\/\/.+/.test(website.trim())) {
      setError('Corporate website must start with http:// or https://.');
      return;
    }

    if (billingEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim())) {
      setError('Please enter a valid billing email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.put(`/companies/${company._id}/permitted-info`, {
        phone,
        website,
        street,
        city,
        state,
        postalCode,
        country,
        billingName,
        billingEmail,
        billingPhone,
        billingAddress
      });

      if (res.data.success) {
        onSuccess(res.data.company);
        onClose();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update permitted information.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box modal-header-icon-primary">
              <Building size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Update Permitted Account Details
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                All amendments will be time-stamped and logged in your account audit trail.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger-border)', marginBottom: '18px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Readonly Company Legal Name */}
            <div className="form-group">
              <label className="form-label">Company Legal Name (Registered)</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={company?.companyName || ''}
                style={{ background: '#F1F5F9', color: '#64748B' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Legal entity name modifications require VoPro contract amendment.
              </span>
            </div>

            {/* General Contact Info */}
            <div className="modal-grid-2col">
              <div className="form-group">
                <label className="form-label">Main Switchboard Telephone</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Website</label>
                <input
                  type="text"
                  className="form-input"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Registered Office Street Address</label>
              <input
                type="text"
                className="form-input"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            <div className="modal-grid-3col">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input
                  type="text"
                  className="form-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            {/* Billing Contact Section */}
            <div className="modal-highlight-box" style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>
                Billing & Accounts Payable Contact Details:
              </div>

              <div className="modal-grid-2col" style={{ marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Billing Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Billing Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-grid-2col">
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Billing Telephone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Billing Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save & Record Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountEditModal;
