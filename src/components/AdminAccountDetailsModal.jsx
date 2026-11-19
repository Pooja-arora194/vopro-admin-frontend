import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  X, Save, Building2, MapPin, Phone, Mail,
  CreditCard, Users, PlusCircle, AlertCircle,
  CheckCircle2, Loader2, Trash2
} from 'lucide-react';
import LocationSelector from './LocationSelector';
import '../styles/AdminAccountModal.css';
import '../styles/Modals.css';
import '../styles/LocationSelector.css';
import '../styles/AccountDetailsModal.css';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const AdminAccountDetailsModal = ({ companyId, company: initialCompany, onClose, onSuccess }) => {
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(initialCompany || null);
  const [contacts, setContacts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    companyName: '', industry: '', registrationNumber: '', vatNumber: '', website: '',
    street: '', city: '', state: '', postalCode: '', country: 'United Kingdom',
    phone: '', mainEmail: '',
    billingName: '', billingEmail: '', billingPhone: '', billingAddress: '',
  });

  const [showAddContact, setShowAddContact] = useState(true);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState(null);
  const [newContactErrors, setNewContactErrors] = useState({});

  useEffect(() => {
    const tid = companyId || initialCompany?._id;
    if (!tid) { setFetching(false); return; }
    setFetching(true);
    api.get(`/admin/companies/${tid}`)
      .then(r => {
        if (r.data.success) {
          setCompany(r.data.company);
          setContacts(r.data.contacts?.filter(c => !c.isPrimaryContact) || []);
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load account.'))
      .finally(() => setFetching(false));
  }, [companyId]);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: null }));
  };

  /* ── Validate main form ── */
  const validate = () => {
    const errs = {};
    // Required fields
    if (!form.companyName.trim()) errs.companyName = 'Company name is required.';
    if (!form.industry.trim()) errs.industry = 'Industry is required.';
    if (!form.registrationNumber.trim()) errs.registrationNumber = 'Registration number is required.';
    if (!form.vatNumber.trim()) errs.vatNumber = 'VAT number is required.';
    if (!form.website.trim()) errs.website = 'Website is required.';
    if (!form.street.trim()) errs.street = 'Street is required.';
    if (!form.country.trim()) errs.country = 'Country is required.';
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    if (!form.mainEmail.trim()) errs.mainEmail = 'Main email is required.';
    if (!form.billingName.trim()) errs.billingName = 'Billing name is required.';
    if (!form.billingEmail.trim()) errs.billingEmail = 'Billing email is required.';
    if (!form.billingPhone.trim()) errs.billingPhone = 'Billing phone is required.';
    if (!form.billingAddress.trim()) errs.billingAddress = 'Billing address is required.';

    // Format checks
    if (form.mainEmail && !isValidEmail(form.mainEmail)) errs.mainEmail = 'Enter a valid email address.';
    if (form.billingEmail && !isValidEmail(form.billingEmail)) errs.billingEmail = 'Enter a valid billing email address.';
    if (form.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(form.website)) errs.website = 'Enter a valid URL (include http/https).';
    if (form.phone && !/^\d{7,15}$/.test(form.phone.replace(/\s+/g, ''))) errs.phone = 'Enter a valid phone number.';
    if (form.billingPhone && !/^\d{7,15}$/.test(form.billingPhone.replace(/\s+/g, ''))) errs.billingPhone = 'Enter a valid billing phone number.';
    return errs;
  };


  const handleSave = async (e) => {
    console.log(form, "formformform")
    e.preventDefault();
    const errs = validate();
    console.log(form, errs, "formformform")
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setSaving(true);
    setError(null);
    const tid = companyId || company?._id;
    try {
      const res = await api.put(`/admin/companies/${tid}`, {
        companyName: form.companyName, industry: form.industry,
        registrationNumber: form.registrationNumber, vatNumber: form.vatNumber,
        website: form.website, phone: form.phone,
        mainContactEmail: form.mainEmail,
        street: form.street, city: form.city, state: form.state,
        postalCode: form.postalCode, country: form.country,
        billingName: form.billingName, billingEmail: form.billingEmail,
        billingPhone: form.billingPhone, billingAddress: form.billingAddress,
      });
      if (res.data.success) {
        setCompany(res.data.company);
        if (onSuccess) onSuccess(res.data.company);
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save details.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Add contact validation ── */
  const validateNewContact = () => {
    const errs = {};
    if (!newContact.name.trim()) errs.name = 'Full name is required.';
    if (!newContact.email.trim()) errs.email = 'Email is required.';
    else if (!isValidEmail(newContact.email)) errs.email = 'Enter a valid email address.';
    return errs;
  };

  const handleAddContact = async () => {
    const errs = validateNewContact();
    if (Object.keys(errs).length) { setNewContactErrors(errs); return; }
    setContactSubmitting(true);
    setContactError(null);
    const tid = companyId || company?._id;
    try {
      const res = await api.post(`/companies/${tid}/contacts`, {
        name: newContact.name, email: newContact.email,
        phone: newContact.phone, role: 'customer_user',
      });
      if (res.data.success) {
        setContacts(prev => [...prev, res.data.contact]);
        setNewContact({ name: '', email: '', phone: '' });
        setNewContactErrors({});
        setShowAddContact(false);
      }
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to add contact.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!contactId) return;
    setContactError(null);
    const tid = companyId || company?._id;
    try {
      await api.delete(`/companies/${tid}/contacts/${contactId}`);
      setContacts(prev => prev.filter(c => String(c._id) !== String(contactId)));
      // Optionally refresh contacts or reset add contact form
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to delete contact.');
    }
  };

  const inputStyle = (field) => ({
    borderColor: fieldErrors[field] ? '#EF4444' : undefined,
    boxShadow: fieldErrors[field] ? '0 0 0 2px rgba(239,68,68,0.15)' : undefined,
  });

  const errText = (field) => fieldErrors[field]
    ? <div style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>{fieldErrors[field]}</div>
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109,44,249,0.1)', color: '#6D2CF9' }}>
              <Building2 size={17} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-main)' }}>Add Account Details</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fill in company, address, contact and billing info</div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {fetching ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 size={22} className="spin-icon" /><span>Loading...</span>
            </div>
          ) : (
            <form id="acc-details-form" onSubmit={handleSave}>

              {error && <div className="acc-details-banner acc-banner-error" style={{ marginBottom: '16px' }}><AlertCircle size={14} /><span>{error}</span></div>}

              {/* ── COMPANY ── */}
              <div style={{ marginBottom: '20px' }}>
                <div className="acc-section-title" style={{ marginBottom: '12px' }}><Building2 size={14} color="#6D2CF9" /><span>Company Information</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Legal Name *</label>
                    <input type="text" className="form-input" placeholder="e.g. Acme Telecom Ltd"
                      value={form.companyName} style={inputStyle('companyName')}
                      onChange={e => set('companyName', e.target.value)} />
                    {errText('companyName')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry / Sector *</label>
                    <input type="text" className="form-input" style={inputStyle('industry')} placeholder="e.g. Telecommunications"
                      value={form.industry} onChange={e => set('industry', e.target.value)} />
                    {errText('industry')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration No. *</label>
                    <input type="text" className="form-input" style={inputStyle('registrationNumber')} placeholder="e.g. 08492019"
                      value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} />
                    {errText('registrationNumber')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">VAT Number *</label>
                    <input type="text" className="form-input" style={inputStyle('vatNumber')} placeholder="e.g. GB 928 3491 80"
                      value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} />
                    {errText('vatNumber')}
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Corporate Website</label>
                    <input type="text" className="form-input" style={inputStyle('website')} placeholder="e.g. https://company.co.uk"
                      value={form.website} onChange={e => set('website', e.target.value)} />
                    {errText('website')}
                  </div>
                </div>
              </div>

              {/* ── ADDRESS ── */}
              <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div className="acc-section-title" style={{ marginBottom: '12px' }}><MapPin size={14} color="#6D2CF9" /><span>Registered Office Address *</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Street Address *</label>
                    <input type="text" className="form-input" style={inputStyle('street')} placeholder="e.g. 12 Corporate Way"
                      value={form.street} onChange={e => set('street', e.target.value)} />
                    {errText('street')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-input" placeholder="e.g. EC1A 1BB"
                      value={form.postalCode} onChange={e => set('postalCode', e.target.value)} />
                  </div>
                </div>
                <LocationSelector
                  country={form.country} state={form.state} city={form.city}
                  onCountryChange={(name) => set('country', name)}
                  onStateChange={(name) => set('state', name)}
                  onCityChange={(name) => set('city', name)}
                />
              </div>

              {/* ── MAIN CONTACT ── */}
              <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div className="acc-section-title" style={{ marginBottom: '12px' }}><Phone size={14} color="#6D2CF9" /><span>Main Contact</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Number *</label>
                    <input type="text" className="form-input" style={inputStyle('phone')} placeholder="+44 20 7946 0000"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                    {errText('phone')}
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-input" placeholder="e.g. info@company.co.uk"
                      value={form.mainEmail} style={inputStyle('mainEmail')}
                      onChange={e => set('mainEmail', e.target.value)} />
                    {errText('mainEmail')}
                  </div>
                </div>
              </div>

              {/* ── BILLING CONTACT ── */}
              <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div className="acc-section-title" style={{ marginBottom: '12px' }}><CreditCard size={14} color="#10B981" /><span>Billing Contact</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Billing Name *</label>
                    <input type="text" className="form-input" style={inputStyle('billingName')} placeholder="e.g. Jane Smith"
                      value={form.billingName} onChange={e => set('billingName', e.target.value)} />
                    {errText('billingName')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Email *</label>
                    <input type="email" className="form-input" placeholder="e.g. accounts@company.co.uk"
                      value={form.billingEmail} style={inputStyle('billingEmail')}
                      onChange={e => set('billingEmail', e.target.value)} />
                    {errText('billingEmail')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Phone *</label>
                    <input type="text" className="form-input" placeholder="+44 20 7946 0100"
                      value={form.billingPhone} style={inputStyle('billingPhone')} onChange={e => set('billingPhone', e.target.value)} />
                    {errText('billingPhone')}
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label className="form-label">Billing Address *</label>
                    <input type="text" className="form-input" placeholder="e.g. Accounts Payable, Floor 2"
                      value={form.billingAddress} style={inputStyle('billingAddress')} onChange={e => set('billingAddress', e.target.value)} />
                    {errText('billingAddress')}
                  </div>
                </div>
              </div>

              {/* ── OTHER CONTACTS ── */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                {/* Header row with + button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div className="acc-section-title" style={{ marginBottom: 0 }}>
                    <Users size={14} color="#06B6D4" /><span>Other Contacts ({contacts.length})</span>
                  </div>
                </div>

                {contactError && <div className="acc-details-banner acc-banner-error" style={{ marginBottom: '10px' }}><AlertCircle size={14} /><span>{contactError}</span></div>}

                {/* Add contact form — always visible */}
                <div style={{ background: '#F8FAFF', border: '1px solid #E8EDFF', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-input" placeholder="e.g. David Clarke"
                        value={newContact.name}
                        style={{ borderColor: newContactErrors.name ? '#EF4444' : undefined }}
                        onChange={e => { setNewContact(p => ({ ...p, name: e.target.value })); setNewContactErrors(p => ({ ...p, name: null })); }} />
                      {newContactErrors.name && <div style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>{newContactErrors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-input" placeholder="e.g. david@company.co.uk"
                        value={newContact.email}
                        style={{ borderColor: newContactErrors.email ? '#EF4444' : undefined }}
                        onChange={e => { setNewContact(p => ({ ...p, email: e.target.value })); setNewContactErrors(p => ({ ...p, email: null })); }} />
                      {newContactErrors.email && <div style={{ color: '#EF4444', fontSize: '0.72rem', marginTop: '4px' }}>{newContactErrors.email}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="text" className="form-input" placeholder="+44 ..."
                        value={newContact.phone}
                        onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" disabled={contactSubmitting} onClick={handleAddContact}>
                    {contactSubmitting ? <><Loader2 size={13} className="spin-icon" /><span>Adding...</span></> : <><PlusCircle size={13} /><span>Add Contact</span></>}
                  </button>
                </div>

                {/* Contacts list */}
                {contacts.length > 0 && (
                  <div className="acc-contacts-list">
                    {contacts.map(c => (
                      <div key={c._id} className="acc-contact-row">
                        <div className="acc-contact-info">
                          <div className="acc-contact-name">{c.name}</div>
                          <div className="acc-contact-meta"><Mail size={11} /><span>{c.email}</span>{c.phone && <><Phone size={11} /><span>{c.phone}</span></>}</div>
                        </div>
                        <button type="button" className="acc-contact-delete" onClick={() => handleDeleteContact(c._id)} title="Remove contact">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button type="submit" form="acc-details-form" className="btn btn-primary btn-sm" disabled={saving || fetching}>
            {saving ? <><Loader2 size={14} className="spin-icon" /><span>Saving...</span></> : <><Save size={14} /><span>Save Details</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountDetailsModal;
