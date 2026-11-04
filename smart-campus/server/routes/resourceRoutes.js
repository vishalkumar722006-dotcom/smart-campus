const express = require('express');
const router = express.Router();
const { getResources, getResource, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getResources);
router.get('/:id', getResource);
router.post('/', protect, authorize('admin'), createResource);
router.put('/:id', protect, authorize('admin'), updateResource);
router.delete('/:id', protect, authorize('admin'), deleteResource);

module.exports = router;
