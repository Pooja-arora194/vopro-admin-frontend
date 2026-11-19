import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '32px', height: '32px', padding: '0 8px',
    borderRadius: '8px', fontSize: '0.8125rem', fontWeight: '600',
    cursor: 'pointer', border: '1px solid #E2E8F0',
    background: '#FFFFFF', color: 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  };

  const btnStyle = (disabled) => ({ ...base, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' });
  const activeStyle = { ...base, background: '#6D2CF9', color: '#FFFFFF', border: '1px solid #6D2CF9', cursor: 'default' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderTop: '1px solid #F1F5F9',
      flexWrap: 'wrap', gap: '10px',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
        Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={btnStyle(currentPage === 1)}>
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`d${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)} style={p === currentPage ? activeStyle : base}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={btnStyle(currentPage === totalPages)}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
