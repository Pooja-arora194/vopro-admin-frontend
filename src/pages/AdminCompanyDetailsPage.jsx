import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';
import {
  Building2,
  ArrowLeft,
  Edit3,
  Phone,
  Mail,
  Hash,
  Globe,
  MapPin,
  CreditCard,
  Briefcase,
  Users,
  History,
  PlusCircle,
  UserCheck,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  CheckCircle2,
  StickyNote,
  Lock,
  Pin,
  Clock,
  User,
  Edit2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Receipt,
  Inbox,
  UploadCloud
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AdminAccountEditModal from '../components/AdminAccountEditModal';
import EditCustomerModal from '../components/EditCustomerModal';
import AdminAccountDetailsModal from '../components/AdminAccountDetailsModal';
import InternalNoteModal from '../components/InternalNoteModal';
import AdminDocumentUploadModal from '../components/AdminDocumentUploadModal';
import GradientIcon from '../components/GradientIcon';
import '../styles/AdminCompanyDetails.css';
import '../styles/AdminNotes.css';

const AdminCompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chronological Account Activity History State
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState('All');
  const [activeHistoryTab, setActiveHistoryTab] = useState('timeline'); // 'timeline' or 'fieldAudit'

  // Private Internal Notes State
  const [companyNotes, setCompanyNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedAmendments, setExpandedAmendments] = useState({});

  // Documents State
  const [companyDocs, setCompanyDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomerEditModal, setShowCustomerEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const fetchActivities = async () => {
    if (!id) return;
    try {
      setActivitiesLoading(true);
      const res = await api.get(`/activities?companyId=${id}`);
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (e) {
      console.error('Failed to load activity logs:', e);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchCompanyNotes = async () => {
    if (!id) return;
    try {
      setNotesLoading(true);
      const res = await api.get(`/internal-notes?companyId=${id}`);
      if (res.data.success) {
        setCompanyNotes(res.data.notes || []);
      }
    } catch (e) {
      console.error('Failed to load internal notes:', e);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchCompanyDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/admin/companies/${id}`);
        if (res.data.success) {
          setCompany(res.data.company);
          setContacts(res.data.contacts || []);
          setStats(res.data.stats || null);
          return;
        }
      } catch (adminErr) {
        if (adminErr.response?.status === 404) {
          const fallbackRes = await api.get(`/companies/${id}`);
          if (fallbackRes.data.success) {
            setCompany(fallbackRes.data.company);
            setContacts(fallbackRes.data.contacts || []);
            return;
          }
        }
        throw adminErr;
      }
    } catch (err) {
      console.error('Failed to load company details:', err);
      setError(err.response?.data?.message || 'Failed to retrieve company account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDocs = async () => {
    if (!id) return;
    try {
      setDocsLoading(true);
      const res = await api.get(`/documents?companyId=${id}`);
      if (res.data.success) setCompanyDocs(res.data.documents || []);
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleViewDoc = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc._id}/download`);
      if (res.data.presignedUrl) {
        window.open(res.data.presignedUrl, '_blank');
      } else if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
      }
    } catch (e) {
      alert('Could not open document: ' + (e.response?.data?.message || e.message));
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    fetchCompanyNotes();
    fetchCompanyDocs();
    fetchActivities();
  }, [id]);

  const getActivityBadgeInfo = (actionType) => {
    switch (actionType) {
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_STATUS_CHANGED':
        return {
          icon: <FileText size={12} />,
          badgeClass: 'badge-act-doc',
          markerClass: 'marker-doc',
          label: 'Document Uploaded'
        };
      case 'CUSTOMER_FILE_RECEIVED':
      case 'FILE_SCAN_COMPLETED':
        return {
          icon: <Inbox size={12} />,
          badgeClass: 'badge-act-file',
          markerClass: 'marker-file',
          label: 'Customer File Received'
        };
      case 'INVOICE_ADDED':
      case 'INVOICE_STATUS_UPDATED':
      case 'INVOICE_UPDATED':
        return {
          icon: <Receipt size={12} />,
          badgeClass: 'badge-act-invoice',
          markerClass: 'marker-invoice',
          label: 'Invoice Added'
        };
      case 'CONTACT_INFO_CHANGED':
        return {
          icon: <Building2 size={12} />,
          badgeClass: 'badge-act-contact',
          markerClass: 'marker-contact',
          label: 'Contact Info Changed'
        };
      case 'INTERNAL_NOTE_ADDED':
      case 'INTERNAL_NOTE_AMENDED':
      case 'INTERNAL_NOTE_DELETED':
        return {
          icon: <StickyNote size={12} />,
          badgeClass: 'badge-act-note',
          markerClass: 'marker-note',
          label: 'Internal Note Added'
        };
      case 'USER_CREATED':
      case 'USER_UPDATED':
        return {
          icon: <User size={12} />,
          badgeClass: 'badge-act-user',
          markerClass: 'marker-user',
          label: 'Customer User Created/Amended'
        };
      default:
        return {
          icon: <History size={12} />,
          badgeClass: 'badge-act-general',
          markerClass: 'marker-doc',
          label: actionType ? actionType.replace(/_/g, ' ') : 'Account Activity'
        };
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'All') return true;
    if (activityFilter === 'Documents') {
      return act.actionType === 'DOCUMENT_UPLOADED' || act.actionType === 'DOCUMENT_STATUS_CHANGED' || act.actionType === 'DOCUMENT_DELETED';
    }
    if (activityFilter === 'Files') {
      return act.actionType === 'CUSTOMER_FILE_RECEIVED' || act.actionType === 'FILE_SCAN_COMPLETED' || act.actionType === 'FILE_DELETED';
    }
    if (activityFilter === 'Invoices') {
      return act.actionType === 'INVOICE_ADDED' || act.actionType === 'INVOICE_STATUS_UPDATED' || act.actionType === 'INVOICE_UPDATED' || act.actionType === 'INVOICE_DELETED';
    }
    if (activityFilter === 'Contact') {
      return act.actionType === 'CONTACT_INFO_CHANGED';
    }
    if (activityFilter === 'Notes') {
      return act.actionType === 'INTERNAL_NOTE_ADDED' || act.actionType === 'INTERNAL_NOTE_AMENDED' || act.actionType === 'INTERNAL_NOTE_DELETED';
    }
    if (activityFilter === 'Users') {
      return act.actionType === 'USER_CREATED' || act.actionType === 'USER_UPDATED';
    }
    return true;
  });

  const handleSetStatus = async (newStatus) => {
    if (!company) return;
    try {
      const res = await api.patch(`/admin/companies/${company._id}/status`, { status: newStatus });
      if (res.data.success) {
        setCompany((prev) => ({ ...prev, accountStatus: newStatus }));
        fetchActivities();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!window.confirm(`Permanently delete private note "${noteTitle}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/internal-notes/${noteId}`);
      if (res.data.success) {
        setNoteFeedback(`Note "${noteTitle}" deleted permanently.`);

        fetchCompanyNotes();
        fetchActivities();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete note.');
    }
  };

  const toggleAmendments = (noteId) => {
    setExpandedAmendments((prev) => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const res = await api.post(`/companies/${id}/contacts`, newContact);
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
        fetchCompanyDetails();
        fetchActivities();
      }
    } catch (err) {
      setContactError(err.response?.data?.message || 'Failed to add contact.');
    } finally {
      setContactSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-details-viewport admin-details-loading">
        <Loader2 size={28} className="spin-icon admin-details-loading-icon" />
        <div className="admin-details-loading-text">Loading customer account profile...</div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="admin-details-viewport">
        <button className="admin-back-btn" onClick={() => navigate('/admin/companies')}>
          <ArrowLeft size={16} />
          <span>Back to Customer Accounts</span>
        </button>
        <div className="scan-progress-banner admin-feedback-banner-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const isActive = company?.accountStatus === 'Active';

  return (
    <div className="admin-details-viewport">

      {/* Back Button */}
      <div className="acd-page-heading">
        <button className="acd-back-link" onClick={() => navigate('/admin/companies')}>
          <ArrowLeft size={14} />
          <span>Customer Accounts</span>
        </button>
        <span className="acd-breadcrumb-sep">›</span>
        <span className="acd-breadcrumb-current capitalize-first">{contacts.find(c => c.isPrimaryContact)?.name || company?.companyName || '—'}</span>
      </div>

      {/* Toast */}
      <Toast message={noteFeedback} type={noteFeedback?.includes('delet') ? 'delete' : 'success'} onClose={() => setNoteFeedback(null)} />

      {/* New Profile Layout */}
      <div className="acd-layout">

        {/* Left sidebar */}
        <div className="acd-sidebar">
          <div className="acd-avatar-box">
            <div className="acd-avatar-circle">
              <Building2 size={40} color="#6D2CF9" />
            </div>
            <div className="acd-sidebar-name">
              {contacts.find(c => c.isPrimaryContact)?.name || company?.companyName || '—'}
            </div>
            {company?.address?.city && (
              <div className="acd-sidebar-meta">
                <MapPin size={12} />{company.address.city}{company.address.country ? `, ${company.address.country}` : ''}
              </div>
            )}
            {contacts.find(c => c.isPrimaryContact)?.email && (
              <div className="acd-sidebar-meta">
                <Mail size={12} />{contacts.find(c => c.isPrimaryContact).email}
              </div>
            )}
            {contacts.find(c => c.isPrimaryContact)?.phone && (
              <div className="acd-sidebar-meta">
                <Phone size={12} />{contacts.find(c => c.isPrimaryContact).phone}
              </div>
            )}
            <span className={`acd-status-badge ${company?.accountStatus === 'Active' ? 'acd-status-active' : 'acd-status-inactive'}`}>
              {company?.accountStatus}
            </span>
            {/* <button className="btn btn-secondary btn-sm" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }} onClick={() => setShowCustomerEditModal(true)}>
              <Edit3 size={13} /><span>Edit Details</span>
            </button> */}
            <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowCustomerEditModal(true)}>
              <PlusCircle size={13} /><span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT — Cards Grid */}
        <div className="acd-content">

          {/* Row 1: Company Details + Billing Contact */}
          <div className="acd-cards-row">

            {/* Company Details */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div className="acd-card-title">
                  <GradientIcon icon={Building2} size={16} />
                  <span>Company Information</span>
                </div>
                <button className="acd-edit-btn" onClick={() => setShowEditModal(prev => (!prev ? true : prev))}>
                  <Edit3 size={13} />
                </button>
              </div>
              <div className="acd-fields">
                <div className="acd-row"><span className="acd-label">Company Name</span><span className="acd-val">{company?.companyName || '—'}</span></div>
                <div className="acd-row"><span className="acd-label">Industry / Sector</span><span className="acd-val">{company?.industry || '—'}</span></div>
                <div className="acd-row"><span className="acd-label">Company Registration No.</span><span className="acd-val acd-mono">{company?.registrationNumber || <span className="cd-empty">Not registered</span>}</span></div>
                <div className="acd-row"><span className="acd-label">VAT Number</span><span className="acd-val acd-mono">{company?.vatNumber || <span className="cd-empty">Not registered</span>}</span></div>
                <div className="acd-row"><span className="acd-label">Website</span><span className="acd-val">
                  {company?.website
                    ? <a href={company.website} target="_blank" rel="noreferrer" className="admin-website-link">{company.website}</a>
                    : <span className="cd-empty">Not registered</span>}
                </span></div>
                <div className="acd-row"><span className="acd-label">Registered Address</span><span className="acd-val">
                  {[company?.address?.street, company?.address?.city, company?.address?.postalCode, company?.address?.country].filter(Boolean).join(', ') || <span className="cd-empty">—</span>}
                </span></div>
              </div>
            </div>

            {/* Billing Contact */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div className="acd-card-title">
                  <GradientIcon icon={CreditCard} size={16} />
                  <span>Billing Contact</span>
                </div>
              </div>
              <div className="acd-fields">
                <div className="acd-row"><span className="acd-label">Name</span><span className="acd-val">{company?.billingContact?.name || <span className="cd-empty">Not registered</span>}</span></div>
                <div className="acd-row"><span className="acd-label">Email</span><span className="acd-val">{company?.billingContact?.email || <span className="cd-empty">—</span>}</span></div>
                <div className="acd-row"><span className="acd-label">Phone</span><span className="acd-val">{company?.billingContact?.phone || <span className="cd-empty">—</span>}</span></div>
                <div className="acd-row"><span className="acd-label">Address</span><span className="acd-val">{company?.billingContact?.address || <span className="cd-empty">—</span>}</span></div>
              </div>
            </div>

          </div>

          {/* Row 2: Main Contact + Authorized Contacts */}
          <div className="acd-cards-row">

            {/* Main Contact */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div className="acd-card-title">
                  <GradientIcon icon={Phone} size={16} />
                  <span>Main Contact</span>
                </div>
              </div>
              <div className="acd-fields">
                <div className="acd-row"><span className="acd-label">Contact Number</span><span className="acd-val">{company?.phone || <span className="cd-empty">Not registered</span>}</span></div>
                <div className="acd-row"><span className="acd-label">Email Address</span><span className="acd-val">{company?.mainContactEmail || <span className="cd-empty">Not registered</span>}</span></div>
              </div>
            </div>

            {/* Authorized Contacts */}
            <div className="acd-card">
              <div className="acd-card-header">
                <div className="acd-card-title">
                  <GradientIcon icon={Users} size={16} />
                  <span>Authorized Contacts ({contacts.filter(c => !c.isPrimaryContact).length})</span>
                </div>
              </div>
              {contacts.filter(c => !c.isPrimaryContact).length === 0 ? (
                <div className="cd-empty-state">No authorized contacts added yet</div>
              ) : (
                <div className="admin-contacts-list">
                  {contacts.filter(c => !c.isPrimaryContact).map(c => (
                    <div key={c._id} className="admin-contact-card">
                      <div>
                        <div className="admin-contact-name-row">
                          <span className="admin-contact-name capitalize-first">{c.name}</span>
                        </div>
                        <div className="admin-contact-email-row capitalize-first">{c.email}{c.phone && ` • ${c.phone}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>


      {/* Internal Notes Section */}
      <div className="acd-card acd-notes-section">
        <div className="acd-card-header">
          <div className="acd-card-title">
            <StickyNote size={15} color="#FF6633" />
            <span>Internal Notes</span>
            {companyNotes.length > 0 && (
              <span className="acd-notes-count">{companyNotes.length}</span>
            )}
          </div>
        </div>

        {notesLoading ? (
          <div className="admin-notes-loading">
            <div className="admin-notes-loading-inner">
              <Loader2 size={16} className="spin-icon" color="#6D2CF9" />
              <span>Loading notes...</span>
            </div>
          </div>
        ) : companyNotes.length === 0 ? (
          <div className="admin-notes-empty">
            <StickyNote size={28} color="#FF6633" className="admin-notes-empty-icon" style={{ opacity: 0.5 }} />
            <div className="admin-notes-empty-title">No internal notes yet</div>
            <div className="admin-notes-empty-desc">Notes added from Internal Notes page will appear here.</div>
          </div>
        ) : (
          <div className="acd-notes-grid">
            {companyNotes.map(note => {
              const hasAmendments = note.amendments?.length > 0;
              const isExpanded = !!expandedAmendments[note._id];
              const author = note.author?.name || note.authorName || 'VoPro Staff';
              return (
                <div key={note._id} className={`note-item ${note.pinned ? 'note-item-pinned' : ''}`}>
                  <div className="note-item-top">
                    <div className="note-item-tags">
                      {note.pinned && <Pin size={12} color="#FF6633" />}
                      {note.company && (
                        <span className="note-company-tag">
                          <Building2 size={10} />
                          {note.company.companyName}
                        </span>
                      )}
                    </div>
                    <div className="note-item-actions">
                      <button className="btn btn-secondary btn-sm note-action-btn"
                        onClick={() => handleEditNote(note)}>
                        <Edit2 size={12} style={{ color: '#6D2CF9' }} />
                      </button>
                      <button className="btn btn-secondary btn-sm note-action-btn note-delete-btn"
                        onClick={() => handleDeleteNote(note._id, note.title)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="note-item-title" style={{ marginBottom: '6px' }}>{note.title}</div>
                  <div className="note-item-content">{note.content}</div>
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
                      <button className="note-amendments-btn" onClick={() => toggleAmendments(note._id)}>
                        <History size={11} />
                        <span>{note.amendments.length} Amendment{note.amendments.length > 1 ? 's' : ''}</span>
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    )}
                  </div>
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
      </div>

      {/* Documents + Activity — one row */}
      <div className="acd-cards-row">
        <div className="acd-card" style={{ borderColor: 'rgba(6,182,212,0.2)' }}>
          <div className="acd-card-header">
            <div className="acd-card-title">
              <FileText size={15} color="#0891B2" />
              <span>Documents</span>
              {companyDocs.length > 0 && (
                <span className="acd-notes-count" style={{ background: 'rgba(6,182,212,0.1)', color: '#0891B2' }}>
                  {companyDocs.length}
                </span>
              )}
            </div>
          </div>

          {docsLoading ? (
            <div className="admin-notes-loading">
              <div className="admin-notes-loading-inner">
                <Loader2 size={16} className="spin-icon" color="#0891B2" />
                <span>Loading documents...</span>
              </div>
            </div>
          ) : companyDocs.length === 0 ? (
            <div className="admin-notes-empty">
              <FileText size={28} color="#0891B2" style={{ opacity: 0.4, margin: '0 auto 6px' }} />
              <div className="admin-notes-empty-title">No documents yet</div>
              <div className="admin-notes-empty-desc">Upload contracts, SLAs or compliance files.</div>
            </div>
          ) : (
            <div className="acd-notes-grid">
              {companyDocs.map(doc => (
                <div key={doc._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', background: '#FAFBFF',
                  border: '1px solid rgba(6,182,212,0.12)', borderRadius: '10px',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: 'rgba(6,182,212,0.08)', color: '#0891B2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: 'rgba(6,182,212,0.08)', color: '#0891B2' }}>
                        {doc.category}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewDoc(doc)}
                    title="View Document"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(109,44,249,0.07)', color: '#6D2CF9', border: '1px solid rgba(109,44,249,0.15)', cursor: 'pointer', flexShrink: 0 }}>
                    <Eye size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div className="acd-card acd-activity-section">
          <div className="acd-card-header">
            <div className="acd-card-title">
              <History size={15} color="#6D2CF9" />
              <span>Recent Activity</span>
              {activities.length > 0 && (
                <span className="acd-notes-count" style={{ background: 'rgba(109,44,249,0.1)', color: '#6D2CF9' }}>
                  {activities.length}
                </span>
              )}
            </div>
          </div>

          {activitiesLoading ? (
            <div className="admin-notes-loading">
              <div className="admin-notes-loading-inner">
                <Loader2 size={16} className="spin-icon" color="#6D2CF9" />
                <span>Loading activity...</span>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="admin-notes-empty">
              <History size={28} color="#6D2CF9" style={{ opacity: 0.4, margin: '0 auto 6px' }} />
              <div className="admin-notes-empty-title">No activity yet</div>
            </div>
          ) : (
            <div className="acd-activity-list" style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              {activities.slice(0, 10).map((act, i) => {
                const info = getActivityBadgeInfo(act.actionType);
                return (
                  <div key={act._id || i} className="acd-activity-item">
                    <div className={`acd-activity-dot ${info.markerClass}`}>{info.icon}</div>
                    <div className="acd-activity-body">
                      <div className="acd-activity-top">
                        <span className={`admin-timeline-badge ${info.badgeClass}`}>{info.label}</span>
                        <span className="acd-activity-time">
                          <Clock size={10} />
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {act.description && (
                        <div className="acd-activity-desc">{act.description}</div>
                      )}
                      {act.performedBy?.name && (
                        <div className="acd-activity-actor">
                          <User size={10} color="#6D2CF9" />
                          <span>{act.performedBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div> {/* end acd-cards-row documents+activity */}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <AdminDocumentUploadModal
          companies={[company]}
          defaultCompanyId={company?._id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { setShowUploadModal(false); fetchCompanyDocs(); setNoteFeedback('Document uploaded successfully.'); }}
        />
      )}

      {/* Internal Note Modal */}
      {showNoteModal && (
        <InternalNoteModal
          companyId={company?._id}
          note={editingNote}
          onClose={() => setShowNoteModal(false)}
          onSuccess={(savedNote, msg) => {
            fetchCompanyNotes();
            fetchActivities();
            setNoteFeedback(msg || 'Private internal note saved.');
          }}
        />
      )}

      {/* Edit Customer (primary user) Modal */}
      {showCustomerEditModal && (
        <EditCustomerModal
          companyId={company?._id}
          company={company}
          onClose={() => setShowCustomerEditModal(false)}
          onSuccess={(updated) => {
            if (updated) setCompany(updated);
            fetchCompanyDetails();
            setShowCustomerEditModal(false);
          }}
        />
      )}

      {/* Edit Account Modal */}
      {showEditModal && (
        <AdminAccountEditModal
          companyId={company?._id}
          company={company}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setCompany(updated);
            fetchCompanyDetails();
            fetchActivities();
          }}
        />
      )}

      {/* Add Account Details Modal */}
      {showDetailsModal && (
        <AdminAccountDetailsModal
          companyId={company?._id}
          company={company}
          onClose={() => setShowDetailsModal(false)}
          onSuccess={(updated) => {
            setCompany(updated);
            fetchCompanyDetails();
            fetchActivities();
          }}
        />
      )}
    </div>
  );
};

export default AdminCompanyDetailsPage;


