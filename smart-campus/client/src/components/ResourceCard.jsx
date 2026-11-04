import React from 'react';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  'Computer Lab': '💻', 'Classroom': '🎓', 'Seminar Hall': '🎤',
  'Auditorium': '🎭', 'Library Study Room': '📚', 'Conference Room': '🤝',
  'Projector': '📽', 'Smart Board': '📋', 'Physics Laboratory': '⚗️',
  'Electronics Laboratory': '🔌', 'Sports Ground': '⚽', 'Basketball Court': '🏀',
  'Indoor Sports Room': '🏸', 'Meeting Room': '💼', 'Innovation Lab': '🚀',
};

const ResourceCard = ({ resource, onBook }) => {
  const navigate = useNavigate();
  const icon = typeIcons[resource.type] || '🏛';

  return (
    <div className="resource-card">
      <div className="resource-img-wrap">
        {resource.image ? (
          <img src={resource.image} alt={resource.name} className="resource-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className="resource-img-placeholder" style={{ display: resource.image ? 'none' : 'flex' }}>
          <span style={{ fontSize: 48 }}>{icon}</span>
        </div>
        <span className={`resource-availability resource-avail-${resource.availability}`}>
          {resource.availability}
        </span>
      </div>
      <div className="resource-card-body">
        <div className="resource-type-badge">{icon} {resource.type}</div>
        <h3 className="resource-name">{resource.name}</h3>
        <p className="resource-desc">{resource.description}</p>
        <div className="resource-meta">
          <span>📍 {resource.location}</span>
          <span>👥 Capacity: {resource.capacity}</span>
        </div>
        {resource.facilities && resource.facilities.length > 0 && (
          <div className="resource-facilities">
            {resource.facilities.slice(0, 3).map((f, i) => (
              <span key={i} className="facility-tag">{f}</span>
            ))}
            {resource.facilities.length > 3 && <span className="facility-tag">+{resource.facilities.length - 3}</span>}
          </div>
        )}
        <div className="resource-card-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/resources/${resource._id}`)}>
            View Details
          </button>
          {resource.availability === 'available' && onBook && (
            <button className="btn btn-primary btn-sm" onClick={() => onBook(resource)}>
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
