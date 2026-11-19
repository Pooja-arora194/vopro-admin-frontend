import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  PlusCircle,
  Search,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  History,
  StickyNote,
  UploadCloud,
  FileText
} from 'lucide-react';
import EditCustomerModal from '../components/EditCustomerModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AdminDocumentUploadModal from '../components/AdminDocumentUploadModal';
import InternalNoteModal from '../components/InternalNoteModal';
import CompanyActivityModal from '../components/CompanyActivityModal';
import CompanyDocumentsModal from '../components/CompanyDocumentsModal';
import AdminAccountDetailsModal from '../components/AdminAccountDetailsModal';
import Toast from '../components/Toast';
import AdminAccountEditModal from '../components/AdminAccountEditModal';
import Pagination from '../components/Pagination';
import '../styles/AdminDashboard.css';
import '../styles/Modals.css';

const AdminCompaniesPage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit Modal State (Edit opens in modal)
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, companyName }

  // Upload Document Modal
  const [uploadDocCompany, setUploadDocCompany] = useState(null);
  // Note Modal
  const [noteCompany, setNoteCompany] = useState(null);
  // Activity Modal
  const [activityCompany, setActivityCompany] = useState(null);
  const [docsCompany, setDocsCompany] = useState(null);
  const [detailsCompany, setDetailsCompany] = useState(null);
  const [compPage, setCompPage] = useState(1);
  const COMP_PER_PAGE = 10;
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => setToast({ msg, type });
  const [formErrors, setFormErrors] = useState({});

  // Form state for creating new company
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPassword, setContactPassword] = useState('');
  const [contactStatus, setContactStatus] = useState('Active');
  const [contactPhone, setContactPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const errs = {};
    if (!contactName.trim() || contactName.trim().length < 2) errs.contactName = 'Name must be at least 2 characters';
    if (!contactEmail.trim()) errs.contactEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) errs.contactEmail = 'Email is invalid';
    if (!contactPassword.trim() || contactPassword.length < 6) errs.contactPassword = 'Password must be at least 6 characters';
    if (!contactPhone.trim()) errs.contactPhone = 'Contact number is required';
    else if (!/^[\d\s+\-]{7,}$/.test(contactPhone.trim())) errs.contactPhone = 'Enter a valid phone number (min 7 digits)';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setCreateLoading(true);
    try {
      const res = await api.post('/admin/companies', {
        companyName: contactName,
        contactName,
        contactEmail,
        contactPassword,
        contactStatus,
        contactPhone,
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setFormErrors({});
        setCompanyName('');
        setContactName(''); setContactEmail('');
        setContactPassword('');
        setContactStatus('Active');
        setContactPhone('');
        fetchCompanies();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create customer account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSetStatus = async (companyId, newStatus) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/status`, { status: newStatus });
      if (res.data.success) {
        setCompanies(prev => prev.map(c =>
          c._id === companyId ? { ...c, accountStatus: newStatus } : c
        ));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteCompany = (companyId, companyName) => {
    setDeleteTarget({ _id: companyId, companyName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/companies/${deleteTarget._id}`);
      setCompanies(prev => prev.filter(c => c._id !== deleteTarget._id));
      showToast(`${deleteTarget.companyName} deleted successfully.`, 'delete');
    } catch (err) {
      console.error('Failed to delete company:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = companies.filter((c) =>
    (c.primaryUserName && c.primaryUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.accountNumber && c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / COMP_PER_PAGE);
  const paginated = filtered.slice((compPage - 1) * COMP_PER_PAGE, compPage * COMP_PER_PAGE);

  return (
    <div className="page-container">
      {/* Header and Controls */}
      <div className="page-header-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              Customer Accounts
            </h1>
            <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(109, 44, 249, 0.15)', color: '#6D2CF9', border: '1px solid rgba(109, 44, 249, 0.3)' }}>
              {companies.length} Accounts
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '2px' }}>
            Manage customer accounts and internal information.
          </p>
        </div>

        {/* Compact Right Controls: Search + Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="search-input-box" style={{ width: '180px', minWidth: '140px' }}>
            <Search size={13} className="search-icon-inside" />
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.75rem', padding: '5px 8px 5px 28px', height: 'auto' }}
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCompPage(1); }}
            />
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <PlusCircle size={14} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Customer Accounts Table */}
      <div className="vopro-card">
        <div className="table-responsive">
          <table className="vopro-table-compact">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '220px' }}>Customer</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Loading customer accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No customer accounts found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                paginated.map((comp) => {
                  const isActive = comp.accountStatus === 'Active';
                  return (
                    <tr key={comp._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/companies/${comp._id}`)}>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {(compPage - 1) * COMP_PER_PAGE + paginated.indexOf(comp) + 1}
                      </td>{/* Customer ID + Name combined */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {/* Name + (ID) on one line */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.8125rem' }} className="capitalize-first">
                              {comp.primaryUserName || comp.companyName || '—'}
                            </span>
                          </div>
                          {/* Icons just below */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} onClick={e => e.stopPropagation()}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px' }}
                              title="Activity"
                              onClick={() => setActivityCompany(comp)}
                            >
                              <History size={11} style={{ color: '#6D2CF9' }} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px' }}
                              title="Upload Document"
                              onClick={() => setUploadDocCompany(comp)}
                            >
                              <UploadCloud size={11} style={{ color: '#0891B2' }} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px' }}
                              title="Notes"
                              onClick={() => setNoteCompany(comp)}
                            >
                              <StickyNote size={11} style={{ color: '#EA580C' }} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px' }}
                              title="Documents"
                              onClick={() => setDocsCompany(comp)}
                            >
                              <FileText size={11} style={{ color: '#0891B2' }} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {(() => {
                            const e = comp.primaryUserEmail || comp.billingContact?.email || '—';
                            return e === '—' ? e : e.charAt(0).toUpperCase() + e.slice(1);
                          })()}
                        </span>
                      </td>

                      {/* Contact Number */}
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {comp.primaryUserPhone || comp.phone || comp.billingContact?.phone || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-pill ${isActive ? 'status-active' : 'status-inactive'}`}>
                          <span className="status-dot" />
                          <span>{comp.accountStatus}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="View Account"
                            onClick={() => navigate(`/admin/companies/${comp._id}`)}
                          >
                            <Eye size={13} style={{ color: '#6D2CF9' }} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="Edit Account"
                            onClick={() => setEditingCompanyId(comp._id)}
                          >
                            <Edit3 size={13} style={{ color: '#6D2CF9' }} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="Add Account Details"
                            onClick={() => setDetailsCompany(comp)}
                          >
                            <PlusCircle size={13} style={{ color: '#7C3AED' }} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="Delete Customer"
                            onClick={() => handleDeleteCompany(comp._id, comp.primaryUserName || comp.companyName)}
                          >
                            <Trash2 size={13} style={{ color: '#EF4444' }} />
                          </button>
                          <div className="status-switch-group" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`status-switch-btn ${isActive ? 'btn-is-active' : ''}`}
                              onClick={() => !isActive && handleSetStatus(comp._id, 'Active')}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              className={`status-switch-btn ${!isActive ? 'btn-is-inactive' : ''}`}
                              onClick={() => isActive && handleSetStatus(comp._id, 'Inactive')}
                            >
                              Inactive
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={compPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={COMP_PER_PAGE}
          onPageChange={(p) => setCompPage(p)}
        />
      </div>
      {editingCompanyId && (
        <EditCustomerModal
          companyId={editingCompanyId}
          company={companies.find(c => c._id === editingCompanyId)}
          onClose={() => setEditingCompanyId(null)}
          onSuccess={(updated) => {
            if (updated) {
              setCompanies(prev => prev.map(c =>
                c._id === updated._id ? { ...c, ...updated } : c
              ));
            }
            setEditingCompanyId(null);
            showToast('Customer details updated successfully.');
          }}
          onRefresh={fetchCompanies}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          customerName={deleteTarget.companyName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Upload Document Modal */}
      {uploadDocCompany && (
        <AdminDocumentUploadModal
          companies={companies}
          defaultCompanyId={uploadDocCompany._id}
          onClose={() => setUploadDocCompany(null)}
          onSuccess={() => { setUploadDocCompany(null); showToast('Document uploaded successfully.'); }}
        />
      )}

      {/* Documents Modal */}
      {docsCompany && (
        <CompanyDocumentsModal
          company={docsCompany}
          companies={companies}
          onClose={() => setDocsCompany(null)}
        />
      )}

      {/* Activity Modal */}
      {activityCompany && (
        <CompanyActivityModal
          company={activityCompany}
          onClose={() => setActivityCompany(null)}
        />
      )}

      {/* Note Modal */}
      {noteCompany && (
        <InternalNoteModal
          companyId={noteCompany._id}
          companies={companies}
          onClose={() => setNoteCompany(null)}
          onSuccess={(_, msg) => { setNoteCompany(null); showToast(msg || 'Note saved successfully.'); }}
        />
      )}

      {/* Account Details Modal */}
      {detailsCompany && (
        <AdminAccountDetailsModal
          companyId={detailsCompany._id}
          company={detailsCompany}
          onClose={() => setDetailsCompany(null)}
          onSuccess={(updated) => {
            if (updated) setCompanies(prev => prev.map(c => c._id === updated._id ? { ...c, ...updated } : c));
            setDetailsCompany(null);
            showToast('Account details saved successfully.');
          }}
        />
      )}

      {/* Toast */}
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />

      {/* Simple Add Customer Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-main)' }}>Add Customer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Create a new customer account</div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>

            {createError && (
              <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', margin: '14px 16px 0' }}>
                <AlertCircle size={14} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCompany}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text" className="form-input"
                    style={formErrors.contactName ? { borderColor: '#EF4444' } : {}}
                    placeholder="e.g. John Davis"
                    value={contactName}
                    onChange={(e) => { setContactName(e.target.value); setFormErrors(p => ({ ...p, contactName: '' })); }}
                  />
                  {formErrors.contactName && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.contactName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="text" className="form-input"
                    style={formErrors.contactEmail ? { borderColor: '#EF4444' } : {}}
                    placeholder="e.g. john@acmetelecom.co.uk"
                    value={contactEmail}
                    onChange={(e) => { setContactEmail(e.target.value); setFormErrors(p => ({ ...p, contactEmail: '' })); }}
                  />
                  {formErrors.contactEmail && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.contactEmail}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={formErrors.contactPassword ? { borderColor: '#EF4444', paddingRight: '40px' } : { paddingRight: '40px' }}
                      placeholder="Min. 6 characters"
                      value={contactPassword}
                      onChange={(e) => { setContactPassword(e.target.value); setFormErrors(p => ({ ...p, contactPassword: '' })); }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {formErrors.contactPassword && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.contactPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={contactStatus} onChange={(e) => setContactStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Invited">Invited</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text" className="form-input"
                    style={formErrors.contactPhone ? { borderColor: '#EF4444' } : {}}
                    placeholder="e.g. +44 121 496 0888"
                    value={contactPhone}
                    onChange={(e) => { setContactPhone(e.target.value); setFormErrors(p => ({ ...p, contactPhone: '' })); }}
                  />
                  {formErrors.contactPhone && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.contactPhone}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <Loader2 size={14} className="spin-icon" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesPage;
