import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const HOURS = Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));
const MINS = ['00','15','30','45'];

const toTime = (h,m,ap) => {
  let hr = parseInt(h);
  if (ap==='PM' && hr!==12) hr+=12;
  if (ap==='AM' && hr===12) hr=0;
  return `${String(hr).padStart(2,'0')}:${m}`;
};

const fmtTime = (t) => {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  const ap = h>=12?'PM':'AM';
  const hr = h%12||12;
  return `${hr}:${String(m).padStart(2,'0')} ${ap}`;
};

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
};

const TimePicker = ({ label, value, onChange, error }) => {
  const [h,setH] = useState('09');
  const [m,setM] = useState('00');
  const [ap,setAp] = useState('AM');

  useEffect(() => {
    if (value) {
      const [hr,mn] = value.split(':').map(Number);
      const ampm = hr>=12?'PM':'AM';
      const hr12 = hr%12||12;
      setH(String(hr12).padStart(2,'0'));
      setM(String(mn).padStart(2,'0'));
      setAp(ampm);
    }
  }, []);

  const update = (nh,nm,nap) => { onChange(toTime(nh,nm,nap)); };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <select className="form-control" style={{flex:1}} value={h}
          onChange={e=>{setH(e.target.value);update(e.target.value,m,ap);}}>
          {HOURS.map(x=><option key={x}>{x}</option>)}
        </select>
        <span style={{fontWeight:700,color:'var(--text-light)'}}>:</span>
        <select className="form-control" style={{flex:1}} value={m}
          onChange={e=>{setM(e.target.value);update(h,e.target.value,ap);}}>
          {MINS.map(x=><option key={x}>{x}</option>)}
        </select>
        <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:'1px solid var(--border)',flexShrink:0}}>
          {['AM','PM'].map(a=>(
            <button key={a} type="button"
              onClick={()=>{setAp(a);update(h,m,a);}}
              style={{padding:'8px 12px',border:'none',cursor:'pointer',fontWeight:700,fontSize:13,
                background:ap===a?'var(--primary)':'white',
                color:ap===a?'white':'var(--text-light)',transition:'all .2s'}}>
              {a}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

const BookingFormModal = ({ resource, onClose, onSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    bookingDate:'', startTime:'', endTime:'', purpose:'', numberOfUsers:1, notes:''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const checkConflict = useCallback(async (date, start, end) => {
    if (!date || !start || !end || !resource?._id) return;
    setCheckingConflict(true);
    try {
      const res = await api.get('/bookings/check-conflict', { params:{resourceId:resource._id,date,startTime:start,endTime:end} });
      setConflict(res.data.conflict ? res.data : null);
    } catch { setConflict(null); }
    finally { setCheckingConflict(false); }
  }, [resource]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.bookingDate && form.startTime && form.endTime) checkConflict(form.bookingDate, form.startTime, form.endTime);
    }, 500);
    return () => clearTimeout(timer);
  }, [form.bookingDate, form.startTime, form.endTime, checkConflict]);

  if (!resource) return null;

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.bookingDate) e.bookingDate = 'Date is required';
    else if (form.bookingDate < today) e.bookingDate = 'Cannot book a past date';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    else if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = 'End time must be after start time';
    if (!form.purpose.trim()) e.purpose = 'Purpose is required';
    if (!form.numberOfUsers || form.numberOfUsers < 1) e.numberOfUsers = 'At least 1 user required';
    if (form.numberOfUsers > resource.capacity) e.numberOfUsers = `Cannot exceed capacity of ${resource.capacity}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (conflict) { toast.error('Please resolve the time conflict before proceeding.'); return; }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/bookings', { ...form, resource: resource._id });
      toast.success('🎉 Booking submitted successfully!');
      onSuccess && onSuccess(res.data.booking);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
      setStep('form');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:520}}>
        <div className="modal-header">
          <h3>{step === 'confirm' ? '✅ Confirm Booking' : `📅 Book: ${resource.name}`}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleNext}>
            <div className="modal-body">
              <div style={{marginBottom:16,padding:'10px 14px',background:'var(--bg2)',borderRadius:8,display:'flex',gap:16,fontSize:13,flexWrap:'wrap'}}>
                <span>📍 {resource.location}</span>
                <span>👥 Capacity: {resource.capacity}</span>
                <span>🏛️ {resource.type}</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" className={`form-control ${errors.bookingDate?'is-invalid':''}`}
                    min={today} value={form.bookingDate}
                    onChange={e => setForm(p=>({...p,bookingDate:e.target.value}))} />
                  {errors.bookingDate && <div className="form-error">{errors.bookingDate}</div>}
                </div>
                <div className="form-group">
                  <label>Number of Users *</label>
                  <input type="number" className={`form-control ${errors.numberOfUsers?'is-invalid':''}`}
                    min={1} max={resource.capacity} value={form.numberOfUsers}
                    onChange={e => setForm(p=>({...p,numberOfUsers:parseInt(e.target.value)||1}))} />
                  {errors.numberOfUsers && <div className="form-error">{errors.numberOfUsers}</div>}
                </div>
              </div>

              <div className="form-row">
                <TimePicker label="Start Time *" value={form.startTime} error={errors.startTime}
                  onChange={v=>setForm(p=>({...p,startTime:v}))} />
                <TimePicker label="End Time *" value={form.endTime} error={errors.endTime}
                  onChange={v=>setForm(p=>({...p,endTime:v}))} />
              </div>

              {form.startTime && form.endTime && form.startTime < form.endTime && (
                <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:8,padding:'8px 14px',fontSize:13,color:'#166534',marginBottom:12}}>
                  ⏱️ Duration: {(() => {
                    const [sh,sm] = form.startTime.split(':').map(Number);
                    const [eh,em] = form.endTime.split(':').map(Number);
                    const mins = (eh*60+em)-(sh*60+sm);
                    return mins>=60 ? `${Math.floor(mins/60)}h ${mins%60?mins%60+'m':''}`.trim() : `${mins}m`;
                  })()}
                </div>
              )}

              {checkingConflict && (
                <div style={{fontSize:12.5,color:'var(--text-light)',marginBottom:8}}>Checking availability...</div>
              )}
              {conflict && !checkingConflict && (
                <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 14px',marginBottom:12}}>
                  <div style={{fontWeight:700,color:'#dc2626',fontSize:13,marginBottom:4}}>⚠️ Time Conflict Detected</div>
                  <div style={{fontSize:12.5,color:'#991b1b'}}>This resource is already booked during part of your selected time. Please choose a different time.</div>
                </div>
              )}

              <div className="form-group">
                <label>Purpose *</label>
                <input type="text" className={`form-control ${errors.purpose?'is-invalid':''}`}
                  placeholder="e.g., Lab session, Group study, Project meeting"
                  value={form.purpose} onChange={e=>setForm(p=>({...p,purpose:e.target.value}))} />
                {errors.purpose && <div className="form-error">{errors.purpose}</div>}
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea className="form-control" rows={2}
                  placeholder="Any special requirements or equipment needed..."
                  value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={!!conflict}>
                Review Booking →
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-body">
              <p style={{color:'var(--text-light)',marginBottom:16,fontSize:14}}>Please review your booking details before confirming.</p>
              <div style={{background:'var(--bg2)',borderRadius:10,padding:'18px 20px',border:'2px solid var(--primary)',marginBottom:4}}>
                <div style={{display:'grid',gap:14}}>
                  {[
                    {icon:'🏛️',label:'Resource',val:resource.name},
                    {icon:'📅',label:'Date',val:fmtDate(form.bookingDate)},
                    {icon:'🕐',label:'Time',val:`${fmtTime(form.startTime)} – ${fmtTime(form.endTime)}`},
                    {icon:'📍',label:'Location',val:resource.location},
                    {icon:'👥',label:'Users',val:`${form.numberOfUsers} person${form.numberOfUsers>1?'s':''}`},
                    {icon:'📝',label:'Purpose',val:form.purpose},
                    ...(form.notes ? [{icon:'💬',label:'Notes',val:form.notes}] : []),
                  ].map(row => (
                    <div key={row.label} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <span style={{fontSize:16,width:22}}>{row.icon}</span>
                      <div>
                        <div style={{fontSize:11.5,color:'var(--text-light)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{row.label}</div>
                        <div style={{fontWeight:600,color:'var(--text)',fontSize:14,marginTop:1}}>{row.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{fontSize:12,color:'var(--text-light)',marginTop:10}}>
                ℹ️ Your booking will be submitted for approval. You'll see the status in My Bookings.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setStep('form')} disabled={loading}>← Edit</button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                {loading ? '⏳ Submitting...' : '✅ Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingFormModal;