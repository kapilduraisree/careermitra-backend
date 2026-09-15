const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addSkill, removeSkill, getProgress, uploadAvatar, getAchievements } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar: avatarUpload } = require('../middleware/upload');

router.use(authenticate);

router.get('/profile',          getProfile);
router.put('/profile',          updateProfile);
router.post('/skills',          addSkill);
router.delete('/skills/:skillId', removeSkill);
router.get('/progress',         getProgress);
router.post('/avatar',          avatarUpload, uploadAvatar);
router.get('/achievements',     getAchievements);

module.exports = router;
