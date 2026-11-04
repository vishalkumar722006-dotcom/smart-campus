const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Computer Lab','Classroom','Seminar Hall','Auditorium','Library Study Room','Conference Room','Projector','Smart Board','Physics Laboratory','Electronics Laboratory','Sports Ground','Basketball Court','Indoor Sports Room','Meeting Room','Innovation Lab'] },
  description: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  facilities: [{ type: String }],
  image: { type: String, default: '' },
  availability: { type: String, enum: ['available', 'unavailable', 'maintenance'], default: 'available' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
