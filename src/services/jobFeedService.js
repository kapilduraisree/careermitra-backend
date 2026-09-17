/**
 * CareerMitra AI — Real-Time Job Feed Service
 * Fetches live jobs from Adzuna API and stores in PostgreSQL
 * API keys read from environment variables — never hardcoded
 */

const https = require('https')
const pool  = require('../config/database')

const ADZUNA_APP_ID  = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY
const COUNTRY        = 'in'  // India

// ── Fetch from Adzuna ─────────────────────────────────────────────────────────
const fetchAdzunaJobs = (query, location, page = 1, perPage = 20) => {
  return new Promise((resolve, reject) => {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return reject(new Error('ADZUNA_APP_ID or ADZUNA_APP_KEY not set'))
    }

    const params = new URLSearchParams({
      app_id:           ADZUNA_APP_ID,
      app_key:          ADZUNA_APP_KEY,
      results_per_page: perPage,
      what:             query,
      where:            location || 'india',
      'content-type':   'application/json',
    })

    const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/${page}?${params}`

    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

// ── Map Adzuna job to our DB schema ───────────────────────────────────────────
const mapAdzunaJob = (job) => ({
  title:               job.title?.substring(0, 255) || 'Untitled',
  job_type:            'private',
  category:            mapCategory(job.category?.label),
  description:         job.description?.substring(0, 2000) || '',
  location:            job.location?.display_name || job.location?.area?.[0] || 'India',
  salary_min:          job.salary_min || null,
  salary_max:          job.salary_max || null,
  salary_display:      buildSalaryDisplay(job.salary_min, job.salary_max),
  apply_url:           job.redirect_url || null,
  notification_url:    job.redirect_url || null,
  experience_required: 'fresher',
  is_demo:             false,
  is_active:           true,
  source:              'adzuna',
  external_id:         job.id?.toString() || null,
  company_name:        job.company?.display_name || null,
})

const mapCategory = (label) => {
  if (!label) return 'IT'
  const l = label.toLowerCase()
  if (l.includes('engineer') || l.includes('software') || l.includes('developer')) return 'IT'
  if (l.includes('data') || l.includes('analyst')) return 'Analytics'
  if (l.includes('finance') || l.includes('account')) return 'Finance'
  if (l.includes('marketing') || l.includes('sales')) return 'Marketing'
  if (l.includes('design')) return 'Design'
  if (l.includes('hr') || l.includes('human')) return 'HR'
  if (l.includes('teaching') || l.includes('education')) return 'Teaching'
  return 'IT'
}

const buildSalaryDisplay = (min, max) => {
  if (!min && !max) return null
  const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  return null
}

// ── Upsert company ────────────────────────────────────────────────────────────
const upsertCompany = async (client, name) => {
  if (!name) return null
  const { rows } = await client.query(
    `INSERT INTO companies (name, is_verified)
     VALUES ($1, FALSE)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name.substring(0, 255)]
  )
  return rows[0].id
}

// ── Upsert job ────────────────────────────────────────────────────────────────
const upsertJob = async (client, mapped, companyId) => {
  // Check if job already exists by external_id
  if (mapped.external_id) {
    const { rows: existing } = await client.query(
      `SELECT id FROM jobs WHERE external_id = $1`, [mapped.external_id]
    )
    if (existing.length) {
      // Update existing job
      await client.query(
        `UPDATE jobs SET title=$1, description=$2, salary_min=$3, salary_max=$4,
         salary_display=$5, apply_url=$6, is_active=TRUE, updated_at=NOW()
         WHERE external_id=$7`,
        [mapped.title, mapped.description, mapped.salary_min, mapped.salary_max,
         mapped.salary_display, mapped.apply_url, mapped.external_id]
      )
      return existing[0].id
    }
  }

  // Insert new job
  const { rows } = await client.query(
    `INSERT INTO jobs (
       title, company_id, job_type, category, description,
       experience_required, salary_min, salary_max, salary_display,
       location, apply_url, notification_url, is_demo, is_active,
       source, external_id
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      mapped.title, companyId, mapped.job_type, mapped.category,
      mapped.description, mapped.experience_required,
      mapped.salary_min, mapped.salary_max, mapped.salary_display,
      mapped.location, mapped.apply_url, mapped.notification_url,
      false, true, mapped.source, mapped.external_id
    ]
  )
  return rows[0].id
}

// ── Main sync function ────────────────────────────────────────────────────────
const syncJobs = async (options = {}) => {
  const {
    queries   = ['software developer','data analyst','ai ml engineer','python developer','java developer','marketing manager','finance analyst','product manager'],
    locations = ['mumbai','bangalore','chennai','hyderabad','delhi','pune','kolkata'],
    perQuery  = 10,
  } = options

  console.log(`🔄 Starting job sync... (${queries.length} queries × ${locations.length} locations)`)

  let totalInserted = 0
  let totalUpdated  = 0
  let errors        = 0

  for (const query of queries) {
    for (const location of locations) {
      try {
        const data = await fetchAdzunaJobs(query, location, 1, perQuery)
        const jobs = data.results || []

        if (!jobs.length) continue

        const client = await pool.connect()
        try {
          await client.query('BEGIN')

          for (const rawJob of jobs) {
            const mapped    = mapAdzunaJob(rawJob)
            const companyId = await upsertCompany(client, mapped.company_name)
            await upsertJob(client, mapped, companyId)
            totalInserted++
          }

          await client.query('COMMIT')
        } catch (err) {
          await client.query('ROLLBACK')
          errors++
          console.error(`DB error for ${query}/${location}:`, err.message)
        } finally {
          client.release()
        }

        // Rate limiting — Adzuna allows ~250 req/day on free tier
        await new Promise(r => setTimeout(r, 500))

      } catch (err) {
        errors++
        console.error(`Fetch error for ${query}/${location}:`, err.message)
      }
    }
  }

  console.log(`✅ Job sync complete: ~${totalInserted} jobs processed, ${errors} errors`)
  return { totalInserted, errors }
}

// ── Search live from Adzuna (real-time search) ────────────────────────────────
const searchLiveJobs = async (query, location, page = 1) => {
  try {
    const data = await fetchAdzunaJobs(query, location || 'india', page, 20)
    return (data.results || []).map(job => ({
      id:           `adzuna_${job.id}`,
      title:        job.title,
      company_name: job.company?.display_name,
      location:     job.location?.display_name,
      description:  job.description,
      salary_display: buildSalaryDisplay(job.salary_min, job.salary_max),
      apply_url:    job.redirect_url,
      job_type:     'private',
      category:     mapCategory(job.category?.label),
      posted_at:    job.created,
      is_demo:      false,
      is_live:      true,
      source:       'adzuna',
    }))
  } catch (err) {
    console.error('Live search error:', err.message)
    return []
  }
}

// ── Get job categories from Adzuna ────────────────────────────────────────────
const getAdzunaCategories = () => {
  return new Promise((resolve, reject) => {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return resolve([])
    const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/categories?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}`
    https.get(url, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => { try { resolve(JSON.parse(data).results || []) } catch { resolve([]) } })
    }).on('error', () => resolve([]))
  })
}

module.exports = { syncJobs, searchLiveJobs, fetchAdzunaJobs, getAdzunaCategories }
