import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const isAvail = (a) => a === true || a === 'true' || a === 'available';

export default function AdminResourcesTab() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources');
      const d = res.data.resources || res.data.data || res.data;
      setResources(Array.isArray(d) ? d : []);
    } catch { setMsg('Failed to load resources'); }
    finally { setLoading(false); }
  };

  const toggleAvailability = async (id, current) => {
    try {
      const newVal = isAvail(current) ? 'false' : 'true';
      await api.put(`/resources/${id}`, { availability: newVal });
      setResources(prev => prev.map(r => r._id === id ? { ...r, availability: newVal } : r));
      setMsg('Resource updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Failed to update resource'); }
  };

  const filtered = Array.isArray(resources) ? resources.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.type?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (loading) return <div style={{textAlign:'center',padding:40}}>Loading resources...</div>;

  return (
    <div>
      {msg && <div style={{background:'#dcfce7',border:'1px solid #86efac',padding:'10px 16px',borderRadius:8,marginBottom:16,color:'#166534',fontWeight:600}}>{msg}</div>}
      <div style={{marginBottom:16}}>
        <input type="text" placeholder="Search resources..."
          value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:'100%',padding:'10px 16px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none',boxSizing:'border-box'}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {filtered.length === 0 ? (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px',background:'#fff',borderRadius:14,border:'1px solid #e5e7eb'}}>
            <div style={{fontSize:40,marginBottom:12}}>🏛️</div>
            <p style={{color:'#6b7280'}}>No resources found</p>
          </div>
        ) : filtered.map(r => {
          const available = isAvail(r.availability);
          return (
            <div key={r._id} style={{background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'}}>
              {r.image && <img src={r.image} alt={r.name} style={{width:'100%',height:140,objectFit:'cover'}} onError={e=>e.target.style.display='none'} />}
              <div style={{padding:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <h4 style={{margin:0,fontSize:15,fontWeight:700}}>{r.name}</h4>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:11.5,fontWeight:700,flexShrink:0,background:available?'#dcfce7':'#fee2e2',color:available?'#166534':'#dc2626'}}>{available?'Available':'Unavailable'}</span>
                </div>
                <div style={{fontSize:12.5,color:'#6b7280',marginBottom:12,display:'flex',gap:12,flexWrap:'wrap'}}>
                  <span>🏷️ {r.type}</span>
                  <span>📍 {r.location}</span>
                  <span>👥 Cap: {r.capacity}</span>
                </div>
                <button onClick={() => toggleAvailability(r._id, r.availability)}
                  style={{width:'100%',padding:'8px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:available?'#fee2e2':'#dcfce7',color:available?'#dc2626':'#166534'}}>
                  {available ? '🔒 Mark Unavailable' : '✅ Mark Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}