import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 80, marginBottom: 8, fontWeight: 900, color: 'var(--border)' }}>404</div>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <h1 style={{ fontWeight: 800, marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 28 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">🏠 Go Home</Link>
    </div>
  </div>
);
export default NotFound;
