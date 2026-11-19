import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';
import '../styles/AdminInvoices.css';

const AdminInvoiceCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCompanyId = null,
  companies = []
}) => {
  const generateNumber = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${rand}`;
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const [companyId, setCompanyId] = useState(preselectedCompanyId || '');
  const [invoiceNumber, setInvoiceNumber] = useState(generateNumber());
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [status, setStatus] = useState('Due');
  const [paymentMethod, setPaymentMethod] = useState('BACS / Direct Debit');
  const [currency] = useState('GBP');
  const [notes, setNotes] = useState(
    'Payment terms: Net 30 days. Remittance via BACS or Direct Debit. Late payments subject to statutory interest.'
  );

  const [items, setItems] = useState([
    {
      description: '',
      quantity: 1,
      unitPrice: 0.00
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedCompanyId) {
      setCompanyId(preselectedCompanyId);
    } else if (companies.length > 0 && !companyId) {
      setCompanyId(companies[0]._id);
    }
  }, [preselectedCompanyId, companies]);

  if (!isOpen) return null;

  // Add line item
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0.00
      }
    ]);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setError('Invoice must contain at least one line item.');
      return;
    }
    setError('');
    setItems(items.filter((_, i) => i !== index));
  };

  // Update line item field
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : Number(value)
    };
    setItems(updated);
  };

  // Financial calculations
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + (q * p);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const vat = Math.round(subtotal * 0.20 * 100) / 100;
  const grandTotal = Math.round((subtotal + vat) * 100) / 100;

  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = {};
    if (!companyId) errs.companyId = 'Please select a customer account';
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    const amount = Number(items[0]?.unitPrice) || 0;
    if (amount <= 0) errs.amount = 'Amount must be greater than zero';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      const res = await api.post('/invoices', {
        companyId,
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        invoiceDate,
        dueDate,
        items,
        notes,
        currency,
        status,
        paymentMethod
      });

      if (res.data.success) {
        onSuccess(res.data.invoice, 'Invoice created successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109, 44, 249, 0.1)', color: '#6D2CF9' }}>
              <Receipt size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Create Customer Invoice
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Issue official tax billing statement with line-item breakdown
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '0.8125rem', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Customer Account & Invoice Number */}
          <div className="modal-grid-2col" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} color="#6D2CF9" />
                <span>Customer *</span>
              </label>
              <select
                className="form-select"
                style={fieldErrors.companyId ? { borderColor: '#EF4444' } : {}}
                value={companyId}
                onChange={(e) => { setCompanyId(e.target.value); setFieldErrors(p => ({ ...p, companyId: '' })); }}
                disabled={loading || Boolean(preselectedCompanyId)}
              >
                <option value="">-- Select Customer --</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.primaryUserName || c.billingContact?.name || c.companyName} ({c.accountNumber})
                  </option>
                ))}
              </select>
              {fieldErrors.companyId && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.companyId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Invoice Number *</span>
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontWeight: '700', ...(fieldErrors.invoiceNumber ? { borderColor: '#EF4444' } : {}) }}
                  value={invoiceNumber}
                  onChange={(e) => { setInvoiceNumber(e.target.value); setFieldErrors(p => ({ ...p, invoiceNumber: '' })); }}
                  placeholder="INV-2026-XXXX"
                />
                <button type="button" className="btn btn-secondary btn-sm" title="Generate" onClick={() => setInvoiceNumber(generateNumber())}>
                  <RefreshCw size={13} />
                </button>
              </div>
              {fieldErrors.invoiceNumber && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.invoiceNumber}</span>}
            </div>
          </div>

          {/* Row 2: Dates & Status */}
          <div className="modal-grid-3col" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} color="#6D2CF9" />
                <span>Issue Date</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}

              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} color="#FF6633" />
                <span>Payment Due Date *</span>
              </label>
              <input
                type="date"
                className="form-input"
                style={fieldErrors.dueDate ? { borderColor: '#EF4444' } : {}}
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); setFieldErrors(p => ({ ...p, dueDate: '' })); }}
              />
              {fieldErrors.dueDate && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Due">Due (Pending)</option>
                <option value="Paid">Paid (Settled)</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Amount (£) *</label>
            <input
              type="number"
              className="form-input"
              style={fieldErrors.amount ? { borderColor: '#EF4444' } : {}}
              min="0"
              step="0.01"
              placeholder="e.g. 1500.00"
              value={items[0]?.unitPrice || ''}
              onChange={(e) => { setItems([{ description: 'Invoice Amount', quantity: 1, unitPrice: Number(e.target.value) }]); setFieldErrors(p => ({ ...p, amount: '' })); }}
            />
            {fieldErrors.amount && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.amount}</span>}
          </div>

        </form>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="spin-icon" />
                <span>Generating Invoice...</span>
              </>
            ) : (
              <>
                <Receipt size={15} />
                <span>Create Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceCreateModal;

