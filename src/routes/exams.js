const express = require('express');
const router = express.Router();
const {
  getAllExams, getExamById, getStudyMaterials, getMockTests,
  getTestById, submitTest, getTestHistory, getQuestions,
} = require('../controllers/examsController');
const { authenticate } = require('../middleware/auth');

// Exams
router.get('/',              getAllExams);
router.get('/:id',           getExamById);
router.get('/:id/materials', getStudyMaterials);
router.get('/:id/tests',     getMockTests);

// Tests (authenticated)
router.get('/tests/history',         authenticate, getTestHistory);
router.get('/tests/:testId',          authenticate, getTestById);
router.post('/tests/:testId/submit',  authenticate, submitTest);

// Questions
router.get('/questions/list', getQuestions);

module.exports = router;
