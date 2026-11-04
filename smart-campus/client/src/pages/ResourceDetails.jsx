import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import BookingFormModal from '../components/BookingFormModal';

const RESOURCE_IMAGES = {
  'Computer Lab': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
  'Classroom': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  'Seminar Hall': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'Auditorium': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
  'Library Study Room': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  'Conference Room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
};

const isAvail = (a) => a === true || a === 'true' || a === 'available';

const ResourceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    api.get(`/resources/${id}`)
      .then(r => setResource(r.data.resource || r.data.data || r.data))
      .catch(() => navigate('/resources'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Loader /></div>;
  if (!resource) return null;

  const img = resource.image || RESOURCE_IMAGES[resource.type] || RESOURCE_IMAGES.default;
  const available = isAvail(resource.availability);

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-light)' }}>
        <Link to="/resources" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Resources</Link>
        {' → '}
        <span>{resource.name}</span>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="resource-detail-layout">
          {/* Left: Info */}
          <div className="resource-detail-main">
            <div className="resource-detail-hero">
              <img src={img} alt={resource.name} onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
              <div className="resource-detail-hero-overlay">
                <div className="resource-card-tag" style={{ position: 'static', fontSize: 13 }}>{resource.type}</div>
                <div className={`resource-card-badge ${available ? 'badge-available' : 'badge-unavailable'}`} style={{ position: 'static', fontSize: 13 }}>
                  {available ? '● Available' : '● Unavailable'}
                </div>
              </div>
            </div>

            <div className="resource-detail-body">
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>{resource.name}</h1>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.7, marginBottom: 24 }}>{resource.description}</p>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-info-label">📍 Location</span>
                  <span className="detail-info-value">{resource.location}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">👥 Capacity</span>
                  <span className="detail-info-value">{resource.capacity} people</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">🏷️ Type</span>
                  <span className="detail-info-value">{resource.type}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">📊 Status</span>
                  <span className="detail-info-value" style={{ color: available ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {available ? 'Available for Booking' : 'Currently Unavailable'}
                  </span>
                </div>
              </div>

              {resource.facilities?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Facilities & Amenities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {resource.facilities.map(f => (
                      <span key={f} className="facility-chip" style={{ padding: '6px 14px', fontSize: 13 }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking box */}
          <div className="resource-detail-sidebar">
            <div className="booking-box">
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Book This Resource</h3>
              <p style={{ color: 'var(--text-light)', fontSize: 13, marginBottom: 20 }}>
                {available ? 'Available — select a date and time to reserve.' : 'This resource is currently unavailable for booking.'}
              </p>

              {available ? (
                user ? (
                  <button className="btn btn-primary btn-block btn-lg" onClick={() => setShowBooking(true)}>
                    📅 Book Now
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-block btn-lg">
                    🔐 Login to Book
                  </Link>
                )
              ) : (
                <button className="btn btn-block btn-lg" disabled style={{ background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed' }}>
                  Unavailable
                </button>
              )}

              <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8 }}>
                  <div>📍 <strong>Location:</strong> {resource.location}</div>
                  <div>👥 <strong>Capacity:</strong> {resource.capacity} people</div>
                  {resource.facilities?.[0] && <div>✨ <strong>Top facility:</strong> {resource.facilities[0]}</div>}
                </div>
              </div>

              <Link to="/resources" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--primary)' }}>
                ← Back to all resources
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingFormModal resource={resource} onClose={() => setShowBooking(false)} onSuccess={() => setShowBooking(false)} />
      )}
    </div>
  );
};

export default ResourceDetails;