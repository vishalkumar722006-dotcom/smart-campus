import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RESOURCE_IMAGES = {
  'Computer Lab': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
  'Classroom': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
  'Seminar Hall': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'Auditorium': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80',
  'Library Study Room': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  'Conference Room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80',
};

const getImage = (type) => RESOURCE_IMAGES[type] || RESOURCE_IMAGES['default'];

const features = [
  { icon: '🔐', title: 'Secure Authentication', desc: 'JWT-based login with email OTP verification for all accounts.' },
  { icon: '⚡', title: 'Real-Time Availability', desc: 'Check resource availability instantly. No double bookings, ever.' },
  { icon: '📅', title: 'Smart Booking', desc: 'Book rooms, labs and equipment with conflict detection built in.' },
  { icon: '🎓', title: 'Role-Based Access', desc: 'Students, faculty and admins each have tailored dashboards.' },
  { icon: '📧', title: 'Email Notifications', desc: 'Get booking confirmations and status updates by email.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Book resources from any device — desktop, tablet or phone.' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Register with your university email and verify with OTP.' },
  { num: '02', title: 'Browse Resources', desc: 'Explore labs, rooms, halls and equipment available on campus.' },
  { num: '03', title: 'Make a Booking', desc: 'Select a date and time, then confirm your reservation instantly.' },
  { num: '04', title: 'Manage Bookings', desc: 'View, track and cancel bookings from your personal dashboard.' },
];

const categories = [
  { icon: '🖥️', label: 'Computer Labs', color: '#3b82f6' },
  { icon: '🏛️', label: 'Classrooms', color: '#8b5cf6' },
  { icon: '🎤', label: 'Seminar Halls', color: '#f59e0b' },
  { icon: '📽️', label: 'Projectors', color: '#ef4444' },
  { icon: '🤝', label: 'Meeting Rooms', color: '#10b981' },
  { icon: '⚽', label: 'Sports Facilities', color: '#f97316' },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredResources, setFeaturedResources] = useState([]);
  const [stats, setStats] = useState({ resources: 15, bookings: 0, users: 0 });

  useEffect(() => {
    api.get('/resources?limit=6').then(r => {
      setFeaturedResources((r.data.data || r.data).slice(0, 6));
    }).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">🎓 University Resource Portal</div>
          <h1 className="hero-title">
            Smart Campus<br />
            <span className="hero-title-accent">Resource Booking</span>
          </h1>
          <p className="hero-subtitle">
            Find, reserve and manage university resources easily.<br />
            Book classrooms, labs, seminar halls and more — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/resources" className="btn btn-primary btn-lg">
              🔍 Explore Resources
            </Link>
            {user ? (
              <Link to={`/dashboard/${user.role}`} className="btn btn-outline btn-lg">
                📊 My Dashboard →
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline btn-lg">
                🚀 Login to Book →
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>15+</strong><span>Resources</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>100%</strong><span>Real-time</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>3</strong><span>Roles</span></div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2>Resource Categories</h2>
            <p>Everything your campus needs, in one portal</p>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.label} to={`/resources?type=${encodeURIComponent(cat.label)}`}
                className="category-card" style={{ '--cat-color': cat.color }}>
                <div className="category-icon">{cat.icon}</div>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-subtle">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in minutes with these simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map(s => (
              <div key={s.num} className="step-card">
                <div className="step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED RESOURCES */}
      {featuredResources.length > 0 && (
        <section className="section bg-white">
          <div className="container">
            <div className="section-header">
              <h2>Featured Resources</h2>
              <p>Popular campus resources available for booking</p>
            </div>
            <div className="resources-grid">
              {featuredResources.map(resource => (
                <div key={resource._id} className="resource-card">
                  <div className="resource-card-image">
                    <img src={resource.image || getImage(resource.type)} alt={resource.name}
                      onError={e => { e.target.src = getImage('default'); }} />
                    <div className="resource-card-tag">{resource.type}</div>
                    <div className={`resource-card-badge ${resource.availability ? 'badge-available' : 'badge-unavailable'}`}>
                      {resource.availability ? '● Available' : '● Unavailable'}
                    </div>
                  </div>
                  <div className="resource-card-body">
                    <h3 className="resource-card-title">{resource.name}</h3>
                    <div className="resource-card-meta">
                      <span>📍 {resource.location}</span>
                      <span>👥 {resource.capacity}</span>
                    </div>
                    <div className="resource-card-actions">
                      <Link to={`/resources/${resource._id}`} className="btn btn-outline btn-sm">Details</Link>
                      {resource.availability && (
                        <Link to={user ? `/resources/${resource._id}` : '/login'} className="btn btn-primary btn-sm">Book Now</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/resources" className="btn btn-outline btn-lg">View All Resources →</Link>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="section bg-subtle">
        <div className="container">
          <div className="section-header">
            <h2>Why Smart Campus?</h2>
            <p>Built for modern universities with security and simplicity in mind</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12, color: '#fff' }}>
              Ready to get started?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 28, fontSize: '1.1rem' }}>
              Join thousands of students and faculty managing campus resources efficiently.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
                Create Free Account
              </Link>
              <Link to="/resources" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                Browse Resources
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
