const express = require('express');
const router = express.Router();
const {
  getAllJobs, getGovernmentJobs, getPrivateJobs, getInternships,
  getRecommendedJobs, getJobById, checkEligibility, checkJobScam, getDailyAlerts,
} = require('../controllers/jobsController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Public (with optional auth for personalised data)
router.get('/',            getAllJobs);
router.get('/government',  getGovernmentJobs);
router.get('/private',     getPrivateJobs);
router.get('/internships', getInternships);

// Authenticated — MUST be before /:id to avoid route collision
router.get('/alerts/daily', authenticate, getDailyAlerts);
router.get('/recommended',  authenticate, getRecommendedJobs);

// Parameterised — must come after all named routes
router.get('/:id', getJobById);
router.post('/:id/check-eligibility', authenticate, checkEligibility);
router.post('/:id/scam-check',
  authenticate,
  [body('job_text').notEmpty().withMessage('job_text is required')],
  validate,
  checkJobScam
);

module.exports = router;
