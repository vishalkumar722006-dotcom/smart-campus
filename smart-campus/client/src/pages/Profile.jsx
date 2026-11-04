import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U';
  const roleColors = { student: '#3b82f6', faculty: '#8b5cf6', admin: '#ef4444' };
  const roleColor = roleColors[user?.role] || '#64748b';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await api.put('/auth/update-me', form);
      const updated = res.data.data || res.data.user || res.data;
      updateUser({ ...user, ...updated });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>View and manage your account information</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 60 }}>
        {/* Avatar card */}
        <div className="profile-card">
          <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)` }}>
            {initials}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <div className="profile-email">{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="profile-badge" style={{ background: `${roleColor}20`, color: roleColor }}>
                {user?.role === 'student' ? '🎓' : user?.role === 'faculty' ? '👨‍🏫' : '⚙️'} {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              <span className={`profile-badge ${user?.isVerified ? 'verified' : 'unverified'}`}>
                {user?.isVerified ? '✅ Verified' : '⚠️ Unverified'}
              </span>
            </div>
          </div>
          {!editing && (
            <button className="btn btn-outline" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          )}
        </div>

        {/* Info grid */}
        {!editing ? (
          <div className="profile-details-card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Account Details</h3>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user?.name || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{user?.email || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">{user?.role === 'faculty' ? 'Faculty ID' : 'Student ID'}</span>
                <span className="detail-value">{user?.userId || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{user?.phone || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{user?.department || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>{user?.role || '—'}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Account Status</span>
                <span className="detail-value" style={{ color: user?.isVerified ? 'var(--success)' : '#f59e0b', fontWeight: 600 }}>
                  {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{fmtDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-details-card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" className="form-control" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" className="form-control" value={form.department}
                    onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" />
                </div>
              </div>
              <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 'var(--radius-sm)', fontSize: 12.5, color: '#1e40af', marginBottom: 16 }}>
                ℹ️ Email, ID and role cannot be changed. Contact admin if needed.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
