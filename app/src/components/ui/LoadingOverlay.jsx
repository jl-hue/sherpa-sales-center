import React from 'react';

export function LoadingOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid #C0EAD3',
          borderTopColor: '#16A34A',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }}
      />
      <div
        style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 600,
          color: '#16A34A',
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        Synchronisation Supabase...
      </div>
    </div>
  );
}
