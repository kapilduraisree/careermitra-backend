// Run this in Railway Console: node scripts/add_exams.js
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { Client } = require('pg')
const fs = require('fs'), path = require('path')

;(async () => {
  const client = new Client(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : { host: process.env.DB_HOST || 'localhost', port: 5432, database: process.env.DB_NAME || 'careermitra', user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD || '' }
  )
  await client.connect()
  const sql = fs.readFileSync(path.join(__dirname, '../database/more_exams.sql'), 'utf8')
  try {
    await client.query(sql)
    console.log('✅ More exams added successfully!')
  } catch(e) {
    console.error('Error:', e.message)
  } finally {
    await client.end()
  }
})()
