import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';

const TABS = [
  { key:'all', label:'All' },
  { key:'pending', label:'Pending' },
  { key:'approved', label:'Approved' },
  { key:'completed', label:'Completed' },
  { key:'cancelled', label:'Cancelled' },
  { key:'rejected', label:'Rejected' },
];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '-';

const fmtTime = (t) => {
  if (!t) return '-';
  const [h,m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
};

const resourceImages = {
  'Computer Lab': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=80&h=80&fit=crop',
  'Classroom': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=80&h=80&fit=crop',
  'Seminar Hall': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=80&h=80&fit=crop',
  'Auditorium': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  'Library': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80&h=80&fit=crop',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=80&h=80&fit=crop',
};

const getImg = (type) => {
  if (!type) return resourceImages.default;
  const key = Object.keys(resourceImages).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? resourceImages[key] : resourceImages.default;
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      const d = res.data.data || res.data.bookings || res.data;
setBookings(Array.isArray(d) ? d : []);
     // setBookings(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${cancelTarget._id}/cancel`, {});
      toast.success('Booking cancelled successfully');
      setBookings(prev => prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled' } : b));
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally { setCancelling(false); }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? bookings.length : bookings.filter(b => b.status === t.key).length;
    return acc;
  }, {});

  const canCancel = (b) => ['pending','approved'].includes(b.status);

  if (loading) return <Loader />;

  return (
    <div style={{minHeight:'100vh',background:'var(--bg2)',paddingTop:90,paddingBottom:48}}>
      <div className="container" style={{maxWidth:1000}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'var(--text)',margin:0}}>My Bookings</h1>
          <p style={{color:'var(--text-light)',marginTop:4}}>Manage all your resource reservations</p>
        </div>

        {/* Tab bar */}
        <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap'}}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,
                transition:'all .2s',
                background: activeTab===t.key ? 'var(--primary)' : 'white',
                color: activeTab===t.key ? 'white' : 'var(--text-light)',
                boxShadow: activeTab===t.key ? '0 2px 8px rgba(79,70,229,.3)' : '0 1px 3px rgba(0,0,0,.08)',
              }}>
              {t.label} {counts[t.key] > 0 && <span style={{marginLeft:4,background:activeTab===t.key?'rgba(255,255,255,.3)':'var(--bg2)',padding:'1px 7px',borderRadius:10,fontSize:11}}>{counts[t.key]}</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'var(--radius)',boxShadow:'var(--shadow)'}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <h3 style={{color:'var(--text)',marginBottom:8}}>No bookings found</h3>
            <p style={{color:'var(--text-light)',marginBottom:20}}>
              {activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab} bookings.`}
            </p>
            <Link to="/resources" className="btn btn-primary">Browse Resources</Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {filtered.map(b => (
              <div key={b._id} style={{background:'white',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',padding:'18px 20px',display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',transition:'box-shadow .2s'}}>
                {/* Resource image */}
                <img
                  src={b.resource?.image || getImg(b.resource?.type)}
                  alt={b.resource?.name}
                  onError={e => { e.target.src = resourceImages.default; }}
                  style={{width:72,height:72,borderRadius:10,objectFit:'cover',flexShrink:0}}
                />

                {/* Main info */}
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4}}>
                    <span style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{b.resource?.name || 'Resource'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{fontSize:13,color:'var(--text-light)',display:'flex',gap:16,flexWrap:'wrap'}}>
                    <span>📅 {fmt(b.bookingDate)}</span>
                    <span>🕐 {fmtTime(b.startTime)} – {fmtTime(b.endTime)}</span>
                    <span>📍 {b.resource?.location || '-'}</span>
                  </div>
                  {b.purpose && (
                    <div style={{fontSize:12.5,color:'var(--text-light)',marginTop:4}}>
                      <strong>Purpose:</strong> {b.purpose}
                    </div>
                  )}
                  <div style={{fontSize:11.5,color:'var(--text-muted,#9ca3af)',marginTop:3}}>
                    ID: #{b._id?.slice(-8).toUpperCase()} &nbsp;·&nbsp; Booked on {fmt(b.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <Link to={`/bookings/${b._id}`} className="btn btn-outline" style={{fontSize:13,padding:'7px 14px'}}>
                    View Details
                  </Link>
                  {canCancel(b) && (
                    <button onClick={() => setCancelTarget(b)}
                      className="btn btn-danger" style={{fontSize:13,padding:'7px 14px',background:'#fee2e2',color:'#dc2626',border:'1px solid #fca5a5'}}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Booking"
        message={cancelTarget ? `Are you sure you want to cancel your booking for ${cancelTarget.resource?.name} on ${fmt(cancelTarget.bookingDate)}? This cannot be undone.` : ''}
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        confirmStyle="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
