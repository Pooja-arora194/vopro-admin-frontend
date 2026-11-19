import React from 'react';
import { X, Printer } from 'lucide-react';
import StatusBadge from './StatusBadge';
import '../styles/Modals.css';

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Tax Invoice {invoice.invoiceNumber}
            </h3>
            <StatusBadge status={invoice.status} />
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Printable Invoice View */}
        <div className="modal-body" id="printable-invoice">
          {/* Header Banner */}
          <div className="invoice-brand-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  VoPro
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Telecommunications Ltd
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                VoPro Tower, 100 Bishopsgate<br />
                London EC2N 4AG, United Kingdom<br />
                VAT Reg: GB 948 2018 33 | Co. Reg: 08392019
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                INVOICE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9375rem', fontWeight: '700', color: 'var(--primary)' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Issued: {new Date(invoice.invoiceDate).toLocaleDateString()}<br />
                Due: <strong style={{ color: invoice.status === 'Overdue' ? 'var(--danger)' : 'var(--text-main)' }}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Billed To / Account Information */}
          <div className="modal-highlight-box modal-grid-2col" style={{ gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Billed To Customer:
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {invoice.company?.companyName || 'Apex Logistics UK Ltd'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Account Ref: <strong>{invoice.company?.accountNumber || 'VP-CUST'}</strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {invoice.company?.billingContact?.address || 'United Kingdom'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Payment Status:
              </div>
              <div style={{ marginBottom: '6px' }}>
                <StatusBadge status={invoice.status} />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Terms: <strong>Net 30 Days</strong>
              </div>
              {invoice.paidAt && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: '600' }}>
                  Settled on {new Date(invoice.paidAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <table className="vopro-table" style={{ marginBottom: '24px' }}>
            <thead>
              <tr>
                <th style={{ width: '55%' }}>Description / Service Provision</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        {item.description}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      £{Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      £{Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>VoPro Unified Telephony Recurring Cloud PBX & Trunking Retainer</td>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td style={{ textAlign: 'right' }}>£{Number(invoice.amount * 0.833).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>£{Number(invoice.amount * 0.833).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="invoice-totals-wrapper">
            <div className="invoice-totals-box">
              <div className="invoice-total-line">
                <span>Subtotal:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  £{Number(invoice.subtotal || invoice.amount * 0.833).toFixed(2)}
                </span>
              </div>
              <div className="invoice-total-line">
                <span>UK VAT (20.0%):</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  £{Number(invoice.tax || invoice.amount * 0.167).toFixed(2)}
                </span>
              </div>
              <div className="invoice-grand-total">
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  £{Number(invoice.amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Payment Information Box */}
          <div className="bank-details-box">
            <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
              BACS / Electronic Bank Transfer Instructions:
            </div>
            <div>Bank: Barclays Corporate Banking UK | Sort Code: 20-00-00 | Account No: 83920192</div>
            <div>Beneficiary: VoPro Telecommunications Ltd | Reference: <strong>{invoice.invoiceNumber}</strong></div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
