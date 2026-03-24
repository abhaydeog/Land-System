const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Login karen — token nahi mila' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await query(
      'SELECT id, name, email, role, district, designation, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'Account active nahi hai' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expire ho gaya, dobara login karen' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Role-based access
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Is action ke liye aapko ${roles.join(' ya ')} hona chahiye`
    });
  }
  next();
};

// Admin only
const adminOnly = authorize('admin');

// Admin or Officer
const staffOnly = authorize('admin', 'officer');

module.exports = { protect, authorize, adminOnly, staffOnly };
