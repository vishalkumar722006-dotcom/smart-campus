const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);

module.exports = router;
