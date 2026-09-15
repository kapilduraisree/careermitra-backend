const pool = require('../config/database');
const { success, created, notFound, error, paginated } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/pagination');

// ── POST /api/applications — save or apply to a job ───────────────────────────
const createApplication = asyncHandler(async (req, res) => {
  const { job_id, status = 'saved', notes } = req.body;
  if (!job_id) return error(res, 'job_id is required', 400);

  const { rows: jobRows } = await pool.query(`SELECT id FROM jobs WHERE id = $1`, [job_id]);
  if (!jobRows.length) return notFound(res, 'Job not found');

  const { rows } = await pool.query(
    `INSERT INTO applications (user_id, job_id, status, notes, applied_at)
     VALUES ($1, $2, $3::application_status, $4,
             CASE WHEN $3 = 'applied' THEN NOW() ELSE NULL END)
     ON CONFLICT (user_id, job_id) DO UPDATE
       SET status = $3::application_status,
           notes = COALESCE($4, applications.notes),
           applied_at = CASE WHEN $3 = 'applied' AND applications.applied_at IS NULL
                             THEN NOW() ELSE applications.applied_at END
     RETURNING *`,
    [req.user.id, job_id, status, notes || null]
  );

  // Update stats if applied
  if (status === 'applied') {
    await pool.query(
      `UPDATE user_stats SET jobs_applied = jobs_applied + 1 WHERE user_id = $1`, [req.user.id]
    );
  }

  return created(res, rows[0], status === 'saved' ? 'Job saved' : 'Application recorded');
});

// ── GET /api/applications ─────────────────────────────────────────────────────
const getApplications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status } = req.query;

  const conditions = [`a.user_id = $1`];
  const params = [req.user.id];

  if (status) { params.push(status); conditions.push(`a.status = $${params.length}`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM applications a ${where}`, params),
    pool.query(`
      SELECT a.*, j.title, j.job_type, j.category, j.location, j.application_end,
             c.name AS company_name, c.logo_url
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      ${where} ORDER BY a.updated_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/applications/summary ────────────────────────────────────────────
const getApplicationSummary = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count
     FROM applications WHERE user_id = $1 GROUP BY status`,
    [req.user.id]
  );

  const summary = {
    saved: 0, applied: 0, assessment: 0,
    interview: 0, selected: 0, rejected: 0,
  };
  rows.forEach((r) => { summary[r.status] = r.count; });
  summary.total = Object.values(summary).reduce((a, b) => a + b, 0);

  return success(res, summary);
});

// ── PUT /api/applications/:id ─────────────────────────────────────────────────
const updateApplication = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const { rows } = await pool.query(
    `UPDATE applications SET
       status = COALESCE($1::application_status, status),
       notes = COALESCE($2, notes),
       applied_at = CASE WHEN $1 = 'applied' AND applied_at IS NULL THEN NOW() ELSE applied_at END
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [status || null, notes || null, req.params.id, req.user.id]
  );
  if (!rows.length) return notFound(res, 'Application not found');

  return success(res, rows[0], 'Application updated');
});

// ── DELETE /api/applications/:id ─────────────────────────────────────────────
const deleteApplication = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return notFound(res, 'Application not found');
  return success(res, {}, 'Application removed');
});

module.exports = { createApplication, getApplications, getApplicationSummary, updateApplication, deleteApplication };
