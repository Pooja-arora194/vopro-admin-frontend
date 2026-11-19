import React from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ title, subtitle, message, itemName, onConfirm, onCancel, customerName }) => {
  // Support both old (customerName) and new (itemName) prop
  const displayName = itemName || customerName || '';
  const displayTitle = title || 'Delete';
  const displaySubtitle = subtitle || 'This action cannot be undone';
  const displayMessage = message || `Are you sure you want to delete`;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'modalEnter 0.2s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Trash2 size={15} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0F172A' }}>
                {displayTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '1px' }}>
                {displaySubtitle}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94A3B8', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 24px' }}>
          <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
            {displayMessage}{' '}
            {displayName && (
              <strong style={{ color: '#0F172A' }}>"{displayName}"</strong>
            )}
            ?
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '0 20px 18px',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '0.875rem', fontWeight: '600',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              color: '#475569', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px', borderRadius: '8px',
              fontSize: '0.875rem', fontWeight: '700',
              background: '#EF4444', border: 'none',
              color: '#FFFFFF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
