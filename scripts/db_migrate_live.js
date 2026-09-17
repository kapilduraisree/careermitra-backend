// Railway Console: node scripts/db_migrate_live.js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST, port: 5432, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD }
)

async function run() {
  const queries = [
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual'",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_id VARCHAR(100)",
    "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE",
    "CREATE INDEX IF NOT EXISTS idx_jobs_external ON jobs(external_id) WHERE external_id IS NOT NULL",
    "CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source)",
  ]

  for (const q of queries) {
    try {
      await pool.query(q)
      console.log('OK:', q.substring(0, 60))
    } catch (e) {
      console.log('SKIP:', e.message.substring(0, 80))
    }
  }

  // Also run more_exams
  const fs = require('fs'), path = require('path')
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../database/more_exams.sql'), 'utf8')
    await pool.query(sql)
    console.log('OK: more_exams.sql applied')
  } catch (e) {
    console.log('Exams note:', e.message.substring(0, 80))
  }

  console.log('\n✅ All migrations complete!')
  await pool.end()
}

run().catch(e => { console.error(e.message); process.exit(1) })
