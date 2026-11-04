import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const s = sizes[size] || 36;
  return (
    <div className="loader-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
      <div className="spinner" style={{ width: s, height: s, border: `3px solid var(--border)`, borderTop: `3px solid var(--primary)`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</p>}
    </div>
  );
};

export default Loader;
