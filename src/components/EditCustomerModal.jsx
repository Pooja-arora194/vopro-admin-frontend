import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle2, UserCog, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const EditCustomerModal = ({ companyId, company: initialCompany, onClose, onSuccess, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!initialCompany);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    accountStatus: 'Active',
    newPassword: '',
  });

  useEffect(() => {
    const tid = companyId || initialCompany?._id;
    if (!tid) return;
    // Always fetch fresh from API to get primary user data
    setFetching(true);
    api.get(`/admin/companies/${tid}`)
      .then(r => {
        if (r.data.success) {
          const c = r.data.company;
          const primaryContact = r.data.contacts?.find(u => u.isPrimaryContact);
          setForm({
            name: primaryContact?.name || c.companyName || '',
            email: primaryContact?.email || c.billingContact?.email || '',
            phone: primaryContact?.phone || c.phone || '',
            accountStatus: c.accountStatus || 'Active',
            newPassword: '',
          });
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load.'))
      .finally(() => setFetching(false));
  }, [companyId]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email is invalid';
    if (!form.phone.trim()) e.phone = 'Contact number is required';
    else if (!/^[\d\s+\-]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number (min 7 digits)';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const tid = companyId || initialCompany?._id;
    try {
      const res = await api.patch(`/admin/companies/${tid}/primary-contact`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        accountStatus: form.accountStatus,
        ...(form.newPassword.trim() && { newPassword: form.newPassword.trim() }),
      });
      if (res.data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(res.data.company);
        // Refresh the company list in the parent if a handler is provided
        if (onRefresh) onRefresh();
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      console.log(err, "nnmnnmnmnmmn")
      setError(err.response?.data?.message || 'Failed to update customer.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '420px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(109,44,249,0.1)', border: '1px solid rgba(109,44,249,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6D2CF9', flexShrink: 0
            }}>
              <UserCog size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-main)' }}>Edit Customer</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>Update customer details</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9', border: 'none', borderRadius: '8px',
              width: '28px', height: '28px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)'
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {fetching ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Loader2 size={22} className="spin-icon" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.8125rem' }}>Loading customer details...</div>
            </div>
          ) : (
            <form id="edit-customer-form" onSubmit={handleSubmit}>
              {error && (
                <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '14px' }}>
                  <AlertCircle size={14} /><span>{error}</span>
                </div>
              )}
              {success && (
                <div className="scan-progress-banner" style={{ background: 'var(--success-light)', color: 'var(--success)', marginBottom: '14px' }}>
                  <CheckCircle2 size={14} /><span>Customer updated successfully.</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text" className="form-input"
                  style={errors.name ? { borderColor: '#EF4444' } : {}}
                  placeholder="e.g. John Davis"
                  value={form.name}
                  onChange={e => { set('name', e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                />
                {errors.name && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email" className="form-input"
                  style={errors.email ? { borderColor: '#EF4444' } : {}}
                  placeholder="e.g. john@company.co.uk"
                  value={form.email}
                  onChange={e => { set('email', e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                />
                {errors.email && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="text" className="form-input"
                  style={errors.phone ? { borderColor: '#EF4444' } : {}}
                  placeholder="e.g. +44 121 496 0888"
                  value={form.phone}
                  onChange={e => { set('phone', e.target.value); setErrors(p => ({ ...p, phone: '' })); }}
                />
                {errors.phone && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.accountStatus}
                  onChange={e => set('accountStatus', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="edit-customer-form"
            className="btn btn-primary btn-sm"
            disabled={loading || fetching}
          >
            {loading
              ? <><Loader2 size={13} className="spin-icon" /><span>Saving...</span></>
              : <><Save size={13} /><span>Save Changes</span></>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
