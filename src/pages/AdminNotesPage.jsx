import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import {
  StickyNote, PlusCircle, Lock, Pin, Clock,
  User, Edit2, Trash2, Building2, Loader2,
  Search, History, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, X
} from 'lucide-react';
import InternalNoteModal from '../components/InternalNoteModal';
import '../styles/AdminDashboard.css';
import '../styles/AdminNotes.css';

const AdminNotesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCompId = searchParams.get('companyId') || 'All';

  const [companies, setCompanies] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(initialCompId);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const [expandedAmendments, setExpandedAmendments] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }

  useEffect(() => {
    api.get('/admin/companies')
      .then(res => { if (res.data.success) setCompanies(res.data.companies || []); })
      .catch(() => {});
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = [];
      if (selectedCompId !== 'All') params.push(`companyId=${selectedCompId}`);
      if (categoryFilter !== 'All') params.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (searchTerm.trim()) params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
      const res = await api.get('/internal-notes' + (params.length ? `?${params.join('&')}` : ''));
      if (res.data.success) setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [selectedCompId, categoryFilter, searchTerm]);

  const showToast = (msg, type = 'success') => { setFeedback(msg); setFeedbackType(type); ; };

  const handleDeleteNote = async (noteId, noteTitle) => {
    try {
      const res = await api.delete(`/internal-notes/${noteId}`);
      if (res.data.success) { showToast('Note deleted successfully.', 'delete'); fetchNotes(); }
    } catch (err) { alert('Failed to delete note.'); }
    setDeleteConfirm(null);
  };

  const toggleAmendments = (noteId) =>
    setExpandedAmendments(prev => ({ ...prev, [noteId]: !prev[noteId] }));

  const totalNotes  = notes.length;
  const pinnedCount = notes.filter(n => n.pinned).length;
  const urgentCount = notes.filter(n => n.priority === 'Urgent' || n.priority === 'High').length;
  const amendedCount= notes.filter(n => n.amendments?.length > 0).length;

  const categories = [
    'All','General Account Update','Credit & Billing Risk','Technical Infrastructure',
    'Contract Negotiation','Executive Meeting','Escalation','Commercial','Compliance','Billing'
  ];

  const priorityBadge = (p) => {
    if (p === 'Urgent') return <span className="notes-badge notes-badge-urgent">🚨 Urgent</span>;
    if (p === 'High')   return <span className="notes-badge notes-badge-high">High</span>;
    if (p === 'Low')    return <span className="notes-badge notes-badge-low">Low</span>;
    return <span className="notes-badge notes-badge-normal">Normal</span>;
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="notes-page-header">
        <div>
          <div className="notes-page-title-row">
            <h1 className="notes-page-title">Internal Account Notes</h1>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingNote(null); setShowNoteModal(true); }}>
          <PlusCircle size={14} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="notes-stats-row">
        <div className="notes-stat-card">
          <div className="notes-stat-icon notes-stat-purple"><StickyNote size={16} /></div>
          <div>
            <div className="notes-stat-num">{totalNotes}</div>
            <div className="notes-stat-label">Total Notes</div>
          </div>
        </div>
        <div className="notes-stat-card">
          <div className="notes-stat-icon notes-stat-orange"><Pin size={16} /></div>
          <div>
            <div className="notes-stat-num notes-stat-orange-txt">{pinnedCount}</div>
            <div className="notes-stat-label">Pinned</div>
          </div>
        </div>
        <div className="notes-stat-card">
          <div className="notes-stat-icon notes-stat-red"><AlertTriangle size={16} /></div>
          <div>
            <div className="notes-stat-num notes-stat-red-txt">{urgentCount}</div>
            <div className="notes-stat-label">High / Urgent</div>
          </div>
        </div>
        <div className="notes-stat-card">
          <div className="notes-stat-icon notes-stat-cyan"><History size={16} /></div>
          <div>
            <div className="notes-stat-num notes-stat-cyan-txt">{amendedCount}</div>
            <div className="notes-stat-label">Amended</div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={feedback} type={feedbackType} onClose={() => setFeedback('')} />

      {/* Filters — single row */}
      <div className="notes-filter-bar">
        <select
          className="form-select"
          style={{ width: '150px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
          value={selectedCompId}
          onChange={e => setSelectedCompId(e.target.value)}>
          <option value="All">All Customers</option>
          {companies.map(c => <option key={c._id} value={c._id}>{c.primaryUserName || c.billingContact?.name || c.companyName || c.accountNumber}</option>)}
        </select>

        <select
          className="form-select"
          style={{ width: '140px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>

        <div className="notes-search-box">
          <Search size={13} className="notes-search-icon" />
          <input type="text"
            className="form-select"
            style={{ width: '150px', fontSize: '0.75rem', padding: '5px 8px 5px 26px', height: 'auto' }}
            placeholder="Search notes..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {(selectedCompId !== 'All' || categoryFilter !== 'All' || searchTerm) && (
          <button className="btn btn-secondary btn-sm"
            onClick={() => { setSelectedCompId('All'); setCategoryFilter('All'); setSearchTerm(''); }}>
            Reset
          </button>
        )}
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="notes-loading">
          <Loader2 size={18} className="spin-icon" color="#6D2CF9" />
          <span>Loading notes...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="notes-empty">
          <StickyNote size={32} color="#6D2CF9" style={{ opacity: 0.5 }} />
          <div className="notes-empty-title">No notes found</div>
          <button className="btn btn-primary btn-sm"
            onClick={() => { setEditingNote(null); setShowNoteModal(true); }}>
            <PlusCircle size={13} /><span>Add First Note</span>
          </button>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map(note => {
            const hasAmendments = note.amendments?.length > 0;
            const isExpanded = !!expandedAmendments[note._id];
            const author = note.author?.name || note.authorName || 'VoPro Staff';

            return (
              <div key={note._id} className={`note-item ${note.pinned ? 'note-item-pinned' : ''}`}>

                {/* Top row */}
                <div className="note-item-top">
                  <div className="note-item-tags">
                    {note.pinned && (
                      <Pin size={13} color="#FF6633" />
                    )}
                    {note.company && (
                      <span className="note-company-tag"
                        onClick={() => navigate(`/admin/companies/${note.company._id || note.company}`)}>
                        <Building2 size={10} />
                        <span className="capitalize-first">
                          {note.company.primaryUserName || note.company.billingContact?.name || note.company.companyName || note.company.accountNumber || '—'}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="note-item-actions">
                    <button className="btn btn-secondary btn-sm note-action-btn"
                      onClick={() => { setEditingNote(note); setShowNoteModal(true); }}>
                      <Edit2 size={12} style={{ color: '#6D2CF9' }} />
                    </button>
                    <button className="btn btn-secondary btn-sm note-action-btn note-delete-btn"
                      onClick={() => setDeleteConfirm({ id: note._id, title: note.title })}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Title row */}
                <div className="note-item-title capitalize-first" style={{ marginBottom: '6px' }}>{note.title}</div>

                {/* Content */}
                <div className="note-item-content">{note.content}</div>

                {/* Footer — date, author, amendments */}
                <div className="note-item-footer">
                  <div className="note-item-meta">
                    <span className="note-item-author">
                      <User size={12} color="#6D2CF9" />
                      <span>{author}</span>
                    </span>
                    <span className="note-meta-sep">·</span>
                    <span className="note-item-time">
                      <Clock size={11} />
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {hasAmendments && (
                    <button className="note-amendments-btn"
                      onClick={() => toggleAmendments(note._id)}>
                      <History size={11} />
                      <span>{note.amendments.length} Amendment{note.amendments.length > 1 ? 's' : ''}</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  )}
                </div>

                {/* Amendments */}
                {hasAmendments && isExpanded && (
                  <div className="note-amendments-trail">
                    {[...note.amendments].reverse().map((am, i) => (
                      <div key={i} className="note-amendment-item">
                        <div className="note-amendment-header">
                          <span className="note-amendment-by">{am.amendedByName || am.amendedBy?.name || 'VoPro Staff'}</span>
                          <span className="note-amendment-time"><Clock size={10} />{new Date(am.amendedAt).toLocaleString()}</span>
                        </div>
                        {am.reason && <div className="note-amendment-reason">Reason: {am.reason}</div>}
                        <div className="note-amendment-prev">"{am.previousContent}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNoteModal && (
        <InternalNoteModal
          companyId={selectedCompId}
          companies={companies}
          note={editingNote}
          onClose={() => setShowNoteModal(false)}
          onSuccess={(_, msg) => { showToast(msg || 'Note saved successfully.', 'success'); fetchNotes(); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="modal-header-icon-box" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Delete Note</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>This action cannot be undone</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: '#EF4444', color: '#fff', border: 'none' }}
                onClick={() => handleDeleteNote(deleteConfirm.id, deleteConfirm.title)}>
                <Trash2 size={13} /> <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotesPage;
