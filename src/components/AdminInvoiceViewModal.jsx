import React from 'react';
import { X, Printer, Download, Receipt, Building2, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import '../styles/Modals.css';
import '../styles/AdminInvoices.css';

const AdminInvoiceViewModal = ({
  invoice,
  isOpen,
  onClose
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const company = invoice.company || {};
  const items = invoice.items || [];
  const subtotal = invoice.subtotal || (invoice.amount ? invoice.amount / 1.2 : 0);
  const tax = invoice.tax || (invoice.amount ? invoice.amount - subtotal : 0);
  const total = invoice.amount || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-header-icon-box" style={{ background: 'rgba(109, 44, 249, 0.1)', color: '#6D2CF9' }}>
              <Receipt size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Tax Invoice Statement: {invoice.invoiceNumber}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Official customer billing document
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Target */}
        <div
          id="printable-invoice-target"
          className="printable-invoice-container"
          style={{ overflowY: 'auto', flex: 1 }}
        >
          {/* Brand Header — Customer info left, Invoice info right */}
          <div className="invoice-brand-row">
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0F071D' }}>
                {(() => {
                  const n = company.companyName || company.primaryUserName || '—';
                  return n === '—' ? n : n.charAt(0).toUpperCase() + n.slice(1);
                })()}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '2px' }}>
                Account Ref: <strong style={{ color: '#6D2CF9' }}>{company.accountNumber || ''}</strong>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '4px', lineHeight: '1.5' }}>
                {company.billingContact?.name && <div>Attn: {company.billingContact.name}</div>}
                {(company.billingContact?.email || company.email) && <div>{company.billingContact?.email || company.email}</div>}
                {company.address?.street && <div>{company.address.street}</div>}
                {(company.address?.city || company.address?.postalCode) && (
                  <div>{[company.address?.city, company.address?.postalCode].filter(Boolean).join(', ')}</div>
                )}
                {company.address?.country && <div>{company.address.country}</div>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '900', color: '#0F071D', letterSpacing: '0.04em' }}>
                TAX INVOICE
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '800', color: '#6D2CF9', marginTop: '2px' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '4px', lineHeight: '1.5' }}>
                Issued: <strong>{new Date(invoice.invoiceDate).toLocaleDateString()}</strong><br />
                Due Date: <strong style={{ color: invoice.status === 'Overdue' ? '#EF4444' : '#0F071D' }}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="invoice-preview-items">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Description of Telecom Services</th>
                <th style={{ textAlign: 'center', width: '15%' }}>Quantity</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Unit Price</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ color: '#0F071D' }}>{it.description}</div>
                    </td>
                    <td style={{ textAlign: 'center', color: '#475569' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                      £{Number(it.unitPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                      £{Number(it.total || (it.quantity * it.unitPrice) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ color: '#0F071D' }}>Enterprise Telecommunications Billing Period</td>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>£{total.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>£{total.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Box */}
          <div className="invoice-preview-totals">
            <div className="invoice-preview-totals-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#475569' }}>
                <span>Subtotal (Net):</span>
                <span style={{ fontFamily: 'monospace' }}>£{Number(subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#475569' }}>
                <span>VAT @ 20.0%:</span>
                <span style={{ fontFamily: 'monospace' }}>£{Number(tax).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#0F071D', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total Amount Due:</span>
                <span style={{ color: '#0F071D', fontFamily: 'monospace' }}>
                  £{Number(total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceViewModal;

