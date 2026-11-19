import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  Paperclip
} from 'lucide-react';
import '../styles/Modals.css';
import '../styles/AdminDocuments.css';

const AdminDocumentUploadModal = ({ companies = [], defaultCompanyId = '', onClose, onSuccess }) => {
  const [companyId, setCompanyId] = useState(defaultCompanyId || (companies[0]?._id || ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Agreement');
  const [status, setStatus] = useState('Active');
  const [version, setVersion] = useState('1.0');
  const [description, setDescription] = useState('');
  const [visibleToCustomer, setVisibleToCustomer] = useState(true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (defaultCompanyId) {
      setCompanyId(defaultCompanyId);
    } else if (companies.length > 0 && !companyId) {
      setCompanyId(companies[0]._id);
    }
  }, [defaultCompanyId, companies]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Auto-suggest title if empty
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = {};
    if (!companyId) errs.companyId = 'Please select a customer account';
    if (!title.trim() || title.trim().length < 2) errs.title = 'Document title must be at least 2 characters';
    if (!file) errs.file = 'Please select a file to upload';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('companyId', companyId);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('version', version || '1.0');
      formData.append('description', description.trim());
      formData.append('visibleToCustomer', visibleToCustomer);
      if (file) {
        formData.append('file', file);
      }

      const res = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.document);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109, 44, 249, 0.12)', color: '#6D2CF9' }}>
              <Upload size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                Upload Customer Document
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Publish contracts, SLAs, amendments or compliance files
              </p>
            </div>
          </div>

          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {error && (
              <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '14px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Target Company + Title + Version — single row */}
            <div className="modal-grid-3col" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Customer Account*</label>
                <select
                  className="form-select"
                  style={fieldErrors.companyId ? { borderColor: '#EF4444' } : {}}
                  value={companyId}
                  onChange={(e) => { setCompanyId(e.target.value); setFieldErrors(p => ({ ...p, companyId: '' })); }}
                >
                  <option value="">Select customer company...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})
                    </option>
                  ))}
                </select>
                {fieldErrors.companyId && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.companyId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input
                  type="text"
                  className="form-input"
                  style={fieldErrors.title ? { borderColor: '#EF4444' } : {}}
                  placeholder="Document Title"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors(p => ({ ...p, title: '' })); }}
                />
                {fieldErrors.title && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Version</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="modal-grid-2col" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Document Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Agreement">Agreement / Contract</option>
                  <option value="SLA">Service Level Agreement (SLA)</option>
                  <option value="Amendment">Contract Amendment</option>
                  <option value="Compliance">Compliance & ISO Certification</option>
                  <option value="Supporting">Supporting Technical Doc</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Signed">Signed</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* File Dropzone */}
            <div className="form-group">
              <label className="form-label">Document File (PDF, DOCX, ZIP, etc.)</label>
              <div
                className="admin-file-dropzone"
                onClick={() => document.getElementById('admin-doc-file-input').click()}
                style={file ? { background: 'rgba(109,44,249,0.04)', borderColor: '#6D2CF9' } : fieldErrors.file ? { borderColor: '#EF4444' } : {}}
              >
                {file ? (
                  <>
                    <FileText size={28} color="#6D2CF9" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6D2CF9', marginTop: '4px', fontWeight: '600' }}>
                      {formatFileSize(file.size)} · Click to change file
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: '10px', background: '#FEE2E2', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', color: '#EF4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={12} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Paperclip size={13} color="#6D2CF9" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                        Click to select or drag & drop · PDF, DOCX, XLSX, PNG (Max 15MB)
                      </span>
                    </div>
                  </>
                )}
              </div>
              {fieldErrors.file && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.file}</span>}

              <input
                id="admin-doc-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Summary / Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Brief summary of terms, SLA scope or specific conditions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>



          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload & Publish Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDocumentUploadModal;

