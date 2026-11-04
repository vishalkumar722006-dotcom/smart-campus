const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email first.', requireVerification: true, email: user.email });
    if (user.status === 'inactive') return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Your session has expired. Please login again.' });
    return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized to access this resource.` });
  }
  next();
};

module.exports = { protect, authorize };
