const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { sendBookingConfirmation, sendBookingStatusUpdate } = require('../services/emailService');

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') query.user = req.user._id;
    const { status, resource, date } = req.query;
    if (status) query.status = status;
    if (resource) query.resource = resource;
    if (date) query.bookingDate = new Date(date);
    const bookings = await Booking.find(query).populate('resource', 'name type location image').populate('user', 'name email userId').sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resource').populate('user', 'name email userId department');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized.' });
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.checkConflict = async (req, res) => {
  try {
    const { resourceId, date, startTime, endTime, excludeBookingId } = req.query;
    if (!resourceId || !date || !startTime || !endTime) return res.status(400).json({ success: false, message: 'Missing parameters.' });

    const bookingDate = new Date(date);
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    const conflictQuery = { resource: resourceId, bookingDate, status: { $in: ['pending', 'approved'] } };
    if (excludeBookingId) conflictQuery._id = { $ne: excludeBookingId };

    const existing = await Booking.find(conflictQuery);
    const conflicts = existing.filter(b => {
      const bs = timeToMinutes(b.startTime);
      const be = timeToMinutes(b.endTime);
      return start < be && end > bs;
    });

    res.json({ success: true, hasConflict: conflicts.length > 0, conflicts: conflicts.map(c => ({ startTime: c.startTime, endTime: c.endTime })) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createBooking = async (req, res) => {
  try {
    const { resource: resourceId, bookingDate, startTime, endTime, purpose, numberOfUsers, notes } = req.body;
    if (!resourceId || !bookingDate || !startTime || !endTime || !purpose || !numberOfUsers) return res.status(400).json({ success: false, message: 'Please provide all required fields.' });

    const bookingDateObj = new Date(bookingDate);
    if (bookingDateObj < new Date(new Date().setHours(0,0,0,0))) return res.status(400).json({ success: false, message: 'Cannot book for a past date.' });

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) return res.status(400).json({ success: false, message: 'End time must be after start time.' });

    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    if (resource.availability !== 'available') return res.status(400).json({ success: false, message: 'This resource is not currently available.' });
    if (numberOfUsers > resource.capacity) return res.status(400).json({ success: false, message: `Number of users (${numberOfUsers}) exceeds capacity (${resource.capacity}).` });

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const existing = await Booking.find({ resource: resourceId, bookingDate: bookingDateObj, status: { $in: ['pending', 'approved'] } });
    const hasConflict = existing.some(b => { const bs = timeToMinutes(b.startTime); const be = timeToMinutes(b.endTime); return start < be && end > bs; });
    if (hasConflict) return res.status(409).json({ success: false, message: 'This time slot conflicts with an existing booking.' });

    const booking = await Booking.create({ user: req.user._id, resource: resourceId, bookingDate: bookingDateObj, startTime, endTime, purpose, numberOfUsers, notes });
    await booking.populate('resource', 'name type location');

    await sendBookingConfirmation(req.user.email, req.user.name, { resourceName: resource.name, date: bookingDateObj.toDateString(), startTime, endTime });

    res.status(201).json({ success: true, booking, message: 'Booking submitted successfully. Pending approval.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resource', 'name').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (!['pending', 'approved'].includes(booking.status)) return res.status(400).json({ success: false, message: 'This booking cannot be cancelled.' });
    booking.status = 'cancelled';
    await booking.save();
    // Send cancellation email
    await sendBookingStatusUpdate(booking.user.email, booking.user.name, {
      resourceName: booking.resource?.name || 'Unknown resource',
      date: new Date(booking.bookingDate).toDateString(),
      startTime: booking.startTime, endTime: booking.endTime
    }, 'cancelled').catch(() => {});
    res.json({ success: true, booking, message: 'Booking cancelled.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('resource', 'name').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    // Send status update email for approved, rejected, cancelled, completed
    if (['approved', 'rejected', 'cancelled', 'completed'].includes(status)) {
      await sendBookingStatusUpdate(booking.user.email, booking.user.name, {
        resourceName: booking.resource?.name || 'Unknown resource',
        date: new Date(booking.bookingDate).toDateString(),
        startTime: booking.startTime, endTime: booking.endTime
      }, status).catch(() => {});
    }
    res.json({ success: true, booking, message: `Booking ${status}.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
