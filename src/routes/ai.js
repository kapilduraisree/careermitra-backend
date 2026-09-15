const express = require('express');
const router = express.Router();
const {
  chat, getConversations, getMessages, jobMatch, skillGap,
  resumeAnalysis, careerRoadmap, getRoadmaps, getRoadmapById, updateRoadmapStep,
  startInterview, submitInterviewAnswer, completeInterview,
  recommendedVideos, getDailyPlan, updateDailyTask, careerComparison,
} = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { uploadResume } = require('../middleware/upload');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// All AI routes require authentication
router.use(authenticate);
router.use(aiLimiter);

// Chat / Mentor
router.post('/chat',
  [body('message').notEmpty().withMessage('message is required')],
  validate, chat
);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);

// Job match & skill gap
router.post('/job-match',   [body('job_id').notEmpty()], validate, jobMatch);
router.post('/skill-gap',   [body('target_role').notEmpty()], validate, skillGap);

// Resume
router.post('/resume-analysis', uploadResume, resumeAnalysis);

// Roadmap
router.post('/career-roadmap', [body('goal').notEmpty()], validate, careerRoadmap);
router.get('/roadmaps',             getRoadmaps);
router.get('/roadmaps/:id',         getRoadmapById);
router.patch('/roadmaps/:roadmapId/steps/:stepId', updateRoadmapStep);

// Mock Interview
router.post('/mock-interview/start',           startInterview);
router.post('/mock-interview/:id/answer',      submitInterviewAnswer);
router.post('/mock-interview/:id/complete',    completeInterview);

// Videos
router.get('/videos/recommended', recommendedVideos);

// Daily plan
router.get('/daily-plan',                  getDailyPlan);
router.put('/daily-plan/task/:idx',        updateDailyTask);

// Career comparison
router.post('/career-comparison',
  [body('careers').isArray({ min: 2 }).withMessage('Provide at least 2 careers')],
  validate, careerComparison
);

module.exports = router;
