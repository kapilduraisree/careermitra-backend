// DO NOT call require('dotenv').config() here in production
// Railway injects env vars directly — dotenv would override them with .env values
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const config = require('./config');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Log what DB config we're using
  if (process.env.DATABASE_URL) {
    console.log('🔌 Using DATABASE_URL for PostgreSQL connection');
  } else {
    console.log(`🔌 Using DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  }

  // Start HTTP server — Railway requires port binding within 5 seconds
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ CareerMitra AI Backend running on port ${PORT}`);
    console.log(`   Mode : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   AI   : ${process.env.AI_PROVIDER || 'gemini'}`);

    // Verify DB connection after server is already listening
    try {
      const pool = require('./config/database');
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection verified');
    } catch (err) {
      console.error('⚠️  Database connection failed:', err.message);
      console.error('   Make sure DATABASE_URL variable is set in Railway');
    }
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
};

startServer();
