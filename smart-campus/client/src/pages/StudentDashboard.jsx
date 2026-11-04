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
  'Classroom': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&q=60',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&q=60',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [bookingResource, setBookingResource] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/bookings'),
      api.get('/resources?limit=6'),
    ]).then(([bRes, rRes]) => {
      const bData = bRes.data.data || bRes.data.bookings || bRes.data;
setBookings(Array.isArray(bData) ? bData : []);
const rData = rRes.data.resources || rRes.data.data || rRes.data;
setResources(Array.isArray(rData) ? rData.slice(0,6) : []);
     // setBookings(bRes.data.data || bRes.data);
      //setResources((rRes.data.data || rRes.data).slice(0,6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = bookings.filter(b => ['pending','approved'].includes(b.status) && new Date(b.bookingDate) >= today);
  const pending = bookings.filter(b => b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  const tabBookings = {
    upcoming,
    pending,
    completed,
    all: bookings,
  }[tab] || [];

  const filteredResources = resources.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Loader /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your booking overview for today</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📅', label: 'Total Bookings', value: bookings.length, color: '#3b82f6' },
            { icon: '⏳', label: 'Upcoming', value: upcoming.length, color: '#f59e0b' },
            { icon: '✅', label: 'Completed', value: completed.length, color: '#10b981' },
            { icon: '🏛️', label: 'Resources Available', value: resources.filter(r => r.availability).length, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick search */}
        <div className="dashboard-section">
          <div className="section-title-bar">
            <h2>Quick Book a Resource</h2>
            <Link to="/resources" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="text" className="form-control" placeholder="🔍 Search resources by name or type..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="resources-grid-sm">
            {filteredResources.filter(r => r.availability).slice(0, 4).map(r => (
              <div key={r._id} className="resource-card-sm">
                <img src={r.image || RESOURCE_IMAGES[r.type] || RESOURCE_IMAGES.default} alt={r.name}
                  onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
                <div className="resource-card-sm-body">
                  <div className="resource-card-sm-title">{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>📍 {r.location} · 👥 {r.capacity}</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setBookingResource(r)}>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div className="dashboard-section">
          <div className="section-title-bar">
            <h2>My Bookings</h2>
            <Link to="/my-bookings" className="btn btn-outline btn-sm">See All →</Link>
          </div>
          <div className="tabs-bar" style={{ marginBottom: 16 }}>
            {['upcoming', 'pending', 'completed', 'all'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className="tab-count">{tabBookings.length}</span>
              </button>
            ))}
          </div>

          {tabBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <div className="empty-icon" style={{ fontSize: 36 }}>📭</div>
              <p>No {tab} bookings</p>
              <Link to="/resources" className="btn btn-primary btn-sm">Browse Resources</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tabBookings.slice(0, 5).map(b => (
                <div key={b._id} className="booking-row">
                  <div className="booking-row-info">
                    <div className="booking-row-name">{b.resource?.name || 'Deleted Resource'}</div>
                    <div className="booking-row-meta">
                      📅 {fmtDate(b.bookingDate)} &nbsp;·&nbsp; 🕐 {fmt12(b.startTime)} – {fmt12(b.endTime)}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                  <Link to={`/bookings/${b._id}`} className="btn btn-outline btn-sm">Details</Link>
                </div>
              ))}
              {tabBookings.length > 5 && (
                <Link to="/my-bookings" style={{ textAlign: 'center', color: 'var(--primary)', fontSize: 13, padding: 8 }}>
                  View {tabBookings.length - 5} more →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {bookingResource && (
        <BookingFormModal resource={bookingResource} onClose={() => setBookingResource(null)}
          onSuccess={() => { setBookingResource(null); api.get('/bookings').then(r => setBookings(r.data.data || r.data)); }} />
      )}
    </div>
  );
};

export default StudentDashboard;
