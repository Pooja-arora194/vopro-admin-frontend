import React, { useEffect, useState } from 'react';
import { X, History, Clock, User, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const getActivityBadgeInfo = (actionType) => {
  switch (actionType) {
    case 'DOCUMENT_UPLOADED':
    case 'DOCUMENT_STATUS_CHANGED':
      return { badgeClass: 'badge-act-doc',     label: 'Document' };
    case 'CUSTOMER_FILE_RECEIVED':
    case 'FILE_SCAN_COMPLETED':
      return { badgeClass: 'badge-act-file',    label: 'File Received' };
    case 'INVOICE_ADDED':
    case 'INVOICE_STATUS_UPDATED':
    case 'INVOICE_UPDATED':
      return { badgeClass: 'badge-act-invoice', label: 'Invoice' };
    case 'CONTACT_INFO_CHANGED':
      return { badgeClass: 'badge-act-contact', label: 'Contact Changed' };
    case 'INTERNAL_NOTE_ADDED':
    case 'INTERNAL_NOTE_AMENDED':
    case 'INTERNAL_NOTE_DELETED':
      return { badgeClass: 'badge-act-note',    label: 'Internal Note' };
    case 'USER_CREATED':
    case 'USER_UPDATED':
      return { badgeClass: 'badge-act-user',    label: 'User' };
    default:
      return { badgeClass: 'badge-act-general', label: actionType ? actionType.replace(/_/g, ' ') : 'Activity' };
  }
};

const CompanyActivityModal = ({ company, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/activities?companyId=${company._id}`);
        if (res.data.success) setActivities(res.data.activities || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [company._id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109,44,249,0.1)', color: '#6D2CF9' }}>
              <History size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Activity History</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {(() => { const n = company.primaryUserName || company.companyName || ''; return n ? n.charAt(0).toUpperCase() + n.slice(1) : ''; })()}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 size={16} className="spin-icon" color="#6D2CF9" />
              <span>Loading activity...</span>
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <History size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>No activity yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '32px', position: 'relative' }}>
              {/* vertical line */}
              <div style={{ position: 'absolute', left: '11px', top: '12px', bottom: '12px', width: '2px', background: 'rgba(109,44,249,0.12)', borderRadius: '2px' }} />

              {activities.map((act, i) => {
                const info = getActivityBadgeInfo(act.actionType);
                return (
                  <div key={act._id || i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', position: 'relative' }}>
                    {/* dot */}
                    <div style={{
                      position: 'absolute', left: '-32px', top: '2px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#fff', border: '2px solid #6D2CF9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6D2CF9' }} />
                    </div>

                    {/* content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span className={`admin-timeline-badge ${info.badgeClass}`}>{info.label}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          <Clock size={10} />
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {act.description && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '3px' }}>
                          {act.description}
                        </div>
                      )}
                      {act.performedBy?.name && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', fontWeight: '600', color: '#6D2CF9' }}>
                          <User size={10} />
                          {act.performedBy.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyActivityModal;
