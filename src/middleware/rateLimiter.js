const rateLimit = require('express-rate-limit');
const config = require('../config');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints
// In development: 200 attempts allowed so testing is not blocked
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env === 'production' ? 10 : 200,
  message: { success: false, message: 'Too many auth attempts, please try again in 15 minutes.' },
  skip: (req) => config.env !== 'production', // skip entirely in development
});

// AI endpoint limiter (AI calls are expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'Too many AI requests, please slow down.' },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
