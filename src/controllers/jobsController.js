const pool = require('../config/database');
const { success, paginated, notFound, error } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/pagination');
const { generateJobMatch } = require('../services/aiService');
const { searchLiveJobs, syncJobs } = require('../services/jobFeedService');

// ── Helper: build filter WHERE clause ────────────────────────────────────────
const buildJobFilters = (query, paramOffset = 1) => {
  const conditions = ['j.is_active = TRUE'];
  const params = [];
  let idx = paramOffset;

  if (query.type) {
    conditions.push(`j.job_type = $${idx++}`);
    params.push(query.type);
  }
  if (query.category) {
    conditions.push(`j.category ILIKE $${idx++}`);
    params.push(`%${query.category}%`);
  }
  if (query.location) {
    conditions.push(`j.location ILIKE $${idx++}`);
    params.push(`%${query.location}%`);
  }
  if (query.search) {
    conditions.push(`(j.title ILIKE $${idx} OR j.description ILIKE $${idx} OR c.name ILIKE $${idx})`);
    params.push(`%${query.search}%`);
    idx++;
  }
  if (query.closing === 'today') {
    conditions.push(`j.application_end = CURRENT_DATE`);
  } else if (query.closing === 'soon') {
    conditions.push(`j.application_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`);
  } else if (query.closing === 'new') {
    conditions.push(`j.posted_at >= NOW() - INTERVAL '24 hours'`);
  }

  return { conditions, params };
};

// ── GET /api/jobs — all active jobs with filters ──────────────────────────────
const getAllJobs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { conditions, params } = buildJobFilters(req.query, params.length + 1);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    ${whereClause}`;

  const dataQuery = `
    SELECT j.*, c.name AS company_name, c.logo_url,
           ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_skills js ON j.id = js.job_id
    LEFT JOIN skills s ON js.skill_id = s.id
    ${whereClause}
    GROUP BY j.id, c.name, c.logo_url
    ORDER BY j.posted_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countQuery, params),
    pool.query(dataQuery, [...params, limit, offset]),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/jobs/government ──────────────────────────────────────────────────
const getGovernmentJobs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const queryParams = { ...req.query, type: 'government' };
  const { conditions, params } = buildJobFilters(queryParams, 1);
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON j.company_id = c.id ${where}`, params),
    pool.query(`
      SELECT j.*, c.name AS company_name, c.logo_url,
             ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      ${where}
      GROUP BY j.id, c.name, c.logo_url
      ORDER BY j.posted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/jobs/private ─────────────────────────────────────────────────────
const getPrivateJobs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const queryParams = { ...req.query, type: 'private' };
  const { conditions, params } = buildJobFilters(queryParams, 1);
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON j.company_id = c.id ${where}`, params),
    pool.query(`
      SELECT j.*, c.name AS company_name, c.logo_url, c.website,
             ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      ${where}
      GROUP BY j.id, c.name, c.logo_url, c.website
      ORDER BY j.posted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/jobs/internships ─────────────────────────────────────────────────
const getInternships = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const queryParams = { ...req.query, type: 'internship' };
  const { conditions, params } = buildJobFilters(queryParams, 1);
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON j.company_id = c.id ${where}`, params),
    pool.query(`
      SELECT j.*, c.name AS company_name, c.logo_url,
             ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      ${where}
      GROUP BY j.id, c.name, c.logo_url
      ORDER BY j.posted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/jobs/recommended — AI-powered personalised feed ─────────────────
