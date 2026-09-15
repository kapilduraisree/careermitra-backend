const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, getPreferences, updatePreferences, deleteNotification } = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/',                   getNotifications);
router.put('/read-all',           markAllRead);
router.put('/:id/read',           markRead);
router.delete('/:id',             deleteNotification);
router.get('/preferences',        getPreferences);
router.put('/preferences',        updatePreferences);

module.exports = router;
