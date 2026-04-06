import React from 'react';

export const Tog = ({ value, onChange, color = '#16A34A' }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48,
      height: 26,
      borderRadius: 13,
      background: value ? color : '#E4E4E7',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      flexShrink: 0,
      transition: 'background .2s',
    }}
  >
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 3,
        left: value ? 25 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }}
    />
  </button>
);
