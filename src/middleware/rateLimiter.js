const rateLimit = require('express-rate-limit');
const config = require('../config');

// General API limiter — disabled in development
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.env === 'production' ? config.rateLimit.max : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: () => config.env !== 'production',
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
  windowMs: 60 * 1000,
  max: config.env === 'production' ? 20 : 200,
  message: { success: false, message: 'Too many AI requests, please slow down.' },
  skip: () => config.env !== 'production',
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
