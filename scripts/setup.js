/**
 * Railway startup script
 * Runs schema migration + seed automatically on first deploy
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const run = async () => {
  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME     || 'careermitra',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✅ Connected for migration');

    // Check if tables already exist
    const { rows } = await client.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='users'"
    );

    if (parseInt(rows[0].count) === 0) {
      console.log('▶ Running schema migration...');
      const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
      await client.query(schema);
      console.log('✅ Schema applied');

      console.log('▶ Running seed data...');
      const seed = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
      await client.query(seed);
      console.log('✅ Demo data seeded');
    } else {
      console.log('ℹ️  Database already initialized — skipping migration');
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
};

run().then(() => {
  // Start the actual server
  require('./src/server');
});