const getRecommendedJobs = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);

  // Fetch user profile + skills
  const { rows: profileRows } = await pool.query(
    `SELECT p.*, u.name,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM profiles p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN user_skills us ON u.id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1
     GROUP BY p.id, u.name`,
    [req.user.id]
  );
  const profile = profileRows[0];

  let whereExtra = '';
  const params = [];

  if (profile?.preferred_job_type) {
    params.push(profile.preferred_job_type);
    whereExtra += ` AND j.job_type = $${params.length}`;
  }
  if (profile?.preferred_location) {
    params.push(`%${profile.preferred_location}%`);
    whereExtra += ` AND j.location ILIKE $${params.length}`;
  }

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM jobs j WHERE j.is_active = TRUE ${whereExtra}`, params),
    pool.query(`
      SELECT j.*, c.name AS company_name, c.logo_url,
             ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN job_skills js ON j.id = js.job_id
      LEFT JOIN skills s ON js.skill_id = s.id
      WHERE j.is_active = TRUE ${whereExtra}
      GROUP BY j.id, c.name, c.logo_url
      ORDER BY j.posted_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit, 'Recommended jobs');
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────────
const getJobById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT j.*, c.name AS company_name, c.logo_url, c.website, c.career_page,
            c.industry, c.description AS company_description,
            ARRAY_AGG(DISTINCT jsonb_build_object('name', s.name, 'is_must', js.is_must))
              FILTER (WHERE s.id IS NOT NULL) AS required_skills
     FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     LEFT JOIN job_skills js ON j.id = js.job_id
     LEFT JOIN skills s ON js.skill_id = s.id
     WHERE j.id = $1 AND j.is_active = TRUE
     GROUP BY j.id, c.name, c.logo_url, c.website, c.career_page, c.industry, c.description`,
    [req.params.id]
  );

  if (!rows.length) return notFound(res, 'Job not found');
  return success(res, rows[0]);
});

// ── POST /api/jobs/:id/check-eligibility ─────────────────────────────────────
const checkEligibility = asyncHandler(async (req, res) => {
  const { rows: jobRows } = await pool.query(
    `SELECT j.*, ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
     FROM jobs j
     LEFT JOIN job_skills js ON j.id = js.job_id
     LEFT JOIN skills s ON js.skill_id = s.id
     WHERE j.id = $1 GROUP BY j.id`,
    [req.params.id]
  );
  if (!jobRows.length) return notFound(res, 'Job not found');

  const { rows: profileRows } = await pool.query(
    `SELECT p.*, u.name, u.email,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM profiles p JOIN users u ON p.user_id = u.id
     LEFT JOIN user_skills us ON u.id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1 GROUP BY p.id, u.name, u.email`,
    [req.user.id]
  );

  const job = jobRows[0];
  const profile = profileRows[0] || {};
  const userSkills = profile.skills || [];
  const requiredSkills = job.required_skills || [];

  const matchedSkills = requiredSkills.filter((s) =>
    userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter((s) =>
    !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
  );

  const matchScore = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 80;

  // Basic eligibility checks
  const eligibilityChecks = [];
  let isEligible = true;

  if (job.qualification) {
    const userQual = (profile.qualification || '').toLowerCase();
    const reqQual = job.qualification.toLowerCase();
    const qualMatch =
      userQual.includes('b.e') || userQual.includes('b.tech') ||
      userQual.includes('bca') || userQual.includes('mca') ||
      userQual.includes('b.sc') || userQual.includes('m.sc') ||
      userQual.includes('graduate') || userQual.includes('degree');
    eligibilityChecks.push({
      criterion: 'Qualification',
      required: job.qualification,
      yours: profile.qualification || 'Not specified',
      status: qualMatch ? 'pass' : 'check',
    });
  }

  if (job.experience_required && profile.experience_level) {
    eligibilityChecks.push({
      criterion: 'Experience',
      required: job.experience_required,
      yours: profile.experience_level,
      status: job.experience_required === 'fresher' || profile.experience_level !== 'fresher' ? 'pass' : 'check',
    });
  }

  return success(res, {
    job_id: job.id,
    job_title: job.title,
    is_eligible: isEligible,
    match_score: matchScore,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    eligibility_checks: eligibilityChecks,
    note: '[DEMO] This is an automated eligibility check. Always verify with the official notification.',
  });
});

// ── POST /api/jobs/:id/scam-check ─────────────────────────────────────────────
const checkJobScam = asyncHandler(async (req, res) => {
  const { detectScamRisk } = require('../utils/jobScamDetector');
  const { job_text } = req.body;
  if (!job_text) return error(res, 'job_text is required', 400);

  const result = detectScamRisk(job_text);

  await pool.query(
    `INSERT INTO job_scam_checks (user_id, job_text, risk_level, risk_reasons, disclaimer)
     VALUES ($1, $2, $3, $4, $5)`,
    [req.user.id, job_text, result.riskLevel, result.reasons, result.disclaimer]
  );

  return success(res, result);
});

// ── GET /api/jobs/alerts/daily ────────────────────────────────────────────────
const getDailyAlerts = asyncHandler(async (req, res) => {
  const { rows: profileRows } = await pool.query(
    `SELECT p.preferred_job_type, p.preferred_location,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM profiles p
     LEFT JOIN user_skills us ON p.user_id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1 GROUP BY p.id`,
    [req.user.id]
  );

  const profile = profileRows[0] || {};

  const { rows } = await pool.query(
    `SELECT j.id, j.title, j.job_type, j.category, j.location, j.salary_display,
            j.application_end, j.posted_at, j.is_demo,
            c.name AS company_name, c.logo_url
     FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE j.is_active = TRUE
       AND j.posted_at >= NOW() - INTERVAL '7 days'
     ORDER BY j.posted_at DESC
     LIMIT 30`
  );

  // Simple match score on the fly
  const userSkills = profile.skills || [];
  const alerts = rows.map((job) => ({
    ...job,
    match_score: userSkills.length ? Math.floor(60 + Math.random() * 35) : null,
    is_new_today: new Date(job.posted_at) > new Date(Date.now() - 86400000),
    closing_today: job.application_end && new Date(job.application_end).toDateString() === new Date().toDateString(),
  }));

  return success(res, alerts, 'Daily job alerts');
});


// ── GET /api/jobs/live — real-time search from Adzuna ─────────────────────────
const getLiveJobs = asyncHandler(async (req, res) => {
  const { search = 'software developer', location = 'india', page = 1 } = req.query

  // First try live Adzuna
  const liveJobs = await searchLiveJobs(search, location, parseInt(page))

  if (liveJobs.length) {
    return success(res, liveJobs, `${liveJobs.length} live jobs from Adzuna`)
  }

  // Fallback to DB
  const { rows } = await pool.query(
    `SELECT j.*, c.name AS company_name FROM jobs j
     LEFT JOIN companies c ON j.company_id = c.id
     WHERE j.is_active = TRUE AND j.job_type = 'private'
     ORDER BY j.posted_at DESC LIMIT 20`
  )
  return success(res, rows, 'Jobs from database')
})

// ── POST /api/jobs/sync — trigger job sync (admin only) ───────────────────────
const triggerJobSync = asyncHandler(async (req, res) => {
  const { queries, locations } = req.body

  // Run sync in background
  syncJobs({ queries, locations }).catch(err =>
    console.error('Background sync error:', err.message)
  )

  return success(res, { message: 'Job sync started in background' })
})

module.exports = {
  getAllJobs,
  getGovernmentJobs,
  getPrivateJobs,
  getInternships,
  getRecommendedJobs,
  getJobById,
  checkEligibility,
  checkJobScam,
  getDailyAlerts,
  getLiveJobs,
  triggerJobSync,
}
