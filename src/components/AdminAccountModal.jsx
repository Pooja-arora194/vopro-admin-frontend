import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  X,
  Edit3,
  Eye,
  Users,
  History,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  StickyNote,
  PlusCircle,
  Briefcase,
  FileText
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import '../styles/AdminAccountModal.css';

const AdminAccountModal = ({ companyId, initialTab = 'overview', onClose, onCompanyUpdated }) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Loaded data
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    registrationNumber: '',
    vatNumber: '',
    phone: '',
    website: '',
    accountStatus: 'Active',
    servicePlan: '',
    renewalDate: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    accountManagerName: '',
    accountManagerEmail: '',
    accountManagerPhone: ''
  });

  const [saveLoading, setSaveLoading] = useState(false);

  // Add Contact Form State
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    role: 'customer_user',
    isBillingContact: false,
    isPrimaryContact: false,
    isAuthorizedSignatory: false
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState(null);

  const populateFromCompany = (c, contactsList = [], statsObj = null) => {
    setCompany(c);
    setContacts(contactsList);
    setStats(statsObj);

    // Pre-populate edit form
    setFormData({
      companyName: c.companyName || '',
      industry: c.industry || 'Telecommunications & Business Services',
      registrationNumber: c.registrationNumber || '',
      vatNumber: c.vatNumber || '',
      phone: c.phone || '',
      website: c.website || '',
      accountStatus: c.accountStatus || 'Active',
      servicePlan: c.servicePlan || 'VoPro Enterprise VoIP & Unified Comms',
      renewalDate: c.renewalDate ? new Date(c.renewalDate).toISOString().split('T')[0] : '',
      street: c.address?.street || '',
      city: c.address?.city || '',
      state: c.address?.state || '',
      postalCode: c.address?.postalCode || '',
      country: c.address?.country || 'United Kingdom',
      billingName: c.billingContact?.name || '',
      billingEmail: c.billingContact?.email || '',
      billingPhone: c.billingContact?.phone || '',
      billingAddress: c.billingContact?.address || '',
      accountManagerName: c.accountManager?.name || 'VoPro Enterprise Support',
      accountManagerEmail: c.accountManager?.email || 'accounts@vopro.co.uk',
      accountManagerPhone: c.accountManager?.phone || '+44 (0) 20 7946 0199'
    });
  };

  const fetchDetails = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/admin/companies/${companyId}`);
        if (res.data.success) {
          populateFromCompany(res.data.company, res.data.contacts || [], res.data.stats || null);
          return;
        }
      } catch (adminErr) {
        // Fallback to /companies/:id if backend server hasn't reloaded admin routes yet
        if (adminErr.response?.status === 404) {
          const fallbackRes = await api.get(`/companies/${companyId}`);
          if (fallbackRes.data.success) {
            populateFromCompany(fallbackRes.data.company, fallbackRes.data.contacts || [], null);
            return;
          }
        }
        throw adminErr;
      }
    } catch (err) {
      console.error('Failed to load company details:', err);
      setError(err.response?.data?.message || 'Failed to load company details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [companyId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let res;
      try {
        res = await api.put(`/admin/companies/${companyId}`, formData);
      } catch (putErr) {
        if (putErr.response?.status === 404) {
          // Fallback to /companies/:id/permitted-info + /admin/companies/:id/status
          res = await api.put(`/companies/${companyId}/permitted-info`, {
            phone: formData.phone,
            website: formData.website,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            billingName: formData.billingName,
            billingEmail: formData.billingEmail,
            billingPhone: formData.billingPhone,
            billingAddress: formData.billingAddress
          });
          if (formData.accountStatus || formData.servicePlan) {
            await api.patch(`/admin/companies/${companyId}/status`, {
              status: formData.accountStatus,
              servicePlan: formData.servicePlan
            }).catch(() => {});
          }
        } else {
          throw putErr;
        }
      }

      if (res?.data?.success) {
        setCompany(res.data.company);
        if (res.data.contacts) setContacts(res.data.contacts);
        setSuccessMessage(res.data.message || 'Account information successfully updated and audit logged.');
        if (onCompanyUpdated) {
          onCompanyUpdated(res.data.company);
        }
        setTimeout(() => {
          setActiveTab('overview');
        }, 900);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save account updates.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const res = await api.post(`/companies/${companyId}/contacts`, newContact);
      if (res.data.success) {
        setShowAddContact(false);
        setNewContact({
          name: '',
          email: '',
          phone: '',
          jobTitle: '',
          department: '',
          role: 'customer_user',
          isBillingContact: false,
          isPrimaryContact: false,
          isAuthorizedSignatory: false
        });
        fetchDetails();
      }
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to add authorized contact.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!company) return;
    const nextStatus = company.accountStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await api.patch(`/admin/companies/${company._id}/status`, { status: nextStatus });
      if (res.data.success) {
        setCompany(res.data.company);
        setFormData((prev) => ({ ...prev, accountStatus: nextStatus }));
        if (onCompanyUpdated) onCompanyUpdated(res.data.company);
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  return (
    <div className="admin-account-modal-overlay" onClick={onClose}>
      <div className="admin-account-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="admin-modal-top-bar">
          <div className="admin-modal-company-title">
            <div className="admin-company-avatar-box">
              <Building2 size={22} />
            </div>
            <div>
              <div className="admin-modal-title-text">
                <span>{company?.companyName || 'Loading Account...'}</span>
                {company?.accountNumber && (
                  <span className="account-tag">{company.accountNumber}</span>
                )}
                {company && <StatusBadge status={company.accountStatus} />}
              </div>
              <div className="admin-modal-meta-row">
                <span>{company?.industry || 'Customer Account'}</span>
                <span>•</span>
                <span>Created {company ? new Date(company.createdAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              title="Open Internal Notes for this Account"
              onClick={() => {
                onClose();
                navigate(`/admin/notes?companyId=${companyId}`);
              }}
            >
              <StickyNote size={14} style={{ color: '#FF6633' }} />
              <span>Notes</span>
            </button>
            <button className="btn-close" onClick={onClose} title="Close window">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-modal-tabs">
          <button
            className={`admin-modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Eye size={15} />
            <span>Account Overview</span>
          </button>

          <button
            className={`admin-modal-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 size={15} />
            <span>Update Account Info</span>
          </button>

          <button
            className={`admin-modal-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={15} />
            <span>Authorized Contacts</span>
            {contacts.length > 0 && (
              <span className="admin-tab-count-badge">{contacts.length}</span>
            )}
          </button>

          <button
            className={`admin-modal-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={15} />
            <span>Audit Trail</span>
            {company?.contactHistory?.length > 0 && (
              <span className="admin-tab-count-badge">{company.contactHistory.length}</span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="admin-modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Loader2 size={24} className="spin-icon" style={{ margin: '0 auto 12px' }} />
              <div>Loading customer account profile...</div>
            </div>
          ) : error && !company ? (
            <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Feedback Notifications */}
              {successMessage && (
                <div className="scan-progress-banner" style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success-border)', marginBottom: '16px' }}>
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger-border)', marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW (VIEW MODE) */}
              {activeTab === 'overview' && (
                <div>
                  {/* Top Highlight Banner */}
                  <div className="admin-plan-highlight-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <div className="admin-plan-badge">Service Plan & Provisioning</div>
                      <div className="admin-plan-title">{company?.servicePlan}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#6D2CF9" />
                        <span>Contract Renewal: <strong>{company?.renewalDate ? new Date(company.renewalDate).toLocaleDateString() : 'Annual'}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('edit')}
                      >
                        <Edit3 size={14} />
                        <span>Edit Account Information</span>
                      </button>

                      <button
                        className={`btn btn-sm ${company?.accountStatus === 'Active' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={handleStatusToggle}
                      >
                        {company?.accountStatus === 'Active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </div>
                  </div>

                  {/* Resource Counts Quick Bar */}
                  {stats && (
                    <div className="admin-stats-pills-row" style={{ marginBottom: '20px' }}>
                      <div className="admin-stat-pill">
                        <FileText size={14} color="#6D2CF9" />
                        <span>Documents: <strong>{stats.documentCount}</strong></span>
                      </div>
                      <div className="admin-stat-pill">
                        <CreditCard size={14} color="#10B981" />
                        <span>Invoices: <strong>{stats.invoiceCount}</strong></span>
                      </div>
                      <div className="admin-stat-pill">
                        <Users size={14} color="#06B6D4" />
                        <span>Authorized Contacts: <strong>{contacts.length}</strong></span>
                      </div>
                      <div className="admin-stat-pill">
                        <StickyNote size={14} color="#FF6633" />
                        <span>Internal Notes: <strong>{stats.noteCount}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* 2-Column Information Layout */}
                  <div className="admin-view-grid-2col">
                    {/* Left: Registered Company Details & Office Address */}
                    <div className="admin-view-section-card">
                      <div className="admin-section-header">
                        <div className="admin-section-title">
                          <Building2 size={16} color="#6D2CF9" />
                          <span>Corporate & Registered Details</span>
                        </div>
                      </div>

                      <div className="admin-details-dl">
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Legal Name</span>
                          <span className="admin-detail-value">{company?.companyName}</span>
                        </div>

                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Industry</span>
                          <span className="admin-detail-value">{company?.industry || 'Telecommunications'}</span>
                        </div>

                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Registration No. (CRN)</span>
                          <span className="admin-detail-value admin-detail-value-mono">
                            {company?.registrationNumber || 'Not specified'}
                          </span>
                        </div>

                        <div className="admin-detail-item">
                          <span className="admin-detail-label">VAT Number</span>
                          <span className="admin-detail-value admin-detail-value-mono">
                            {company?.vatNumber || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(109, 44, 249, 0.08)' }}>
                        <span className="admin-detail-label">Office Location & Contact</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', fontSize: '0.8125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={14} color="#6D2CF9" />
                            <span>{company?.phone || 'No telephone registered'}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={14} color="#6D2CF9" />
                            {company?.website ? (
                              <a href={company.website} target="_blank" rel="noreferrer" style={{ color: '#6D2CF9', textDecoration: 'none', fontWeight: '600' }}>
                                {company.website}
                              </a>
                            ) : (
                              <span>No corporate website</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <MapPin size={14} color="#6D2CF9" style={{ marginTop: '2px' }} />
                            <span>
                              {[company?.address?.street, company?.address?.city, company?.address?.postalCode, company?.address?.country]
                                .filter(Boolean)
                                .join(', ') || 'No address registered'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Accounts Payable & VoPro Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Billing Contact */}
                      <div className="admin-view-section-card">
                        <div className="admin-section-header">
                          <div className="admin-section-title">
                            <CreditCard size={16} color="#10B981" />
                            <span>Accounts Payable / Billing</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                          <div>
                            <span className="admin-detail-label">Billing Contact Officer</span>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                              {company?.billingContact?.name || 'Accounts Department'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                            <Mail size={14} color="var(--text-muted)" />
                            <span>{company?.billingContact?.email || 'accounts@company.co.uk'}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                            <Phone size={14} color="var(--text-muted)" />
                            <span>{company?.billingContact?.phone || company?.phone || '—'}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                            <span>{company?.billingContact?.address || company?.address?.street || 'Accounts Payable Dept'}</span>
                          </div>
                        </div>
                      </div>

                      {/* VoPro Account Manager */}
                      <div className="admin-view-section-card">
                        <div className="admin-section-header">
                          <div className="admin-section-title">
                            <Briefcase size={16} color="#FF6633" />
                            <span>VoPro Account Manager</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                            {company?.accountManager?.name || 'VoPro Enterprise Support'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {company?.accountManager?.email || 'accounts@vopro.co.uk'} • {company?.accountManager?.phone || '+44 (0) 20 7946 0199'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPDATE ACCOUNT INFORMATION (EDIT MODE) */}
              {activeTab === 'edit' && (
                <form onSubmit={handleSaveAccount}>
                  {/* Section A: Company Registration */}
                  <div className="admin-edit-form-section">
                    <div className="admin-edit-form-section-title">
                      <Building2 size={16} />
                      <span>1. Corporate Identity & Registration</span>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group">
                        <label className="form-label">Company Legal Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Industry / Sector</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Telecommunications & Unified Cloud"
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group">
                        <label className="form-label">Company Registration Number (CRN)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. UK-08492019"
                          value={formData.registrationNumber}
                          onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">VAT Registration Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. GB 928 3491 80"
                          value={formData.vatNumber}
                          onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Office Location & Main Switchboard */}
                  <div className="admin-edit-form-section">
                    <div className="admin-edit-form-section-title">
                      <MapPin size={16} />
                      <span>2. Office Address & Main Contact</span>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group">
                        <label className="form-label">Main Telephone</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. +44 121 496 0888"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Corporate Website</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. https://company.co.uk"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 12 Corporate Way"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                    </div>

                    <div className="form-grid-3col">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. London"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. EC1A 1BB"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section C: Service Plan & Status */}
                  <div className="admin-edit-form-section">
                    <div className="admin-edit-form-section-title">
                      <ShieldCheck size={16} />
                      <span>3. Provisioning Plan & Account Status</span>
                    </div>

                    <div className="form-grid-3col">
                      <div className="form-group">
                        <label className="form-label">Account Status</label>
                        <select
                          className="form-select"
                          value={formData.accountStatus}
                          onChange={(e) => handleInputChange('accountStatus', e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Service Plan</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.servicePlan}
                          onChange={(e) => handleInputChange('servicePlan', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Renewal Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.renewalDate}
                          onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section D: Billing & Accounts Payable */}
                  <div className="admin-edit-form-section">
                    <div className="admin-edit-form-section-title">
                      <CreditCard size={16} />
                      <span>4. Accounts Payable & Billing Contact</span>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group">
                        <label className="form-label">Billing Contact Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.billingName}
                          onChange={(e) => handleInputChange('billingName', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Billing Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.billingEmail}
                          onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group">
                        <label className="form-label">Billing Direct Telephone</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.billingPhone}
                          onChange={(e) => handleInputChange('billingPhone', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Billing Address / Department</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section E: VoPro Account Manager */}
                  <div className="admin-edit-form-section">
                    <div className="admin-edit-form-section-title">
                      <Briefcase size={16} />
                      <span>5. Assigned VoPro Account Manager</span>
                    </div>

                    <div className="form-grid-3col">
                      <div className="form-group">
                        <label className="form-label">Manager Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.accountManagerName}
                          onChange={(e) => handleInputChange('accountManagerName', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Manager Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.accountManagerEmail}
                          onChange={(e) => handleInputChange('accountManagerEmail', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Manager Phone</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.accountManagerPhone}
                          onChange={(e) => handleInputChange('accountManagerPhone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Footer Bar inside form */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('overview')}
                      disabled={saveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 size={16} className="spin-icon" />
                          <span>Saving Changes & Recording Audit...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save & Update Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: AUTHORIZED CONTACTS */}
              {activeTab === 'contacts' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800' }}>
                        Customer Portal Authorized Users
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Staff members authorized to log in, view invoices, download contracts, and submit files for this account.
                      </p>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowAddContact(!showAddContact)}
                    >
                      <PlusCircle size={14} />
                      <span>{showAddContact ? 'Cancel' : 'Add Authorized Contact'}</span>
                    </button>
                  </div>

                  {/* Add Contact Inline Form */}
                  {showAddContact && (
                    <form onSubmit={handleAddContactSubmit} className="admin-edit-form-section" style={{ background: '#F8F9FD', marginBottom: '18px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.8125rem', marginBottom: '12px', color: '#6D2CF9' }}>
                        New Authorized Contact Information
                      </div>

                      {contactError && (
                        <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '12px' }}>
                          <AlertCircle size={14} />
                          <span>{contactError}</span>
                        </div>
                      )}

                      <div className="form-grid-2col">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g. Sarah Jenkins"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email Address *</label>
                          <input
                            type="email"
                            required
                            className="form-input"
                            placeholder="e.g. sarah@company.co.uk"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-grid-3col">
                        <div className="form-group">
                          <label className="form-label">Direct Phone</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="+44 7700 900077"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Job Title</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. IT Director"
                            value={newContact.jobTitle}
                            onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Department</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Infrastructure"
                            value={newContact.department}
                            onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '20px', margin: '10px 0 14px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newContact.isPrimaryContact}
                            onChange={(e) => setNewContact({ ...newContact, isPrimaryContact: e.target.checked })}
                          />
                          <span>Primary Account Contact</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newContact.isBillingContact}
                            onChange={(e) => setNewContact({ ...newContact, isBillingContact: e.target.checked })}
                          />
                          <span>Billing / Invoicing Contact</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newContact.isAuthorizedSignatory}
                            onChange={(e) => setNewContact({ ...newContact, isAuthorizedSignatory: e.target.checked })}
                          />
                          <span>Authorized Signatory</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowAddContact(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={contactSubmitting}
                        >
                          {contactSubmitting ? 'Saving...' : 'Add Contact'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Contacts List */}
                  {contacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No authorized contacts registered for this customer account.
                    </div>
                  ) : (
                    contacts.map((c) => (
                      <div key={c._id} className="admin-contact-item-card">
                        <div className="admin-contact-main-info">
                          <div className="admin-contact-avatar">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="admin-contact-name-title">
                              <span>{c.name}</span>
                              {c.isPrimaryContact && (
                                <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(109, 44, 249, 0.15)', color: '#6D2CF9', fontWeight: '700' }}>
                                  Primary
                                </span>
                              )}
                              {c.isBillingContact && (
                                <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: '700' }}>
                                  Billing
                                </span>
                              )}
                              {c.isAuthorizedSignatory && (
                                <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 102, 51, 0.15)', color: '#FF6633', fontWeight: '700' }}>
                                  Signatory
                                </span>
                              )}
                            </div>
                            <div className="admin-contact-meta">
                              <span>{c.email}</span>
                              {c.phone && <span>• {c.phone}</span>}
                              {c.jobTitle && <span>• {c.jobTitle}</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                            {c.role === 'customer_admin' ? 'Customer Admin' : 'Customer User'}
                          </span>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: AUDIT TRAIL & CHANGE HISTORY */}
              {activeTab === 'history' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800' }}>
                      Permanent Account Change Audit Trail
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Every amendment made to this account by customers or VoPro administration is recorded here with timestamp and author.
                    </p>
                  </div>

                  <div className="table-responsive" style={{ border: '1px solid rgba(109, 44, 249, 0.12)', borderRadius: '10px' }}>
                    <table className="admin-audit-table">
                      <thead>
                        <tr>
                          <th style={{ width: '150px' }}>Timestamp</th>
                          <th>Field / Modified Target</th>
                          <th>Previous Value</th>
                          <th>Updated Value</th>
                          <th>Amended By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company?.contactHistory && company.contactHistory.length > 0 ? (
                          [...company.contactHistory].reverse().map((hist, idx) => (
                            <tr key={idx}>
                              <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {new Date(hist.changedAt).toLocaleString()}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--text-main)' }}>{hist.field}</strong>
                              </td>
                              <td style={{ color: '#94A3B8' }}>{hist.oldValue || '—'}</td>
                              <td style={{ color: '#6D2CF9', fontWeight: '600' }}>{hist.newValue}</td>
                              <td>
                                <span style={{ fontSize: '0.6875rem', padding: '2px 6px', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <UserCheck size={11} />
                                  {hist.changedBy}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                              No modification history recorded yet for this customer account.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="admin-modal-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Account ID: <strong style={{ color: '#6D2CF9' }}>{company?.accountNumber || '—'}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Window
            </button>
            {activeTab !== 'edit' ? (
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('edit')}>
                <Edit3 size={14} />
                <span>Edit Account</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountModal;

