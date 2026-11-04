import React, { useState } from 'react';
import AdminOverviewTab from '../components/admin/AdminOverviewTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminResourcesTab from '../components/admin/AdminResourcesTab';
import AdminBookingsTab from '../components/admin/AdminBookingsTab';

const TABS = [
  { id: 'overview', label: '📊 Overview', icon: '📊' },
  { id: 'users', label: '👥 Users', icon: '👥' },
  { id: 'resources', label: '🏛️ Resources', icon: '🏛️' },
  { id: 'bookings', label: '📅 Bookings', icon: '📅' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="page-container">
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="container">
          <h1 style={{ color: '#fff' }}>⚙️ Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Manage users, resources, and bookings</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
        {/* Tab navigation */}
        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.id}
              className={`admin-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-tab-content">
          {activeTab === 'overview' && <AdminOverviewTab />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'resources' && <AdminResourcesTab />}
          {activeTab === 'bookings' && <AdminBookingsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
