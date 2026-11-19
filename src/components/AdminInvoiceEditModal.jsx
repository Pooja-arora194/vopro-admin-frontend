import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';
import '../styles/AdminInvoices.css';

const AdminInvoiceEditModal = ({
  invoice,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Due');
  const [paymentMethod, setPaymentMethod] = useState('BACS / Direct Debit');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoice) {
      setInvoiceNumber(invoice.invoiceNumber || '');
      setInvoiceDate(invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '');
      setDueDate(invoice.dueDate ? invoice.dueDate.split('T')[0] : '');
      setStatus(invoice.status || 'Due');
      setPaymentMethod(invoice.paymentMethod || 'BACS / Direct Debit');
      setNotes(invoice.notes || '');

      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map(it => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        })));
      } else {
        setItems([{
          description: 'Telecom Services',
          quantity: 1,
          unitPrice: invoice.amount || 0
        }]);
      }
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

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

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setError('Invoice must have at least one line item.');
      return;
    }
    setError('');
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : Number(value)
    };
    setItems(updated);
  };

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
    if (!invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    const amount = Number(items[0]?.unitPrice) || 0;
    if (amount <= 0) errs.amount = 'Amount must be greater than zero';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      const res = await api.put(`/invoices/${invoice._id}`, {
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        invoiceDate,
        dueDate,
        items,
        notes,
        status,
        paymentMethod
      });

      if (res.data.success) {
        onSuccess(res.data.invoice, 'Invoice updated successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update invoice.');
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
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109, 44, 249, 0.1)', color: '#6D2CF9' }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Edit Invoice {invoice.invoiceNumber}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Customer: <strong>{invoice.company?.primaryUserName || invoice.company?.billingContact?.name || invoice.company?.companyName || 'Customer'}</strong> ({invoice.company?.accountNumber || 'VP-CUST'})
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '0.8125rem', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Invoice Number & Status */}
          <div className="modal-grid-2col" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Invoice Number *</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'monospace', fontWeight: '700', ...(fieldErrors.invoiceNumber ? { borderColor: '#EF4444' } : {}) }}
                value={invoiceNumber}
                onChange={(e) => { setInvoiceNumber(e.target.value); setFieldErrors(p => ({ ...p, invoiceNumber: '' })); }}
              />
              {fieldErrors.invoiceNumber && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{fieldErrors.invoiceNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
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

          {/* Row 2: Dates */}
          <div className="modal-grid-2col" style={{ marginBottom: '16px' }}>
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
                <span>Due Date *</span>
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

        {/* Footer */}
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
                <span>Updating Invoice...</span>
              </>
            ) : (
              <>
                <Edit3 size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceEditModal;

