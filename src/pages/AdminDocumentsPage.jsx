import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  FileCheck,
  Shield,
  ShieldCheck,
  Lock,
  Layers,
  LayoutList
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AdminDocumentUploadModal from '../components/AdminDocumentUploadModal';
import AdminDocumentEditModal from '../components/AdminDocumentEditModal';
import '../styles/AdminDashboard.css';
import '../styles/AdminDocuments.css';

const AdminDocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCompanyFilter = searchParams.get('companyId') || 'All';

  const [documents, setDocuments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState(initialCompanyFilter);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preselectedCompanyId, setPreselectedCompanyId] = useState('');
  const [editingDoc, setEditingDoc] = useState(null);

  // Notifications
  const [feedback, setFeedback] = useState(null);
  const [docPage, setDocPage] = useState(1);
  const DOC_PER_PAGE = 10;

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies || []);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let url = '/documents?';
      if (companyFilter && companyFilter !== 'All') {
        url += `companyId=${companyFilter}&`;
      }
      if (categoryFilter && categoryFilter !== 'All') {
        url += `category=${categoryFilter}&`;
      }
      if (statusFilter && statusFilter !== 'All') {
        url += `status=${statusFilter}&`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [companyFilter, categoryFilter, statusFilter]);

  const handleToggleVisibility = async (docId, currentTitle) => {
    try {
      const res = await api.patch(`/documents/${docId}/visibility`);
      if (res.data.success) {
        const isNowVisible = res.data.visibleToCustomer;
        setDocuments((prev) =>
          prev.map((d) =>
            d._id === docId ? { ...d, visibleToCustomer: isNowVisible } : d
          )
        );
        setFeedback(
          isNowVisible
            ? `${currentTitle}' is now Visible to Customer in their portal.`
            : `'${currentTitle}' is now Hidden from Customer (Internal Admin only).`
        );

      }
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleDeleteDocument = (docId, title) => {
    setDeleteTarget({ id: docId, title });
  };

  const confirmDeleteDocument = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/documents/${deleteTarget.id}`);
      if (res.data.success) {
        setDocuments(prev => prev.filter(d => d._id !== deleteTarget.id));
        setFeedback(`Document '${deleteTarget.title}' successfully deleted.`);
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to delete document.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc._id}/download`);
      if (res.data.success && res.data.presignedUrl) {
        window.open(res.data.presignedUrl, '_blank');
      } else {
        alert('Could not generate download link.');
      }
    } catch (err) {
      alert('Download failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '145 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Client-side filtering including visibility filter
  const filtered = documents.filter((d) => {
    // Visibility filter
    if (visibilityFilter === 'Visible' && !d.visibleToCustomer) return false;
    if (visibilityFilter === 'Hidden' && d.visibleToCustomer) return false;

    // Search term
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    const titleMatch = d.title?.toLowerCase().includes(s);
    const companyMatch =
      d.company?.primaryUserName?.toLowerCase().includes(s) ||
      d.company?.companyName?.toLowerCase().includes(s) ||
      d.company?.accountNumber?.toLowerCase().includes(s);
    const fileMatch = d.originalName?.toLowerCase().includes(s);
    const catMatch = d.category?.toLowerCase().includes(s);
    return titleMatch || companyMatch || fileMatch || catMatch;
  });

  // Calculate metrics
  const totalDocs = documents.length;
  const agreementCount = documents.filter((d) => d.category === 'Agreement' || d.category === 'SLA').length;
  const visibleCount = documents.filter((d) => d.visibleToCustomer).length;
  const hiddenCount = documents.filter((d) => !d.visibleToCustomer).length;

  const docTotalPages = Math.ceil(filtered.length / DOC_PER_PAGE);
  const paginatedDocs = filtered.slice((docPage - 1) * DOC_PER_PAGE, docPage * DOC_PER_PAGE);

  return (
    <div className="page-container">
      {/* Top Header Row */}
      <div className="admin-docs-header-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
              Customer Documents & Agreements
            </h1>
            <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: 'rgba(109, 44, 249, 0.15)', color: '#6D2CF9', border: '1px solid rgba(109, 44, 249, 0.3)' }}>
              {totalDocs} Documents
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '2px' }}>
            Upload contracts, SLAs, amendments and control customer visibility in their portal.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setPreselectedCompanyId(companyFilter !== 'All' ? companyFilter : '');
            setShowUploadModal(true);
          }}
        >
          <Upload size={14} />
          <span>Upload Customer Document</span>
        </button>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="admin-docs-stat-grid">
        <div className="admin-doc-stat-card">
          <div className="doc-stat-icon-wrapper doc-stat-icon-purple">
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.1 }}>
              {totalDocs}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Total Uploaded
            </div>
          </div>
        </div>

        <div className="admin-doc-stat-card">
          <div className="doc-stat-icon-wrapper doc-stat-icon-cyan">
            <FileCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.1 }}>
              {agreementCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Agreements & SLAs
            </div>
          </div>
        </div>

        <div className="admin-doc-stat-card">
          <div className="doc-stat-icon-wrapper doc-stat-icon-mint">
            <Eye size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#10B981', lineHeight: 1.1 }}>
              {visibleCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Visible to Customers
            </div>
          </div>
        </div>

        <div className="admin-doc-stat-card">
          <div className="doc-stat-icon-wrapper doc-stat-icon-peach">
            <EyeOff size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#FF6633', lineHeight: 1.1 }}>
              {hiddenCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Hidden / Internal Only
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={feedback} type={feedback?.includes('delet') ? 'delete' : 'success'} onClose={() => setFeedback(null)} />

      {/* Controls & Filter Row */}
      <div className="admin-docs-filter-row">
        <div className="admin-docs-filters-left">
          {/* Search Box */}
          <div style={{ position: 'relative', width: '160px' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-select"
              style={{ fontSize: '0.75rem', padding: '5px 8px 5px 26px', width: '100%' }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setDocPage(1); }}
            />
          </div>

          {/* Company Filter */}
          <select
            className="form-select"
            style={{ width: '160px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              if (e.target.value === 'All') {
                searchParams.delete('companyId');
              } else {
                searchParams.set('companyId', e.target.value);
              }
              setSearchParams(searchParams);
            }}
          >
            <option value="All">All Customer Accounts</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ width: '130px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Agreement">Agreements</option>
            <option value="SLA">SLAs</option>
            <option value="Amendment">Amendments</option>
            <option value="Compliance">Compliance</option>
            <option value="Supporting">Supporting</option>
            <option value="Other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: '110px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Signed">Signed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Clear Filters if any applied */}
        {(companyFilter !== 'All' || categoryFilter !== 'All' || statusFilter !== 'All' || visibilityFilter !== 'All' || searchTerm) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCompanyFilter('All');
              setCategoryFilter('All');
              setStatusFilter('All');
              setVisibilityFilter('All');
              setSearchTerm('');
              searchParams.delete('companyId');
              setSearchParams(searchParams);
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Documents Management Table */}
      <div className="vopro-card">
        <div className="table-responsive">
          <table className="vopro-table-compact">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '220px' }}>Document / File Title</th>
                <th style={{ width: '150px' }}>Customer Account</th>
                <th style={{ width: '100px' }}>Category</th>
                <th style={{ width: '160px' }}>File Info</th>
                <th style={{ width: '160px' }}>Customer Visibility</th>
                <th style={{ textAlign: 'right', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Loading customer documents and visibility settings...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No customer documents found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc, idx) => {
                  const catClass = `tag-${(doc.category || 'other').toLowerCase()}`;
                  const isVisible = !!doc.visibleToCustomer;
                  return (
                    <tr key={doc._id}>
                      <td style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {(docPage - 1) * DOC_PER_PAGE + idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={12} color="#6D2CF9" style={{ flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                              <span className="capitalize-first" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{doc.title}</span>
                              <span style={{ fontSize: '0.5625rem', padding: '1px 4px', borderRadius: '4px', background: '#F1F5F9', color: '#475569', fontWeight: '700', flexShrink: 0 }}>
                                v{doc.version || '1.0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer Company */}
                      <td>
                        {doc.company ? (
                          <div
                            style={{ fontWeight: '400', color: 'var(--text-main)', fontSize: '0.6875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            className="capitalize-first"
                            onClick={() => navigate(`/admin/companies/${doc.company._id || doc.company}`)}
                          >
                            {doc.company.primaryUserName || doc.company.companyName}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Global</span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className={`category-tag-badge ${catClass}`}>
                          {doc.category}
                        </span>
                      </td>

                      {/* File Details */}
                      <td>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-main)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                          {doc.originalName || doc.fileName || 'document.pdf'}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                          {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Explicit Interactive Customer Visibility Toggle Switch */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          className={`visibility-switch-pill ${isVisible ? 'is-visible' : 'is-hidden'}`}
                          title={isVisible ? "Click to hide from customer portal" : "Click to publish to customer portal"}
                          onClick={() => handleToggleVisibility(doc._id, doc.title)}
                        >
                          <div className="switch-slider-track">
                            <div className="switch-slider-thumb" />
                          </div>
                        </div>
                      </td>

                      {/* Actions: Download, Edit, Delete */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 7px' }}
                            title="Download document file"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download size={13} style={{ color: '#6D2CF9' }} />
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 7px' }}
                            title="Edit metadata"
                            onClick={() => setEditingDoc(doc)}
                          >
                            <Edit3 size={13} style={{ color: '#6D2CF9' }} />
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 7px', color: '#EF4444' }}
                            title="Delete document"
                            onClick={() => handleDeleteDocument(doc._id, doc.title)}
                          >
                            <Trash2 size={13} />
                          </button>
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
          currentPage={docPage}
          totalPages={docTotalPages}
          totalItems={filtered.length}
          itemsPerPage={DOC_PER_PAGE}
          onPageChange={(p) => setDocPage(p)}
        />
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <AdminDocumentUploadModal
          companies={companies}
          defaultCompanyId={preselectedCompanyId || (companyFilter !== 'All' ? companyFilter : '')}
          onClose={() => {
            setShowUploadModal(false);
            setPreselectedCompanyId('');
          }}
          onSuccess={(newDoc) => {
            setShowUploadModal(false);
            setPreselectedCompanyId('');
            fetchDocuments();
            setFeedback(`Document '${newDoc.title}' uploaded and published successfully.`);
          }}
        />
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <AdminDocumentEditModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSuccess={(updated) => {
            setEditingDoc(null);
            fetchDocuments();
            setFeedback(`Document '${updated.title}' updated successfully.`);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Delete Document"
          subtitle="This action cannot be undone"
          message="Are you sure you want to delete"
          itemName={deleteTarget.title}
          onConfirm={confirmDeleteDocument}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDocumentsPage;
