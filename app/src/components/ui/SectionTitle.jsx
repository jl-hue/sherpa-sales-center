import React from 'react';

export const ST = ({ children, sub, emoji }) => (
  <div style={{ marginBottom: 22 }}>
    <h1
      style={{
        fontSize: 22,
        fontWeight: 900,
        color: '#18181B',
        margin: '0 0 4px',
        fontFamily: "'Outfit',sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {emoji && <span>{emoji}</span>}
      {children}
    </h1>
    {sub && <p style={{ color: '#71717A', margin: 0, fontSize: 13 }}>{sub}</p>}
  </div>
);
