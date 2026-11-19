import React from 'react';
import { X, FileText, Download, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import StatusBadge from './StatusBadge';
import '../styles/Modals.css';

const DocumentModal = ({ doc, onClose, onToggleVisibility, isAdmin = false }) => {
  if (!doc) return null;

  const handleDownload = () => {
    window.open(`/api/documents/${doc._id}/download`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box modal-header-icon-primary">
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                {doc.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <StatusBadge status={doc.status} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Version {doc.version || '1.0'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Grid */}
          <div className="modal-highlight-box modal-grid-2col">
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Category
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {doc.category}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                File Size
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {(doc.fileSize / 1024).toFixed(1)} KB
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Effective Date
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {new Date(doc.effectiveDate || doc.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Customer Visibility
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '700',
                fontSize: '0.8125rem',
                color: doc.visibleToCustomer ? 'var(--success)' : 'var(--text-muted)',
                marginTop: '2px'
              }}>
                {doc.visibleToCustomer ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{doc.visibleToCustomer ? 'Published to Customer' : 'Internal Only'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              Document Summary & Scope:
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {doc.description || 'Official contract documentation issued and governed under the laws of England and Wales.'}
            </p>
          </div>

          {/* Verification Badge */}
          <div className="scan-progress-banner scan-progress-clean">
            <ShieldCheck size={20} color="var(--success)" />
            <div style={{ fontSize: '0.75rem', color: '#065F46' }}>
              <strong>VoPro Certified Document:</strong> Digitally signed and archived in encrypted compliance vault.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isAdmin && onToggleVisibility && (
            <button
              className="btn btn-secondary"
              onClick={() => onToggleVisibility(doc._id)}
              style={{ marginRight: 'auto' }}
            >
              {doc.visibleToCustomer ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{doc.visibleToCustomer ? 'Hide from Customer' : 'Make Visible to Customer'}</span>
            </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            <span>Download Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
