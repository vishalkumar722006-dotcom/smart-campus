import React from 'react';

const icons = {
  pending: '⏳',
  approved: '✅',
  rejected: '❌',
  cancelled: '🚫',
  completed: '🎓',
  active: '🟢',
  inactive: '🔴',
  available: '✅',
  unavailable: '❌',
  verified: '✔️',
  unverified: '⚠️',
};

const StatusBadge = ({ status, large }) => {
  const s = status?.toLowerCase() || 'pending';
  const icon = icons[s] || '•';
  return (
    <span className={`status-badge status-${s}`} 
      style={large ? {fontSize:14,padding:'5px 14px'} : {}}>
      {icon} {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
