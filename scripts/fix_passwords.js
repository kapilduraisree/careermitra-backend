// Run in Railway Console: node scripts/fix_passwords.js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: process.env.DB_HOST, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD }
)

async function run() {
  // Generate fresh hash for Admin@1234
  const hash = await bcrypt.hash('Admin@1234', 12)
  console.log('Hash generated:', hash.substring(0, 20) + '...')

  // Update admin
  const r1 = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [hash, 'admin@careermitra.demo']
  )
  console.log('admin@careermitra.demo updated:', r1.rowCount, 'row(s)')

  // Update demo student
  const r2 = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [hash, 'demo@careermitra.com']
  )
  console.log('demo@careermitra.com updated:', r2.rowCount, 'row(s)')

  // If demo student doesn't exist, create it
  if (r2.rowCount === 0) {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, is_active)
       VALUES ('f1000000-0000-0000-0000-000000000001', 'Demo Student', 'demo@careermitra.com', $1, 'user', TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1`,
      [hash]
    )
    await pool.query(
      `INSERT INTO profiles (user_id, qualification, experience_level, preferred_job_type, preferred_location)
       VALUES ('f1000000-0000-0000-0000-000000000001', 'B.Tech CS', 'fresher', 'government', 'Chennai')
       ON CONFLICT DO NOTHING`
    )
    await pool.query(
      `INSERT INTO user_stats (user_id) VALUES ('f1000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING`
    )
    await pool.query(
      `INSERT INTO notification_preferences (user_id) VALUES ('f1000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING`
    )
    console.log('Demo student account created!')
  }

  // Show all users
  const { rows } = await pool.query('SELECT email, role, is_active FROM users ORDER BY created_at')
  console.log('\nAll users in database:')
  rows.forEach(r => console.log(' -', r.email, '|', r.role, '| active:', r.is_active))

  console.log('\n✅ Done! Login with:')
  console.log('   demo@careermitra.com  /  Admin@1234')
  console.log('   admin@careermitra.demo / Admin@1234')

  await pool.end()
}

run().catch(e => { console.error('Error:', e.message); process.exit(1) })
