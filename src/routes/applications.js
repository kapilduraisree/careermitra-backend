const express = require('express');
const router = express.Router();
const { createApplication, getApplications, getApplicationSummary, updateApplication, deleteApplication } = require('../controllers/applicationsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/',          createApplication);
router.get('/',           getApplications);
router.get('/summary',    getApplicationSummary);
router.put('/:id',        updateApplication);
router.delete('/:id',     deleteApplication);

module.exports = router;
