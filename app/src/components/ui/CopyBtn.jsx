import React, { useState } from 'react';

export function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }

  return (
    <button
      onClick={copy}
      className="copy-btn"
      style={{
        padding: '7px 16px',
        borderRadius: 99,
        border: 'none',
        background: copied ? '#16A34A' : '#18181B',
        color: '#fff',
        fontWeight: 700,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: "'Outfit',sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}
    >
      {copied ? '\u2713 Copi\u00e9 !' : '\uD83D\uDCCB Copier le script'}
    </button>
  );
}
