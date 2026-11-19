import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  History,
  Clock,
  User,
  Building2,
  Search,
  FileText,
  Inbox,
  Receipt,
  StickyNote,
  Users,
  Lock,
  Loader2,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import '../styles/AdminCompanyDetails.css';

const AdminActivityPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCompId = searchParams.get('companyId') || 'All';
  const initialActionType = searchParams.get('actionType') || 'All';

  const [companies, setCompanies] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(initialCompId);
  const [selectedActionType, setSelectedActionType] = useState(initialActionType);
  const [searchTerm, setSearchTerm] = useState('');

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies for dropdown filter
  useEffect(() => {
    api.get('/admin/companies')
      .then(res => {
        if (res.data.success && res.data.companies?.length > 0) {
          setCompanies(res.data.companies);
        }
      })
      .catch(err => console.error('Failed to load companies for filter:', err));
  }, []);

  // Fetch chronological activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = [];
      if (selectedCompId && selectedCompId !== 'All') {
        params.push(`companyId=${selectedCompId}`);
      }
      if (selectedActionType && selectedActionType !== 'All') {
        params.push(`actionType=${selectedActionType}`);
      }
      if (searchTerm.trim()) {
        params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
      }

      const endpoint = '/activities' + (params.length ? `?${params.join('&')}` : '');
      const res = await api.get(endpoint);
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error('Failed to retrieve activity history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedCompId, selectedActionType, searchTerm]);

  // Statistics calculation
  const totalEvents = activities.length;
  const docEventsCount = activities.filter(a => a.actionType === 'DOCUMENT_UPLOADED' || a.actionType === 'CUSTOMER_FILE_RECEIVED' || a.actionType === 'DOCUMENT_STATUS_CHANGED').length;
  const invoiceEventsCount = activities.filter(a => a.actionType?.includes('INVOICE')).length;
  const noteEventsCount = activities.filter(a => a.actionType?.includes('INTERNAL_NOTE')).length;

  const getActivityBadgeInfo = (actionType) => {
    switch (actionType) {
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_STATUS_CHANGED':
        return {
          icon: <FileText size={13} />,
          badgeClass: 'badge-act-doc',
          markerClass: 'marker-doc',
          label: 'Document Uploaded'
        };
      case 'CUSTOMER_FILE_RECEIVED':
      case 'FILE_SCAN_COMPLETED':
        return {
          icon: <Inbox size={13} />,
          badgeClass: 'badge-act-file',
          markerClass: 'marker-file',
          label: 'Customer File Received'
        };
      case 'INVOICE_ADDED':
      case 'INVOICE_STATUS_UPDATED':
      case 'INVOICE_UPDATED':
        return {
          icon: <Receipt size={13} />,
          badgeClass: 'badge-act-invoice',
          markerClass: 'marker-invoice',
          label: 'Invoice Added'
        };
      case 'CONTACT_INFO_CHANGED':
        return {
          icon: <Building2 size={13} />,
          badgeClass: 'badge-act-contact',
          markerClass: 'marker-contact',
          label: 'Contact Info Changed'
        };
      case 'INTERNAL_NOTE_ADDED':
      case 'INTERNAL_NOTE_AMENDED':
      case 'INTERNAL_NOTE_DELETED':
        return {
          icon: <StickyNote size={13} />,
          badgeClass: 'badge-act-note',
          markerClass: 'marker-note',
          label: 'Internal Note Added'
        };
      case 'USER_CREATED':
      case 'USER_UPDATED':
        return {
          icon: <User size={13} />,
          badgeClass: 'badge-act-user',
          markerClass: 'marker-user',
          label: 'Customer User Created/Amended'
        };
      default:
        return {
          icon: <History size={13} />,
          badgeClass: 'badge-act-general',
          markerClass: 'marker-doc',
          label: actionType ? actionType.replace(/_/g, ' ') : 'Account Activity'
        };
    }
  };

  return (
    <div className="page-container">
      {/* Header Bar */}
      <div className="page-header-row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Account Activity History
            </h1>
            <span style={{ fontSize: '0.6875rem', background: 'rgba(109,44,249,0.1)', color: '#6D2CF9', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
              {totalEvents} Recorded Events
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '3px', marginBottom: 0 }}>
            Chronological audit history of important customer account activity: documents, files, invoices, contact updates, notes and users.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <div className="vopro-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(109, 44, 249, 0.1)', color: '#6D2CF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.1 }}>
              {totalEvents}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Total Activities
            </div>
          </div>
        </div>

        <div className="vopro-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0891B2', lineHeight: 1.1 }}>
              {docEventsCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Documents & Files
            </div>
          </div>
        </div>

        <div className="vopro-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857', lineHeight: 1.1 }}>
              {invoiceEventsCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Invoices Generated
            </div>
          </div>
        </div>

        <div className="vopro-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 102, 51, 0.1)', color: '#FF6633', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StickyNote size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#EA580C', lineHeight: 1.1 }}>
              {noteEventsCount}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
              Private Notes & Audit
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="vopro-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Account Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={15} color="#6D2CF9" />
              <select
                className="form-select"
                style={{ width: '230px', height: '34px', fontSize: '0.8125rem' }}
                value={selectedCompId}
                onChange={(e) => {
                  setSelectedCompId(e.target.value);
                  if (e.target.value === 'All') {
                    searchParams.delete('companyId');
                  } else {
                    searchParams.set('companyId', e.target.value);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <option value="All">All Customer Accounts</option>
                {companies.map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.primaryUserName || comp.billingContact?.name || comp.companyName} ({comp.accountNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Event Action Type Filter */}
            <select
              className="form-select"
              style={{ width: '220px', height: '34px', fontSize: '0.8125rem' }}
              value={selectedActionType}
              onChange={(e) => {
                setSelectedActionType(e.target.value);
                if (e.target.value === 'All') {
                  searchParams.delete('actionType');
                } else {
                  searchParams.set('actionType', e.target.value);
                }
                setSearchParams(searchParams);
              }}
            >
              <option value="All">All Activity Types</option>
              <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
              <option value="CUSTOMER_FILE_RECEIVED">Customer File Received</option>
              <option value="INVOICE_ADDED">Invoice Added</option>
              <option value="CONTACT_INFO_CHANGED">Contact Info Changed</option>
              <option value="INTERNAL_NOTE_ADDED">Internal Note Added</option>
              <option value="USER_CREATED">Customer User Created</option>
              <option value="USER_UPDATED">Customer User Amended</option>
            </select>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ height: '34px', paddingLeft: '32px', fontSize: '0.8125rem' }}
                placeholder="Search events, user, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedCompId !== 'All' || selectedActionType !== 'All' || searchTerm) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSelectedCompId('All');
                setSelectedActionType('All');
                setSearchTerm('');
                searchParams.delete('companyId');
                searchParams.delete('actionType');
                setSearchParams(searchParams);
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Chronological Timeline Card */}
      <div className="vopro-card" style={{ padding: '20px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={18} className="spin-icon" color="#6D2CF9" />
              <span>Loading chronological activity history...</span>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <History size={36} color="#6D2CF9" style={{ margin: '0 auto 10px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>
              No Activity Recorded
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
              No account activity logs matched your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="admin-activity-timeline">
            {activities.map((act) => {
              const badgeInfo = getActivityBadgeInfo(act.actionType);
              const actorName = act.performedBy?.name || 'VoPro Staff';
              const actorRole = act.performedBy?.role ? ` (${act.performedBy.role})` : '';

              return (
                <div key={act._id} className="admin-timeline-entry">
                  {/* Marker Dot */}
                  <div className={`admin-timeline-marker ${badgeInfo.markerClass}`}>
                    {badgeInfo.icon}
                  </div>

                  {/* Card Content */}
                  <div className="admin-timeline-card">
                    <div className="admin-timeline-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Customer Company Account Tag */}
                        {act.company && (
                          <span
                            className="account-tag"
                            style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                            onClick={() => navigate(`/admin/companies/${act.company._id || act.company}`)}
                            title="View Customer Account Page"
                          >
                            <Building2 size={11} style={{ marginRight: '3px' }} />
                            {act.company.primaryUserName || act.company.companyName || 'Customer Account'} ({act.company.accountNumber || 'VP-CUST'})
                          </span>
                        )}

                        <span className={`admin-timeline-badge ${badgeInfo.badgeClass}`}>
                          {badgeInfo.label}
                        </span>
                      </div>

                      <div className="admin-timeline-date" title="Exact timestamp">
                        <Clock size={12} />
                        <span>{new Date(act.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="admin-timeline-title">
                      {act.title}
                    </div>

                    <div className="admin-timeline-desc">
                      {act.description}
                    </div>

                    {/* Relevant User attribution */}
                    <div className="admin-timeline-actor">
                      <span className="admin-timeline-actor-user">
                        <User size={12} color="#6D2CF9" />
                        <span>Performed by: <strong>{actorName}</strong>{actorRole}</span>
                      </span>

                      {act.metadata?.invoiceId && (
                        <span style={{ color: '#047857', fontWeight: '600' }}>
                          • Ref: Invoice
                        </span>
                      )}
                      {act.metadata?.fileId && (
                        <span style={{ color: '#0891B2', fontWeight: '600' }}>
                          • Ref: File Scanned
                        </span>
                      )}
                      {!act.visibleToCustomer && (
                        <span style={{ color: '#FF6633', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Internal Staff Record
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityPage;
