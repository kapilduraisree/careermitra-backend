const express = require('express');
const router = express.Router();
const { register, login, refreshToken, getMe, changePassword, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerValidators, loginValidators } = require('../validators/authValidators');

// Public routes
router.post('/register', authLimiter, registerValidators, validate, register);
router.post('/login',    authLimiter, loginValidators,    validate, login);
router.post('/refresh',  refreshToken);

// Protected routes
router.get('/me',               authenticate, getMe);
router.put('/change-password',  authenticate, changePassword);
router.post('/logout',          authenticate, logout);

module.exports = router;
