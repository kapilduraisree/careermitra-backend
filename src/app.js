require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/auth');
const jobRoutes           = require('./routes/jobs');
const examRoutes          = require('./routes/exams');
const aiRoutes            = require('./routes/ai');
const userRoutes          = require('./routes/users');
const applicationRoutes   = require('./routes/applications');
const notificationRoutes  = require('./routes/notifications');
const adminRoutes         = require('./routes/admin');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    const allowed = config.cors.allowedOrigins;
    // Also allow all railway.app and vercel.app subdomains in production
    if (
      allowed.includes(origin) ||
      origin.endsWith('.railway.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app') ||
      config.env === 'development'
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP logging (skip in test) ───────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan('[:date[clf]] :method :url :status :response-time ms'));
}

// ── Static files (uploaded resumes/avatars) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CareerMitra AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demo_mode: config.demoMode,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/exams',         examRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
