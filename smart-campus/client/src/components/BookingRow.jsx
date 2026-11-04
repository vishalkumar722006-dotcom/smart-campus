import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const BookingRow = ({ booking, onCancel }) => {
  const navigate = useNavigate();
  const date = new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <tr className="booking-row">
      <td>
        <div className="booking-resource-name">{booking.resource?.name || 'N/A'}</div>
        <div className="booking-resource-type" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.resource?.type}</div>
      </td>
      <td>{date}</td>
      <td>{booking.startTime} - {booking.endTime}</td>
      <td><StatusBadge status={booking.status} /></td>
      <td>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/bookings/${booking._id}`)}>View</button>
          {['pending', 'approved'].includes(booking.status) && onCancel && (
            <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking)}>Cancel</button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;
