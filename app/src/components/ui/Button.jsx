import React from 'react';

export const Btn = ({
  children,
  onClick,
  color = '#16A34A',
  outline = false,
  sm = false,
  disabled = false,
  full = false,
  style = {},
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: sm ? '6px 14px' : '10px 20px',
      borderRadius: 99,
      border: outline ? `2px solid ${color}` : 'none',
      background: disabled ? '#E4E4E7' : outline ? 'transparent' : color,
      color: disabled ? '#A1A1AA' : outline ? color : '#fff',
      fontWeight: 700,
      fontSize: sm ? 12 : 14,
      fontFamily: "'Outfit',sans-serif",
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: full ? '100%' : 'auto',
      ...style,
    }}
  >
    {children}
  </button>
);
