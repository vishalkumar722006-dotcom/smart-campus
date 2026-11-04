const Resource = require('../models/Resource');

exports.getResources = async (req, res) => {
  try {
    const { type, availability, search, capacity } = req.query;
    const query = { status: 'active' };
    if (type) query.type = type;
    if (availability) query.availability = availability;
    if (capacity) query.capacity = { $gte: parseInt(capacity) };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
      { facilities: { $regex: search, $options: 'i' } },
    ];
    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: resources.length, resources });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.json({ success: true, resource });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, resource, message: 'Resource created successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.json({ success: true, resource, message: 'Resource updated successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};