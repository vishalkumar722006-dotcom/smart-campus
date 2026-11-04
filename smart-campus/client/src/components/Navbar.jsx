import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'faculty') return '/dashboard/faculty';
    return '/dashboard/student';
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon">🏛</span>
          <span>Smart<strong>Campus</strong></span>
        </Link>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>
          <Link to="/resources" className={location.pathname.startsWith('/resources') ? 'nav-link active' : 'nav-link'}>Resources</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'}>About</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'nav-link active' : 'nav-link'}>Contact</Link>
          {user ? (
            <>
              {getDashboardLink() && (
                <Link to={getDashboardLink()} className={location.pathname.startsWith('/dashboard') ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
              )}
              {(user.role === 'student' || user.role === 'faculty') && (
                <Link to="/my-bookings" className={location.pathname === '/my-bookings' ? 'nav-link active' : 'nav-link'}>My Bookings</Link>
              )}
              <div className="nav-user-menu">
                <button className="nav-user-btn">
                  <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                  <span className="nav-username">{user.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: 10 }}>▼</span>
                </button>
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                  <Link to="/profile" className="nav-dropdown-item">Profile</Link>
                  <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
