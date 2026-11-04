import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { icon: '🎓', value: '500+', label: 'Students Registered' },
  { icon: '🏛️', value: '50+', label: 'Campus Resources' },
  { icon: '📅', value: '1000+', label: 'Bookings Made' },
  { icon: '⚡', value: '99%', label: 'Uptime Guaranteed' },
];

const features = [
  { icon: '📧', title: 'Email OTP Verification', desc: 'Secure registration with email-verified OTP for every new account.' },
  { icon: '🔐', title: 'JWT Authentication', desc: 'Industry-standard token-based login with role-based access control.' },
  { icon: '⚡', title: 'Conflict Detection', desc: 'Real-time booking conflict detection prevents double bookings instantly.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Separate dashboards for Students, Faculty, and Admins.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'Full CRUD operations, booking approvals, and resource management.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Fully responsive design that works on any device, anywhere.' },
];

const steps = [
  { num: '01', title: 'Register & Verify', desc: 'Sign up with your university email and verify with OTP.' },
  { num: '02', title: 'Browse Resources', desc: 'Explore available classrooms, labs, halls and equipment.' },
  { num: '03', title: 'Book Instantly', desc: 'Select your slot and get instant confirmation.' },
];

const team = [
  { name: 'Vishal Chaurasiya', role: 'Full Stack Developer', avatar: 'VC', color: '#6366f1' },
  { name: 'Smart Campus', role: 'University Project', avatar: 'SC', color: '#8b5cf6' },
  { name: 'MERN Stack', role: 'MongoDB · Express · React · Node', avatar: 'MS', color: '#06b6d4' },
];

const About = () => (
  <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>

    {/* ── Hero ── */}
    <div style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)',
      padding: '80px 20px 60px', textAlign: 'center', color: '#fff',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.15)', borderRadius: 100,
        padding: '6px 18px', fontSize: 13, fontWeight: 600, marginBottom: 20,
      }}>
        🏫 University Resource Booking Portal
      </div>
      <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.15 }}>
        About <span style={{ color: '#a5b4fc' }}>Smart Campus</span>
      </h1>
      <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
        A unified platform empowering students and faculty to reserve campus resources — with ease, speed, and full transparency.
      </p>
      <Link to="/resources" style={{
        display: 'inline-block', background: '#fff', color: '#4f46e5',
        fontWeight: 700, padding: '13px 28px', borderRadius: 100,
        textDecoration: 'none', fontSize: 15, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        transition: 'transform .2s',
      }}>
        Explore Resources →
      </Link>
    </div>

    {/* ── Stats ── */}
    <div style={{ background: '#fff', padding: '40px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 20px 60px' }}>

      {/* ── Mission ── */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px', marginBottom: 36,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
        display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 72 }}>🎯</div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Our Mission</h2>
          <p style={{ color: 'var(--text-light)', lineHeight: 1.8, fontSize: 15, margin: 0 }}>
            Smart Campus was built to eliminate the chaos of manual resource booking at universities. 
            We believe every student and faculty member deserves a fast, fair, and transparent way 
            to access campus facilities — from classrooms to computer labs, seminar halls to sports grounds.
          </p>
        </div>
      </div>

      {/* ── How it works ── */}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>
        How It Works
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{
            background: '#fff', borderRadius: 14, padding: '28px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -10, right: -10,
              fontSize: 64, fontWeight: 900, color: 'rgba(99,102,241,0.06)', lineHeight: 1,
            }}>{s.num}</div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 800, fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            }}>{i + 1}</div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{s.title}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>
        Platform Features
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 40 }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: '#fff', borderRadius: 12, padding: '22px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--border)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: 'var(--primary-light)',
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{f.icon}</div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tech Stack ── */}
      <div style={{
        background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16,
        padding: '36px 32px', marginBottom: 36, color: '#fff', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>⚙️ Built With Modern Tech</h2>
        <p style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>Production-ready MERN stack architecture</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
          {['MongoDB', 'Express.js', 'React 18', 'Node.js', 'JWT Auth', 'Nodemailer', 'Vite', 'REST API'].map(t => (
            <span key={t} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Team ── */}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>
        Meet the Team
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginBottom: 40 }}>
        {team.map(m => (
          <div key={m.name} style={{
            background: '#fff', borderRadius: 14, padding: '28px 20px', textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
              background: `linear-gradient(135deg,${m.color},${m.color}99)`,
              color: '#fff', fontSize: 22, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{m.avatar}</div>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{m.name}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: 13, margin: 0 }}>{m.role}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div style={{
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 16,
        padding: '40px 32px', textAlign: 'center', color: '#fff',
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Ready to get started?</h2>
        <p style={{ opacity: 0.85, marginBottom: 24, fontSize: 15 }}>Join hundreds of students already using Smart Campus</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            background: '#fff', color: '#6366f1', fontWeight: 700,
            padding: '12px 24px', borderRadius: 100, textDecoration: 'none', fontSize: 14,
          }}>Create Account →</Link>
          <Link to="/resources" style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600,
            padding: '12px 24px', borderRadius: 100, textDecoration: 'none', fontSize: 14,
            border: '1.5px solid rgba(255,255,255,0.3)',
          }}>Browse Resources</Link>
        </div>
      </div>

    </div>
  </div>
);

export default About;