const express = require('express');
const router = express.Router();
const { getBookings, getBooking, createBooking, cancelBooking, updateBookingStatus, checkConflict } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/check-conflict', protect, checkConflict);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.post('/', protect, authorize('student', 'faculty'), createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
