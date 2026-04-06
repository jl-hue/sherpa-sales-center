import React from 'react';
import { C } from './Card';

export const Stat = ({ icon, label, value, sub, color = '#16A34A' }) => (
  <C style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 14,
        background: `linear-gradient(135deg,${color},${color}CC)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 19,
        flexShrink: 0,
        boxShadow: `0 4px 12px ${color}40`,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#18181B',
          lineHeight: 1,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#3F3F46', marginTop: 2 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{sub}</div>
      )}
    </div>
  </C>
);
