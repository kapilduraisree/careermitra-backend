const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../config/database');

/**
 * Verifies JWT token and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Fetch user from DB to ensure they still exist and are active
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Requires a specific role (or array of roles)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, but does not block
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    req.user = rows.length && rows[0].is_active ? rows[0] : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, requireRole, optionalAuth };
