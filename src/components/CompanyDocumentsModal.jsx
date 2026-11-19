import React, { useEffect, useState } from 'react';
import { X, FileText, Loader2, Eye, Clock, Upload } from 'lucide-react';
import api from '../services/api';
import AdminDocumentUploadModal from './AdminDocumentUploadModal';
import '../styles/Modals.css';

const categoryColors = {
  Agreement:   { bg: 'rgba(109,44,249,0.08)', color: '#6D2CF9' },
  SLA:         { bg: 'rgba(6,182,212,0.08)',  color: '#0891B2' },
  Amendment:   { bg: 'rgba(255,102,51,0.08)', color: '#EA580C' },
  Compliance:  { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
  Supporting:  { bg: 'rgba(100,116,139,0.08)',color: '#475569' },
  Other:       { bg: '#F1F5F9',               color: '#64748B' },
};

const CompanyDocumentsModal = ({ company, companies = [], onClose }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documents?companyId=${company._id}`);
      if (res.data.success) setDocs(res.data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [company._id]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="modal-header-icon-box" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891B2' }}>
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Documents</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(() => { const n = company.primaryUserName || company.companyName || ''; return n ? n.charAt(0).toUpperCase() + n.slice(1) : ''; })()}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="spin-icon" color="#0891B2" />
                <span>Loading documents...</span>
              </div>
            ) : docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '12px' }}>No documents yet</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
                  <Upload size={13} /><span>Upload Document</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {docs.map(doc => {
                  const cat = categoryColors[doc.category] || categoryColors.Other;
                  return (
                    <div key={doc._id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px',
                      background: '#FAFBFF',
                      border: '1px solid rgba(109,44,249,0.1)',
                      borderRadius: '10px',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(6,182,212,0.08)', color: '#0891B2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '3px' }}>
                          {(() => { const t = doc.title || ''; return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; })()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '1px 7px', borderRadius: '4px', background: cat.bg, color: cat.color }}>
                            {doc.category}
                          </span>
                          {doc.version && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>v{doc.version}</span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            <Clock size={10} />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await api.get(`/documents/${doc._id}/download`);
                              if (res.data.presignedUrl) window.open(res.data.presignedUrl, '_blank');
                            } catch (e) { alert('Download failed.'); }
                          }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(109,44,249,0.07)', color: '#6D2CF9', border: '1px solid rgba(109,44,249,0.15)', cursor: 'pointer' }}
                          title="View / Download"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
              <Upload size={13} /><span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <AdminDocumentUploadModal
          companies={companies}
          defaultCompanyId={company._id}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchDocs(); }}
        />
      )}
    </>
  );
};

export default CompanyDocumentsModal;
