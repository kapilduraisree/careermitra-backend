require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const config = require('./config');

const PORT = process.env.PORT || config.port || 5000;

const startServer = async () => {
  // Start HTTP server first — Railway needs port binding quickly
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ CareerMitra AI Backend running on port ${PORT}`);
    console.log(`   Mode : ${config.env}`);
    console.log(`   AI   : ${config.ai.provider}`);
    console.log(`   Demo : ${config.demoMode}`);
  });

  // Then verify DB connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified');
  } catch (err) {
    console.error('⚠️  Database connection failed:', err.message);
    console.error('   Check DATABASE_URL or DB_* environment variables');
    // Don't exit — let Railway show the error in logs
  }

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

startServer();
