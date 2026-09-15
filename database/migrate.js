/**
 * Database migration runner
 * Usage: node database/migrate.js
 * Runs schema.sql then seed.sql against the configured PostgreSQL database
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const run = async () => {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'careermitra',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database:', process.env.DB_NAME || 'careermitra');

    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('▶ Running schema.sql...');
    await client.query(schemaSQL);
    console.log('✅ Schema applied');

    if (process.argv.includes('--seed')) {
      const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
      console.log('▶ Running seed.sql...');
      await client.query(seedSQL);
      console.log('✅ Seed data inserted');
    }

    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
