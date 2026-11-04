import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';

const AdminUsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [msg, setMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      const d = res.data.users || res.data.data || res.data;
      setUsers(Array.isArray(d) ? d : []);
    } catch { setMsg('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { status: u.status === 'active' ? 'inactive' : 'active' });
      setMsg(`User ${u.status === 'active' ? 'deactivated' : 'activated'}`);
      setTimeout(() => setMsg(''), 3000);
      fetchUsers();
    } catch { setMsg('Failed to update status'); }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setMsg('User deleted');
      setTimeout(() => setMsg(''), 3000);
      fetchUsers();
    } catch (e) { setMsg(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.userId?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors = { student: '#3b82f6', faculty: '#8b5cf6', admin: '#ef4444' };

  if (loading) return <div style={{textAlign:'center',padding:40}}>Loading users...</div>;

  return (
    <div>
      {msg && <div style={{background:'#dcfce7',border:'1px solid #86efac',padding:'10px 16px',borderRadius:8,marginBottom:16,color:'#166534',fontWeight:600}}>{msg}</div>}

      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <input type="text" placeholder="Search by name, email or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{flex:1,minWidth:200,padding:'10px 16px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{padding:'10px 16px',borderRadius:10,border:'1px solid #e5e7eb',fontSize:14,outline:'none'}}>
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div style={{fontSize:13,color:'#6b7280',marginBottom:12}}>{filtered.length} user{filtered.length!==1?'s':''} found</div>

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px',background:'#fff',borderRadius:14,border:'1px solid #e5e7eb'}}>
          <div style={{fontSize:40,marginBottom:12}}>👥</div>
          <p style={{color:'#6b7280'}}>No users found</p>
        </div>
      ) : (
        <div style={{background:'#fff',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',border:'1px solid #e5e7eb'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead>
              <tr style={{background:'#f9fafb',borderBottom:'2px solid #f3f4f6'}}>
                {['User','ID','Role','Department','Status','Joined','Actions'].map(h => (
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#6b7280',fontWeight:700,fontSize:12,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{fontWeight:600}}>{u.name}</div>
                    <div style={{fontSize:12,color:'#9ca3af'}}>{u.email}</div>
                  </td>
                  <td style={{padding:'12px 16px',color:'#6b7280',fontFamily:'monospace'}}>{u.userId||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600,
                      background:`${roleColors[u.role] || '#6b7280'}20`,color:roleColors[u.role]||'#6b7280'}}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px',color:'#6b7280'}}>{u.department||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600,
                      background:u.status==='inactive'?'#fee2e2':'#dcfce7',
                      color:u.status==='inactive'?'#dc2626':'#16a34a'}}>
                      {u.isVerified?'✓ ':'⚠ '}{u.status||'active'}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px',color:'#6b7280'}}>{fmtDate(u.createdAt)}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <button onClick={()=>toggleStatus(u)}
                        style={{padding:'5px 12px',borderRadius:6,border:'1px solid currentColor',cursor:'pointer',fontWeight:600,fontSize:12,
                          background:u.status==='inactive'?'#f0fdf4':'#fff7ed',
                          color:u.status==='inactive'?'#16a34a':'#c2410c'}}>
                        {u.status==='inactive'?'Activate':'Deactivate'}
                      </button>
                      <button onClick={()=>handleDelete(u)}
                        style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:600,fontSize:12,background:'#fee2e2',color:'#dc2626'}}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;