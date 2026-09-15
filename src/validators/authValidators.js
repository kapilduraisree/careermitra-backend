const { body } = require('express-validator');

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('qualification').optional().trim().isLength({ max: 255 }),
  body('graduation_year').optional().isInt({ min: 1990, max: 2030 }),
  body('experience_level').optional().isIn(['fresher', '1-2 years', '2-5 years', '5+ years']),
  body('preferred_job_type').optional().isIn(['government', 'private', 'internship']),
  body('preferred_location').optional().trim().isLength({ max: 255 }),
  body('skills').optional().isArray(),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidators = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

module.exports = { registerValidators, loginValidators, forgotPasswordValidators, resetPasswordValidators };
