import React from 'react';

export const Pill = ({ children, color = '#16A34A', bg }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: bg || color + '18',
      color,
      border: `1px solid ${color}35`,
      borderRadius: 99,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'Outfit',sans-serif",
    }}
  >
    {children}
  </span>
);
