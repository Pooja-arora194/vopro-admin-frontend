import React from 'react';

const GradientIcon = ({ icon: Icon, size = 16 }) => {
  const gradId = `gi-${size}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <span className="gradient-icon-wrap" style={{ display: 'inline-flex', flexShrink: 0 }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D2CF9" />
            <stop offset="100%" stopColor="#FF6633" />
          </linearGradient>
        </defs>
      </svg>
      <Icon size={size} style={{ stroke: `url(#${gradId})` }} />
    </span>
  );
};

export default GradientIcon;
