import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import {
  Receipt,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Loader2,
  Search
} from 'lucide-react';
import api from '../services/api';
import AdminInvoiceCreateModal from '../components/AdminInvoiceCreateModal';
import AdminInvoiceEditModal from '../components/AdminInvoiceEditModal';
import AdminInvoiceViewModal from '../components/AdminInvoiceViewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import '../styles/AdminInvoices.css';

const AdminInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ status: 'All', search: '', companyId: 'All' });
  const [invPage, setInvPage] = useState(1);
  const INV_PER_PAGE = 10;

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = [];
      if (filters.status !== 'All') params.push(`status=${filters.status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.companyId !== 'All') params.push(`companyId=${filters.companyId}`);
      const url = '/invoices' + (params.length ? '?' + params.join('&') : '');
      const res = await api.get(url);
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) setCompanies(res.data.companies || []);
    } catch (e) {
      console.error('Failed to load companies:', e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showFeedback = (msg) => {
    setFeedback(msg);
  };

  const handleDelete = async (id, number) => {
    setDeleteTarget({ id, number });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/invoices/${deleteTarget.id}`);
      showFeedback(`Invoice ${deleteTarget.number} deleted successfully.`);
      setDeleteTarget(null);
      fetchInvoices();
    } catch (e) {
      showFeedback('Failed to delete invoice.');
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status: newStatus });
      setInvoices(prev =>
        prev.map(inv => inv._id === id ? { ...inv, status: newStatus } : inv)
      );
      showFeedback(`Status updated to ${newStatus}.`);
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  // Summary stats
  const totalDue = invoices.reduce((s, i) => i.status === 'Due' ? s + i.amount : s, 0);
  const totalOverdue = invoices.reduce((s, i) => i.status === 'Overdue' ? s + i.amount : s, 0);
  const totalPaid = invoices.reduce((s, i) => i.status === 'Paid' ? s + i.amount : s, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);

  const invTotalPages = Math.ceil(invoices.length / INV_PER_PAGE);
  const paginatedInvoices = invoices.slice((invPage - 1) * INV_PER_PAGE, invPage * INV_PER_PAGE);

  const statusSelectStyle = (status) => {
    if (status === 'Paid') return { background: 'rgba(16,185,129,0.1)', color: '#047857', borderColor: 'rgba(16,185,129,0.3)' };
    if (status === 'Due') return { background: 'rgba(245,158,11,0.1)', color: '#B45309', borderColor: 'rgba(245,158,11,0.3)' };
    if (status === 'Overdue') return { background: 'rgba(239,68,68,0.1)', color: '#B91C1C', borderColor: 'rgba(239,68,68,0.3)' };
    return { background: '#F1F5F9', color: '#64748B', borderColor: '#CBD5E1' };
  };

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="admin-invoices-header-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Invoices &amp; Billing
            </h1>
            <span style={{ fontSize: '0.6875rem', background: 'rgba(109,44,249,0.1)', color: '#6D2CF9', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
              {invoices.length} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '2px', marginBottom: 0 }}>
            Create, view, edit and manage customer invoices.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admin-invoices-stat-grid">
        <div className="admin-invoice-stat-card">
          <div className="invoice-stat-icon-wrapper invoice-stat-icon-purple">
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#0F071D' }}>
              £{totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Billed</div>
          </div>
        </div>
        <div className="admin-invoice-stat-card">
          <div className="invoice-stat-icon-wrapper invoice-stat-icon-mint">
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#047857' }}>
              £{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Paid</div>
          </div>
        </div>
        <div className="admin-invoice-stat-card">
          <div className="invoice-stat-icon-wrapper invoice-stat-icon-amber">
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#B45309' }}>
              £{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600' }}>Outstanding Due</div>
          </div>
        </div>
        <div className="admin-invoice-stat-card">
          <div className="invoice-stat-icon-wrapper invoice-stat-icon-red">
            <Receipt size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#B91C1C' }}>
              £{totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '600' }}>Overdue</div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast message={feedback} type={feedback?.includes('delet') ? 'delete' : 'success'} onClose={() => setFeedback('')} />

      {/* Filter Row */}
      <div className="admin-invoices-filter-row">
        <div className="admin-invoices-filters-left">
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '28px', width: '160px', fontSize: '0.75rem', padding: '5px 8px 5px 28px', height: 'auto' }}
              placeholder="Search invoice number..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
            value={filters.companyId}
            onChange={e => setFilters(f => ({ ...f, companyId: e.target.value }))}
          >
            <option value="All">All Customers</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: '120px', fontSize: '0.75rem', padding: '5px 8px', height: 'auto' }}
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {(filters.status !== 'All' || filters.search || filters.companyId !== 'All') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setFilters({ status: 'All', search: '', companyId: 'All' })}
            >
              Reset
            </button>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Plus size={14} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="vopro-card">
        <div className="table-responsive">
          <table className="vopro-table-compact">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '160px' }}>Invoice #</th>
                <th style={{ width: '140px' }}>Customer</th>
                <th style={{ width: '120px' }}>Amount (GBP)</th>
                <th style={{ width: '120px' }}>Invoice Date</th>
                <th style={{ width: '120px' }}>Due Date</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No invoices found. Click <strong>New Invoice</strong> to create one.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv, idx) => (
                  <tr key={inv._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {(invPage - 1) * INV_PER_PAGE + idx + 1}
                    </td>
                    {/* Invoice # */}
                    <td>
                      <span className="invoice-number-tag" style={{ cursor: 'pointer' }}
                        onClick={() => setViewingInvoice(inv)} title="View invoice">
                        {inv.invoiceNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }} className="capitalize-first">
                        {inv.company?.primaryUserName || inv.company?.billingContact?.name || inv.company?.companyName || '—'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className="invoice-amount-tag">
                        £{Number(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Invoice Date */}
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>

                    {/* Due Date */}
                    <td style={{ fontSize: '0.75rem', color: inv.status === 'Overdue' ? '#EF4444' : 'var(--text-secondary)', fontWeight: inv.status === 'Overdue' ? '700' : '400' }}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        className="status-select-inline"
                        value={inv.status}
                        onChange={e => handleStatusChange(inv._id, e.target.value)}
                        style={statusSelectStyle(inv.status)}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Due">Due</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions — View/Download, Edit, Delete */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '5px 7px' }}
                          title="View / Download invoice" onClick={() => setViewingInvoice(inv)}>
                          <Eye size={13} style={{ color: '#6D2CF9' }} />
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '5px 7px' }}
                          title="Edit invoice" onClick={() => setEditingInvoice(inv)}>
                          <Edit3 size={13} style={{ color: '#6D2CF9' }} />
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '5px 7px', color: '#EF4444' }}
                          title="Delete invoice" onClick={() => handleDelete(inv._id, inv.invoiceNumber)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={invPage}
          totalPages={invTotalPages}
          totalItems={invoices.length}
          itemsPerPage={INV_PER_PAGE}
          onPageChange={(p) => setInvPage(p)}
        />
      </div>
      {showCreate && (
        <AdminInvoiceCreateModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={(newInv, msg) => {
            showFeedback(msg || 'Invoice created successfully!');
            fetchInvoices();
          }}
          companies={companies}
        />
      )}

      {editingInvoice && (
        <AdminInvoiceEditModal
          isOpen={!!editingInvoice}
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSuccess={(updatedInv, msg) => {
            showFeedback(msg || 'Invoice updated successfully!');
            fetchInvoices();
            setEditingInvoice(null);
          }}
        />
      )}

      {viewingInvoice && (
        <AdminInvoiceViewModal
          isOpen={!!viewingInvoice}
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          customerName={`Invoice ${deleteTarget.number}`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminInvoicesPage;
