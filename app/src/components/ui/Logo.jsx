import React from 'react';

export const Logo = ({ size = 28, white = false }) => (
  <svg width={size * 1.55} height={size} viewBox="0 0 48 31" fill="none">
    <rect
      x="0"
      y="0"
      width="38"
      height="13"
      rx="6.5"
      fill={white ? 'rgba(255,255,255,.95)' : '#3BC47F'}
    />
    <rect
      x="10"
      y="18"
      width="38"
      height="13"
      rx="6.5"
      fill={white ? 'rgba(255,255,255,.65)' : '#16A34A'}
    />
  </svg>
);
