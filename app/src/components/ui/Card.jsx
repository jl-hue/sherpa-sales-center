import React from 'react';

export const C = ({ children, style = {} }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #E4E4E7',
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

export const GC = ({ children, style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(135deg,#16A34A 0%,#62E58E 100%)',
      borderRadius: 16,
      padding: 20,
      border: 'none',
      ...style,
    }}
  >
    {children}
  </div>
);
