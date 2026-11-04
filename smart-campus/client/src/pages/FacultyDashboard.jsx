import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import BookingFormModal from '../components/BookingFormModal';

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';

const RESOURCE_IMAGES = {
  'Computer Lab': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&q=60',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=60',
};

const isAvail = (a) => a === true || a === 'true' || a === 'available';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [bookingResource, setBookingResource] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/bookings'),
      api.get('/resources?limit=6'),
    ]).then(([bRes, rRes]) => {
      const bData = bRes.data.bookings || bRes.data.data || bRes.data;
      setBookings(Array.isArray(bData) ? bData : []);

      const rData = rRes.data.resources || rRes.data.data || rRes.data;
      const rArray = Array.isArray(rData) ? rData : [];
      setResources(rArray.filter(r => isAvail(r.availability)).slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);

  const upcoming = bookings.filter(b => ['pending','approved'].includes(b.status?.toLowerCase()) && new Date(b.bookingDate) >= today);
  const approved = bookings.filter(b => b.status?.toLowerCase() === 'approved');
  const completed = bookings.filter(b => b.status?.toLowerCase() === 'completed');

  const tabBookings = { upcoming, approved, completed, all: bookings }[tab] || [];

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Loader /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1>Welcome, Prof. {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
          <p>Manage your resource bookings and reservations</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <div className="stats-grid">
          {[
            { icon: '📅', label: 'Total Bookings', value: bookings.length, color: '#8b5cf6' },
            { icon: '✅', label: 'Approved', value: approved.length, color: '#10b981' },
            { icon: '⏳', label: 'Upcoming', value: upcoming.length, color: '#f59e0b' },
            { icon: '📊', label: 'Completed', value: completed.length, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-section">
          <div className="section-title-bar">
            <h2>Available Resources</h2>
            <Link to="/resources" className="btn btn-outline btn-sm">Browse All →</Link>
          </div>
          <div className="resources-grid-sm">
            {resources.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No available resources found.</p>
            ) : resources.map(r => (
              <div key={r._id} className="resource-card-sm">
                <img src={r.image || RESOURCE_IMAGES[r.type] || RESOURCE_IMAGES.default} alt={r.name}
                  onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
                <div className="resource-card-sm-body">
                  <div className="resource-card-sm-title">{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>📍 {r.location} · 🏷️ {r.type}</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setBookingResource(r)}>
                    Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-title-bar">
            <h2>Booking History</h2>
            <Link to="/my-bookings" className="btn btn-outline btn-sm">Full History →</Link>
          </div>
          <div className="tabs-bar" style={{ marginBottom: 16 }}>
            {['upcoming', 'approved', 'completed', 'all'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className="tab-count">{({ upcoming, approved, completed, all: bookings }[t] || []).length}</span>
              </button>
            ))}
          </div>
          {tabBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <p>No {tab} bookings found.</p>
              <Link to="/resources" className="btn btn-primary btn-sm">Book a Resource</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tabBookings.slice(0, 6).map(b => (
                <div key={b._id} className="booking-row">
                  <div className="booking-row-info">
                    <div className="booking-row-name">{b.resource?.name || 'Deleted Resource'}</div>
                    <div className="booking-row-meta">
                      📅 {fmtDate(b.bookingDate)} &nbsp;·&nbsp; 🕐 {fmt12(b.startTime)} – {fmt12(b.endTime)}
                      &nbsp;·&nbsp; 📍 {b.resource?.location}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                  <Link to={`/bookings/${b._id}`} className="btn btn-outline btn-sm">Details</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {bookingResource && (
        <BookingFormModal resource={bookingResource} onClose={() => setBookingResource(null)}
          onSuccess={() => {
            setBookingResource(null);
            api.get('/bookings').then(r => {
              const d = r.data.bookings || r.data.data || r.data;
              setBookings(Array.isArray(d) ? d : []);
            });
          }} />
      )}
    </div>
  );
};

export default FacultyDashboard;