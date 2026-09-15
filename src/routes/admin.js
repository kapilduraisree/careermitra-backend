const express = require('express');
const router = express.Router();
const {
  getDashboard, getUsers, updateUserStatus,
  createJob, updateJob, deleteJob,
  createExam, addQuestion, createMockTest,
  getAnalytics, addStudyMaterial,
} = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require authentication + admin/moderator role
router.use(authenticate);
router.use(requireRole('admin', 'moderator'));

// Dashboard & Analytics
router.get('/dashboard',   getDashboard);
router.get('/analytics',   getAnalytics);

// User management (admin only)
router.get('/users',                    requireRole('admin'), getUsers);
router.patch('/users/:userId/status',   requireRole('admin'), updateUserStatus);

// Jobs
router.post('/jobs',            createJob);
router.put('/jobs/:jobId',      updateJob);
router.delete('/jobs/:jobId',   deleteJob);

// Exams
router.post('/exams', createExam);

// Questions
router.post('/questions', addQuestion);

// Mock Tests
router.post('/tests', createMockTest);

// Study Materials
router.post('/materials', addStudyMaterial);

module.exports = router;
