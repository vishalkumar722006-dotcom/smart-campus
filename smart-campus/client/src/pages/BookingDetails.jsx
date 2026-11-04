import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '-';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '-';
const fmtTime = (t) => {
  if (!t) return '-';
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
};

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data || res.data);
    } catch {
      toast.error('Booking not found');
      navigate('/my-bookings');
    } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.put(`/bookings/${id}/cancel`, {});
      toast.success('Booking cancelled');
      setBooking(b => ({ ...b, status: 'cancelled' }));
      setShowCancel(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally { setCancelling(false); }
  };

  if (loading) return <Loader />;
  if (!booking) return null;

  const canCancel = ['pending','approved'].includes(booking.status);
  const r = booking.resource || {};

  const InfoRow = ({ icon, label, value }) => (
    <div style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
      <span style={{fontSize:18,width:24,textAlign:'center'}}>{icon}</span>
      <div>
        <div style={{fontSize:12,color:'var(--text-light)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
        <div style={{fontWeight:600,color:'var(--text)',marginTop:2}}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--bg2)',paddingTop:90,paddingBottom:48}}>
      <div className="container" style={{maxWidth:800}}>
        {/* Breadcrumb */}
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:20,fontSize:13,color:'var(--text-light)'}}>
          <Link to="/my-bookings" style={{color:'var(--primary)'}}>My Bookings</Link>
          <span>›</span>
          <span>Booking Details</span>
        </div>

        <div style={{background:'white',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',overflow:'hidden'}}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,var(--primary),var(--primary-dark,#3730a3))',padding:'28px 28px 24px',color:'white'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{margin:0,fontWeight:800,fontSize:22}}>{r.name || 'Resource'}</h2>
                <p style={{margin:'4px 0 0',opacity:.85,fontSize:14}}>{r.type} · {r.location}</p>
              </div>
              <StatusBadge status={booking.status} large />
            </div>
          </div>

          {/* Resource image */}
          {r.image && (
            <img src={r.image} alt={r.name}
              style={{width:'100%',height:200,objectFit:'cover'}}
              onError={e => e.target.style.display='none'} />
          )}

          <div style={{padding:28}}>
            {/* Booking ID */}
            <div style={{background:'var(--bg2)',borderRadius:'var(--radius-sm)',padding:'12px 16px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{fontSize:11,color:'var(--text-light)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Booking Reference</div>
                <div style={{fontWeight:800,fontSize:16,fontFamily:'monospace',color:'var(--primary)'}}>#{booking._id?.slice(-10).toUpperCase()}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'var(--text-light)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Created</div>
                <div style={{fontWeight:600,fontSize:13}}>{fmtShort(booking.createdAt)}</div>
              </div>
            </div>

            {/* Details */}
            <InfoRow icon="📅" label="Booking Date" value={fmt(booking.bookingDate)} />
            <InfoRow icon="🕐" label="Time Slot" value={`${fmtTime(booking.startTime)} – ${fmtTime(booking.endTime)}`} />
            <InfoRow icon="📍" label="Location" value={r.location || '-'} />
            <InfoRow icon="👥" label="Number of Users" value={`${booking.numberOfUsers || 1} person${booking.numberOfUsers > 1 ? 's' : ''}`} />
            <InfoRow icon="📝" label="Purpose" value={booking.purpose || '-'} />
            {booking.notes && <InfoRow icon="💬" label="Notes" value={booking.notes} />}
            {r.capacity && <InfoRow icon="🏛️" label="Room Capacity" value={`${r.capacity} people`} />}
            {r.facilities?.length > 0 && (
              <div style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:18,width:24,textAlign:'center'}}>⚙️</span>
                <div>
                  <div style={{fontSize:12,color:'var(--text-light)',fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Facilities</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:6}}>
                    {r.facilities.map(f => (
                      <span key={f} style={{background:'var(--primary-light,#ede9fe)',color:'var(--primary)',borderRadius:12,padding:'3px 10px',fontSize:12,fontWeight:600}}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{display:'flex',gap:12,marginTop:24,flexWrap:'wrap'}}>
              <Link to="/my-bookings" className="btn btn-outline">← Back to Bookings</Link>
              <Link to={`/resources/${r._id}`} className="btn btn-outline">View Resource</Link>
              {canCancel && (
                <button onClick={() => setShowCancel(true)}
                  className="btn" style={{background:'#fee2e2',color:'#dc2626',border:'1px solid #fca5a5',fontWeight:700}}>
                  🚫 Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancel}
        title="Cancel Booking"
        message={`Cancel your booking for ${r.name} on ${fmtShort(booking.bookingDate)}? This action cannot be undone.`}
        confirmLabel="Cancel Booking"
        cancelLabel="Keep It"
        confirmStyle="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setShowCancel(false)}
      />
    </div>
  );
}
