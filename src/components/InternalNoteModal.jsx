import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, History, Lock, Loader2, Building2, Clock, User } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const InternalNoteModal = ({
  companyId: initialCompanyId = '',
  companies = [],
  note = null,
  onClose,
  onSuccess
}) => {
  const isEditing = !!note;

  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || (note?.company?._id || note?.company || ''));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General Account Update');
  const [priority, setPriority] = useState('Normal');
  const [pinned, setPinned] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialCompanyId && initialCompanyId !== 'All') {
      setSelectedCompanyId(initialCompanyId);
    } else if (companies.length > 0 && !selectedCompanyId && !note) {
      setSelectedCompanyId(companies[0]._id);
    }
  }, [initialCompanyId, companies]);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategory(note.category || 'General Account Update');
      setPriority(note.priority || 'Normal');
      setPinned(!!note.pinned);
      if (note.company) {
        setSelectedCompanyId(note.company._id || note.company);
      }
    }
  }, [note]);

  const categories = [
    'General Account Update',
    'Credit & Billing Risk',
    'Technical Infrastructure',
    'Contract Negotiation',
    'Executive Meeting',
    'Escalation',
    'Commercial',
    'Compliance',
    'Billing',
    'General'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = {};
    if (!isEditing && !selectedCompanyId) errs.company = 'Please select a customer account';
    if (!title.trim() || title.trim().length < 3) errs.title = 'Subject must be at least 3 characters';
    if (!content.trim() || content.trim().length < 10) errs.content = 'Content must be at least 10 characters';
    if (isEditing && content.trim() !== note.content.trim() && !reason.trim()) errs.reason = 'Reason is required for amendments';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      if (isEditing) {
        const res = await api.put(`/internal-notes/${note._id}`, {
          companyId: selectedCompanyId,
          title: title.trim(),
          content: content.trim(),
          category,
          reason: reason.trim(),
          priority,
          pinned
        });
        if (res.data.success) {
          onSuccess(res.data.note, 'Internal note amendment saved successfully.');
          onClose();
        }
      } else {
        const res = await api.post('/internal-notes', {
          companyId: selectedCompanyId,
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
          pinned
        });
        if (res.data.success) {
          onSuccess(res.data.note, 'Private internal note created successfully.');
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save internal note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box modal-header-icon-warning">
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                {isEditing ? 'Private Internal Note' : 'Add Private Internal Account Note'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '0.8125rem', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Customer Account + Note Title */}
          <div className="modal-grid-2col" style={{ marginBottom: '16px' }}>
            {/* Customer Account - always show when companies available */}
            {(companies.length > 0) ? (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} color="#6D2CF9" />
                  <span>Customer Account *</span>
                </label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="form-select"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}

                  >
                    <option value="">-- Select Customer Account --</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : null}
            <div className="form-group">
              <label className="form-label">Note Subject / Interaction Title *</label>
              <input
                type="text"
                className="form-input"
                style={fieldErrors.title ? { borderColor: '#EF4444' } : {}}
                placeholder="Enter note subject"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setFieldErrors(p => ({ ...p, title: '' })); }}
              />
              {fieldErrors.title && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.title}</span>}
            </div>
          </div>

          {/* Row 2: Category + Priority */}
          <div className="modal-grid-2col" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent Escalation</option>
              </select>
            </div>
          </div>

          {/* Note Content */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label"><span>Note & Discussion Details *</span></label>
            <textarea
              className="form-textarea"
              rows={6}
              style={fieldErrors.content ? { borderColor: '#EF4444' } : {}}
              placeholder="Record detailed notes..."
              value={content}
              onChange={(e) => { setContent(e.target.value); setFieldErrors(p => ({ ...p, content: '' })); }}
            />
            {fieldErrors.content && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.content}</span>}
          </div>

          {/* Pin Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#FFFBF9', border: '1px solid rgba(255, 102, 51, 0.25)', borderRadius: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="pin-note-checkbox"
              className="custom-checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <label htmlFor="pin-note-checkbox" style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#B45309', cursor: 'pointer', margin: 0 }}>
              Pin note to top of this customer's account timeline
            </label>
          </div>

          {/* Revision History (Chronological Amendments) */}
          {note?.amendments && note.amendments.length > 0 && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>
                <History size={16} color="#6D2CF9" />
                <span>Chronological Amendment History ({note.amendments.length} revision{note.amendments.length > 1 ? 's' : ''}):</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...note.amendments].reverse().map((am, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#0F071D' }}>
                        Amended by: {am.amendedByName || am.amendedBy?.name || 'VoPro Staff'}
                      </span>
                      <span>
                        {new Date(am.amendedAt).toLocaleString()}
                      </span>
                    </div>
                    {am.reason && (
                      <div style={{ color: '#B45309', fontWeight: '600', marginBottom: '4px' }}>
                        Reason: {am.reason}
                      </div>
                    )}
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', background: '#F8F9FD', padding: '6px 8px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                      "{am.previousContent}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {loading ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isEditing ? 'Save' : 'Save Private Note'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternalNoteModal;
