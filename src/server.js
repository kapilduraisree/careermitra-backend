require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const config = require('./config');

const PORT = config.port;

const startServer = async () => {
  try {
    // Verify DB connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified');

    const server = app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║       CareerMitra AI Backend Server           ║
║  Port    : ${PORT}                             
║  Mode    : ${config.env}                      
║  AI      : ${config.ai.provider}              
║  Demo    : ${config.demoMode}                 
╚══════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        console.log('Database pool closed. Goodbye!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
