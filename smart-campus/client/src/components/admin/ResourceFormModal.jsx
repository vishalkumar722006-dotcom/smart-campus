import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TYPES = ['Computer Lab','Classroom','Seminar Hall','Auditorium','Library Study Room',
  'Conference Room','Projector','Smart Board','Physics Laboratory','Electronics Laboratory',
  'Sports Ground','Basketball Court','Indoor Sports Room','Meeting Room','Innovation Lab'];

const ResourceFormModal = ({ resource, onClose, onSaved }) => {
  const toast = useToast();
  const isEdit = !!resource;

  const [form, setForm] = useState({
    name: resource?.name || '',
    type: resource?.type || '',
    description: resource?.description || '',
    location: resource?.location || '',
    capacity: resource?.capacity || '',
    facilities: resource?.facilities?.join(', ') || '',
    image: resource?.image || '',
    availability: resource?.availability !== false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.type || !form.location.trim() || !form.capacity) {
      toast.error('Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity) || 0,
        facilities: form.facilities.split(',').map(f => f.trim()).filter(Boolean),
      };
      if (isEdit) await api.put(`/resources/${resource._id}`, payload);
      else await api.post('/resources', payload);
      toast.success(`Resource ${isEdit ? 'updated' : 'created'} successfully`);
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>{isEdit ? '✏️ Edit Resource' : '➕ Add New Resource'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Resource Name *</label>
              <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="e.g. Computer Lab A" />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                <option value="">Select type</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} placeholder="Brief description..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input type="text" name="location" className="form-control" value={form.location} onChange={handleChange} placeholder="Building A, Room 101" />
            </div>
            <div className="form-group">
              <label>Capacity *</label>
              <input type="number" name="capacity" className="form-control" min="1" value={form.capacity} onChange={handleChange} placeholder="30" />
            </div>
          </div>
          <div className="form-group">
            <label>Facilities (comma-separated)</label>
            <input type="text" name="facilities" className="form-control" value={form.facilities} onChange={handleChange}
              placeholder="WiFi, AC, Projector, Whiteboard" />
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input type="url" name="image" className="form-control" value={form.image} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" name="availability" id="avail" checked={form.availability} onChange={handleChange} style={{ width: 18, height: 18 }} />
            <label htmlFor="avail" style={{ marginBottom: 0, cursor: 'pointer' }}>Available for booking</label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : isEdit ? '💾 Update Resource' : '➕ Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormModal;
