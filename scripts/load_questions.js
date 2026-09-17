// CareerMitra - Load all questions into Railway DB
// Run: node scripts/load_questions.js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST||'localhost', port:5432, database:process.env.DB_NAME||'careermitra', user:process.env.DB_USER||'postgres', password:process.env.DB_PASSWORD||'kapil2006' }
)

async function run() {
  console.log('Connecting to database...')
  
  // Test connection
  const test = await pool.query('SELECT COUNT(*) as q FROM questions, (SELECT COUNT(*) as m FROM mock_tests) mt')
  console.log('Current state - checking...')
  
  const before = await pool.query('SELECT (SELECT COUNT(*) FROM questions) as q, (SELECT COUNT(*) FROM mock_tests) as m')
  console.log('Before - Questions:', before.rows[0].q, 'Mock tests:', before.rows[0].m)
  
  // Read SQL file
  const sqlPath = path.join(__dirname, '../database/questions_dump.sql')
  if (!fs.existsSync(sqlPath)) {
    console.log('ERROR: questions_dump.sql not found at:', sqlPath)
    process.exit(1)
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const lines = sql.split('\n').filter(l => l.startsWith('INSERT'))
  console.log('SQL file has', lines.length, 'INSERT statements')
  
  // Run each INSERT separately to avoid multi-statement issues
  let success = 0
  let skipped = 0
  let errors = 0
  
  for (const line of lines) {
    if (!line.trim()) continue
    try {
      const result = await pool.query(line)
      if (result.rowCount > 0) success++
      else skipped++
    } catch (e) {
      errors++
      if (errors <= 3) console.log('Error:', e.message.substring(0, 100))
    }
  }
  
  const after = await pool.query('SELECT (SELECT COUNT(*) FROM questions) as q, (SELECT COUNT(*) FROM mock_tests) as m, (SELECT COUNT(*) FROM mock_test_questions) as l')
  console.log('After - Questions:', after.rows[0].q, 'Mock tests:', after.rows[0].m, 'Links:', after.rows[0].l)
  console.log('Results - Inserted:', success, 'Skipped:', skipped, 'Errors:', errors)
  console.log('Done. All questions loaded.')
  
  await pool.end()
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1) })