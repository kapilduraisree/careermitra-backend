// Central configuration — all values read from environment variables
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'CHANGE_REFRESH_SECRET',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'careermitra',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // AI Provider (Gemini / OpenAI / Groq — plug in your preferred key)
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',  // 'gemini' | 'openai' | 'groq'
    geminiKey: process.env.GEMINI_API_KEY || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    groqKey: process.env.GROQ_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },

  // File upload
  upload: {
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_MB) || 5,
    resumeDir: process.env.RESUME_UPLOAD_DIR || 'uploads/resumes',
    avatarDir: process.env.AVATAR_UPLOAD_DIR || 'uploads/avatars',
  },

  // CORS
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },

  // FCM (Firebase Cloud Messaging) for push notifications
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || '',
  },

  // Demo mode fallback
  demoMode: process.env.DEMO_MODE === 'true',
};

module.exports = config;
