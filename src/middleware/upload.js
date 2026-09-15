const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Resume storage
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = config.upload.resumeDir;
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume_${req.user.id}_${Date.now()}${ext}`);
  },
});

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = config.upload.avatarDir;
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const imageFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG/PNG/WebP images are allowed'), false);
};

const maxSize = config.upload.maxSizeMb * 1024 * 1024;

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: maxSize },
}).single('resume');

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('avatar');

module.exports = { uploadResume, uploadAvatar };
