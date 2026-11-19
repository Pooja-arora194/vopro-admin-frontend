import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const ContactModal = ({ companyId, contact = null, onClose, onSuccess }) => {
  const isEditing = !!contact;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [isBillingContact, setIsBillingContact] = useState(false);
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [isAuthorizedSignatory, setIsAuthorizedSignatory] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setJobTitle(contact.jobTitle || '');
      setDepartment(contact.department || '');
      setIsBillingContact(!!contact.isBillingContact);
      setIsPrimaryContact(!!contact.isPrimaryContact);
      setIsAuthorizedSignatory(!!contact.isAuthorizedSignatory);
    }
  }, [contact]);

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Full name must be at least 2 characters';
    if (!isEditing && !email.trim()) errs.email = 'Email is required';
    else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Email is invalid';
    if (phone.trim() && !/^[\d\s+\-]{7,}$/.test(phone.trim())) errs.phone = 'Enter a valid phone number (min 7 digits)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/companies/${companyId}/contacts/${contact._id}`, {
          name,
          phone,
          jobTitle,
          department,
          isBillingContact,
          isAuthorizedSignatory
        });
      } else {
        await api.post(`/companies/${companyId}/contacts`, {
          name,
          email,
          phone,
          jobTitle,
          department,
          isBillingContact,
          isPrimaryContact,
          isAuthorizedSignatory
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to save contact details.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box modal-header-icon-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                {isEditing ? 'Edit Authorised Contact' : 'Add New Authorised Contact'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Changes will be permanently recorded in the account audit history.
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

            <div className="modal-grid-2col">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={errors.name ? { borderColor: '#EF4444' } : {}}
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                />
                {errors.name && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  style={errors.email ? { borderColor: '#EF4444' } : {}}
                  disabled={isEditing}
                  placeholder="e.g. rachel@company.co.uk"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                />
                {errors.email && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>
            </div>

            <div className="modal-grid-2col">
              <div className="form-group">
                <label className="form-label">Telephone Number</label>
                <input
                  type="text"
                  className="form-input"
                  style={errors.phone ? { borderColor: '#EF4444' } : {}}
                  placeholder="+44 (0) 20 7946 0000"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                />
                {errors.phone && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Role</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Finance Officer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Accounts & Billing / IT"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            {/* Authorisation Roles checkboxes */}
            <div className="modal-highlight-box" style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '10px' }}>
                Account Permissions & Designation:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="checkbox-label-row">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={isBillingContact}
                    onChange={(e) => setIsBillingContact(e.target.checked)}
                  />
                  <span><strong>Billing Contact</strong> (Receives invoice notifications & billing summaries)</span>
                </label>

                <label className="checkbox-label-row">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={isAuthorizedSignatory}
                    onChange={(e) => setIsAuthorizedSignatory(e.target.checked)}
                  />
                  <span><strong>Authorized Signatory</strong> (Permitted to execute contract amendments)</span>
                </label>

                {!isEditing && (
                  <label className="checkbox-label-row">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isPrimaryContact}
                      onChange={(e) => setIsPrimaryContact(e.target.checked)}
                    />
                    <span><strong>Primary Operational Contact</strong></span>
                  </label>
                )}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEditing ? 'Save Changes' : 'Create Contact'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
