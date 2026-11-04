const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, students, faculty, totalResources, availableResources, totalBookings, pendingBookings, approvedBookings, cancelledBookings, rejectedBookings] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Resource.countDocuments({ status: 'active' }),
      Resource.countDocuments({ availability: 'available', status: 'active' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'rejected' }),
    ]);

    const recentBookings = await Booking.find().populate('user', 'name email').populate('resource', 'name type').sort({ createdAt: -1 }).limit(10);

    res.json({ success: true, stats: { totalUsers, students, faculty, totalResources, availableResources, totalBookings, pendingBookings, approvedBookings, cancelledBookings, rejectedBookings }, recentBookings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
