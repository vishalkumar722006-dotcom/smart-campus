import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';

const AdminOverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/resources'),
        ]);
        const bookings = Array.isArray(bRes.data.bookings) ? bRes.data.bookings : Array.isArray(bRes.data.data) ? bRes.data.data : Array.isArray(bRes.data) ? bRes.data : [];
        const resources = Array.isArray(rRes.data.resources) ? rRes.data.resources : Array.isArray(rRes.data.data) ? rRes.data.data : Array.isArray(rRes.data) ? rRes.data : [];

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          approvedBookings: bookings.filter(b => b.status === 'approved').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          rejectedBookings: bookings.filter(b => b.status === 'rejected').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
          totalResources: resources.length,
        });
        setRecent(bookings.slice(0, 6));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div style={{textAlign:'center',padding:40}}>Loading overview...</div>;
  if (!stats) return <div style={{textAlign:'center',padding:40,color:'#dc2626'}}>Failed to load stats</div>;

  const statCards = [
    { label:'Total Bookings', value:stats.totalBookings, icon:'📋', color:'#4f46e5', bg:'#ede9fe' },
    { label:'Pending', value:stats.pendingBookings, icon:'⏳', color:'#d97706', bg:'#fef3c7' },
    { label:'Approved', value:stats.approvedBookings, icon:'✅', color:'#059669', bg:'#d1fae5' },
    { label:'Completed', value:stats.completedBookings, icon:'🏁', color:'#2563eb', bg:'#dbeafe' },
    { label:'Rejected', value:stats.rejectedBookings, icon:'❌', color:'#dc2626', bg:'#fee2e2' },
    { label:'Resources', value:stats.totalResources, icon:'🏛️', color:'#7c3aed', bg:'#ede9fe' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:16,marginBottom:28}}>
        {statCards.map(s => (
          <div key={s.label} style={{background:'#fff',borderRadius:14,padding:'20px 18px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'}}>
            <div style={{width:44,height:44,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:12}}>{s.icon}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12.5,color:'#6b7280',marginTop:4,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div style={{background:'#fff',borderRadius:14,padding:'20px 24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'}}>
        <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:700}}>Recent Bookings</h3>
        {recent.length === 0 ? (
          <p style={{color:'#9ca3af',textAlign:'center',padding:'20px 0'}}>No bookings yet</p>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'2px solid #f3f4f6'}}>
                {['User','Resource','Date','Status'].map(h => (
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'#6b7280',fontWeight:700,fontSize:12,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(b => (
                <tr key={b._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{fontWeight:600}}>{b.user?.name||'—'}</div>
                    <div style={{fontSize:11,color:'#9ca3af'}}>{b.user?.email}</div>
                  </td>
                  <td style={{padding:'10px 12px',color:'#6b7280'}}>{b.resource?.name||'—'}</td>
                  <td style={{padding:'10px 12px',color:'#6b7280'}}>{fmtDate(b.bookingDate)}</td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{
                      padding:'3px 10px',borderRadius:20,fontSize:11.5,fontWeight:700,
                      background:b.status==='approved'?'#dcfce7':b.status==='pending'?'#fef9c3':b.status==='rejected'?'#fee2e2':b.status==='completed'?'#dbeafe':'#f3f4f6',
                      color:b.status==='approved'?'#166534':b.status==='pending'?'#854d0e':b.status==='rejected'?'#dc2626':b.status==='completed'?'#1d4ed8':'#374151'
                    }}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewTab;