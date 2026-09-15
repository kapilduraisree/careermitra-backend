/**
 * CareerMitra AI — Railway startup script
 * 1. Runs DB migration if needed
 * 2. Starts the Express server
 */
require('dotenv').config();

const { Client } = require('pg');
const fs   = require('fs');
const path = require('path');

// ── Build connection config from Railway DATABASE_URL or individual vars ──────
function getDbConfig() {
  if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for connection');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'careermitra',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
}

// ── Run migration ─────────────────────────────────────────────────────────────
async function migrate() {
  const client = new Client(getDbConfig());

  try {
    await client.connect();
    console.log('✅ DB connected for migration check');

    // Check if schema already applied
    const { rows } = await client.query(`
      SELECT COUNT(*) as cnt
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (parseInt(rows[0].cnt) > 0) {
      console.log('ℹ️  Schema already exists — skipping migration');
      return;
    }

    console.log('▶ Applying schema...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and run statements one by one to avoid pg multi-statement issues
    // Actually just run entire file — pg supports it
    await client.query(schema);
    console.log('✅ Schema applied');

    console.log('▶ Seeding demo data...');
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    await client.query(seed);
    console.log('✅ Demo data seeded');

  } catch (err) {
    // Log but don't crash — server can still start with existing DB
    console.warn('⚠️  Migration warning:', err.message);
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  await migrate();
  // Now start the actual Express server
  require('../src/server');
})();
