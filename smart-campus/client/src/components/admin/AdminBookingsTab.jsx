import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
const statusStyle = (s) => {
  const sl = s?.toLowerCase();
  return {
    padding:'3px 10px', borderRadius:20, fontSize:11.5, fontWeight:700,
    background: sl==='approved'?'#dcfce7': sl==='pending'?'#fef9c3': sl==='rejected'?'#fee2e2': sl==='completed'?'#dbeafe':'#f3f4f6',
    color: sl==='approved'?'#166534': sl==='pending'?'#854d0e': sl==='rejected'?'#dc2626': sl==='completed'?'#1d4ed8':'#374151'
  };
};

const AdminBookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      const d = res.data.bookings || res.data.data || res.data;
      setBookings(Array.isArray(d) ? d : []);
    } catch { setMsg('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setMsg(`Booking ${status}!`);
      setTimeout(() => setMsg(''), 3000);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.resource?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div style={{textAlign:'center',padding:40}}>Loading bookings...</div>;

  return (
    <div>
      {msg && (
        <div style={{background:'#dcfce7',border:'1px solid #86efac',padding:'10px 16px',borderRadius:8,marginBottom:16,color:'#166534',fontWeight:600}}>
          {msg}
        </div>
      )}

      <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <input type="text" placeholder="Search by resource or user..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{flex:1,minWidth:200,padding:'10px 16px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{padding:'10px 16px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}}>
          <option value="all">All Statuses</option>
          {['pending','approved','rejected','cancelled','completed'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{fontSize:13,color:'#6b7280',marginBottom:12}}>{filtered.length} booking{filtered.length!==1?'s':''} found</div>

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px',background:'#fff',borderRadius:14,border:'1px solid #e5e7eb'}}>
          <div style={{fontSize:40,marginBottom:12}}>📭</div>
          <p style={{color:'#6b7280'}}>No bookings found</p>
        </div>
      ) : (
        <div style={{background:'#fff',borderRadius:14,overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:700}}>
            <thead>
              <tr style={{background:'#f9fafb',borderBottom:'2px solid #f3f4f6'}}>
                {['Resource','User','Date','Time','Users','Status','Actions'].map(h => (
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#6b7280',fontWeight:700,fontSize:12,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const status = b.status?.toLowerCase();
                return (
                  <tr key={b._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                    <td style={{padding:'12px 16px',fontWeight:600}}>{b.resource?.name || 'Deleted'}</td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{fontWeight:600}}>{b.user?.name || 'Deleted User'}</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{b.user?.email || ''}</div>
                    </td>
                    <td style={{padding:'12px 16px',color:'#6b7280',whiteSpace:'nowrap'}}>{fmtDate(b.bookingDate)}</td>
                    <td style={{padding:'12px 16px',color:'#6b7280',whiteSpace:'nowrap'}}>{fmt12(b.startTime)} – {fmt12(b.endTime)}</td>
                    <td style={{padding:'12px 16px',color:'#6b7280'}}>{b.numberOfUsers}</td>
                    <td style={{padding:'12px 16px'}}><span style={statusStyle(b.status)}>{b.status}</span></td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        {status === 'pending' && (<>
                          <button disabled={!!updating} onClick={() => updateStatus(b._id, 'approved')}
                            style={{padding:'6px 14px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:'#dcfce7',color:'#16a34a'}}>
                            {updating === b._id+'approved' ? '...' : '✓ Approve'}
                          </button>
                          <button disabled={!!updating} onClick={() => updateStatus(b._id, 'rejected')}
                            style={{padding:'6px 14px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:'#fee2e2',color:'#dc2626'}}>
                            {updating === b._id+'rejected' ? '...' : '✕ Reject'}
                          </button>
                        </>)}
                        {status === 'approved' && (<>
                          <button disabled={!!updating} onClick={() => updateStatus(b._id, 'completed')}
                            style={{padding:'6px 14px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:'#dbeafe',color:'#1d4ed8'}}>
                            {updating === b._id+'completed' ? '...' : '🏁 Complete'}
                          </button>
                          <button disabled={!!updating} onClick={() => updateStatus(b._id, 'cancelled')}
                            style={{padding:'6px 14px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,background:'#fee2e2',color:'#dc2626'}}>
                            {updating === b._id+'cancelled' ? '...' : '🚫 Cancel'}
                          </button>
                        </>)}
                        {!['pending','approved'].includes(status) && (
                          <span style={{fontSize:12,color:'#9ca3af'}}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsTab;