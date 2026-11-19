import React, { useState } from 'react';
import api from '../services/api';
import {
  X,
  Save,
  FileText,
  AlertCircle,
  Loader2,
  Paperclip,
  Download
} from 'lucide-react';
import '../styles/Modals.css';

const AdminDocumentEditModal = ({ doc, onClose, onSuccess }) => {
  const [title, setTitle] = useState(doc?.title || '');
  const [category, setCategory] = useState(doc?.category || 'Agreement');
  const [status, setStatus] = useState(doc?.status || 'Active');
  const [version, setVersion] = useState(doc?.version || '1.0');
  const [description, setDescription] = useState(doc?.description || '');
  const [visibleToCustomer, setVisibleToCustomer] = useState(doc?.visibleToCustomer ?? true);
  const [newFile, setNewFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errs = {};
    if (!title.trim() || title.trim().length < 2) {
      errs.title = 'Document title must be at least 2 characters';
    }
    if (!version.trim()) {
      errs.version = 'Document version is required';
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('status', status);
      formData.append('version', version.trim());
      formData.append('description', description.trim());
      formData.append('visibleToCustomer', visibleToCustomer);
      if (newFile) formData.append('file', newFile);

      const res = await api.put(`/documents/${doc._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.document);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update document details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109, 44, 249, 0.12)', color: '#6D2CF9' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                Edit Document Metadata
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {doc?.company?.primaryUserName || doc?.company?.billingContact?.name || doc?.company?.companyName || 'Update document classification & customer visibility'}
              </p>
            </div>
          </div>

          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '14px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="modal-grid-2col" style={{ marginBottom: '12px' }}>
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
                  style={fieldErrors.version ? { borderColor: '#EF4444' } : {}}
                  placeholder="1.0"
                  value={version}
                  onChange={(e) => { setVersion(e.target.value); setFieldErrors(p => ({ ...p, version: '' })); }}
                />
                {fieldErrors.version && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.version}</span>}
              </div>
            </div>

            <div className="modal-grid-2col" style={{ marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Agreement">Agreement / Contract</option>
                  <option value="SLA">Service Level Agreement (SLA)</option>
                  <option value="Amendment">Contract Amendment</option>
                  <option value="Compliance">Compliance & ISO</option>
                  <option value="Supporting">Supporting Technical Doc</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
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

            {/* File Box */}
            <div className="form-group">
              <label className="form-label">Document File</label>
              <div
                className="admin-file-dropzone"
                onClick={() => document.getElementById('edit-doc-file-input').click()}
                style={newFile ? { background: 'rgba(109,44,249,0.04)', borderColor: '#6D2CF9' } : {}}
              >
                {newFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={13} color="#6D2CF9" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newFile.name}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#6D2CF9', flexShrink: 0 }}>{formatFileSize(newFile.size)}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setNewFile(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: 0 }}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={13} color="#6D2CF9" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc?.originalName || doc?.fileName || 'No file attached'}
                    </span>
                    {doc?.fileSize && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>{formatFileSize(doc.fileSize)}</span>
                    )}
                    <span style={{ fontSize: '0.6875rem', color: '#6D2CF9', flexShrink: 0, fontWeight: '600' }}>Replace</span>
                  </div>
                )}
              </div>
              <input id="edit-doc-file-input" type="file" style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files[0]) setNewFile(e.target.files[0]); }} />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Scope</label>
              <textarea
                className="form-textarea"
                rows={2}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDocumentEditModal;

