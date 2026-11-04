import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Access Denied</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: 28, fontSize: '1.05rem' }}>You don't have permission to view this page.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
          {user ? <Link to={`/dashboard/${user.role}`} className="btn btn-primary">My Dashboard</Link>
            : <Link to="/login" className="btn btn-primary">Login</Link>}
        </div>
      </div>
    </div>
  );
};
export default Unauthorized;
