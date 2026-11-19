import React, { useEffect } from 'react';
import { CheckCircle2, Trash2, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={16} />,
  delete:  <Trash2 size={16} />,
  error:   <AlertCircle size={16} />,
};

const colors = {
  success: { bg: '#F0FDF4', border: '#86EFAC', color: '#15803D' },
  delete:  { bg: '#FEF2F2', border: '#FCA5A5', color: '#B91C1C' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', color: '#B91C1C' },
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const c = colors[type] || colors.success;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '28px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '12px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
        color: c.color,
        fontSize: '0.875rem',
        fontWeight: '600',
        minWidth: '260px',
        maxWidth: '400px',
        animation: 'toastIn 0.2s ease',
      }}>
        <span style={{ flexShrink: 0 }}>{icons[type]}</span>
        <span style={{ flex: 1 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, padding: 0, display: 'flex', marginLeft: '4px' }}>
          <X size={14} />
        </button>
      </div>
    </>
  );
};

export default Toast;
