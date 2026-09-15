const pool = require('../config/database');
const { success, created, notFound, error, paginated } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/pagination');
const bcrypt = require('bcryptjs');

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const [usersRes, jobsRes, examsRes, applicationsRes, testsRes] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM users`),
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active,
                       COUNT(*) FILTER (WHERE job_type = 'government')::int AS government,
                       COUNT(*) FILTER (WHERE job_type = 'private')::int AS private,
                       COUNT(*) FILTER (WHERE job_type = 'internship')::int AS internship FROM jobs`),
    pool.query(`SELECT COUNT(*)::int AS total FROM exams`),
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'applied')::int AS applied FROM applications`),
    pool.query(`SELECT COUNT(*)::int AS total FROM test_attempts`),
  ]);

  return success(res, {
    users: usersRes.rows[0],
    jobs: jobsRes.rows[0],
    exams: examsRes.rows[0],
    applications: applicationsRes.rows[0],
    test_attempts: testsRes.rows[0].total,
  });
});

// ── Users management ──────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search, role } = req.query;
  const conditions = [];
  const params = [];

  if (search) { params.push(`%${search}%`); conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`); }
  if (role)   { params.push(role); conditions.push(`role = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users ${where}`, params),
    pool.query(`SELECT id, name, email, phone, role, is_active, last_login, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { is_active, role } = req.body;
  if (req.params.userId === req.user.id) return error(res, 'Cannot modify your own account', 400);

  const { rows } = await pool.query(
    `UPDATE users SET
       is_active = COALESCE($1, is_active),
       role = COALESCE($2, role)
     WHERE id = $3 RETURNING id, name, email, role, is_active`,
    [is_active, role, req.params.userId]
  );
  if (!rows.length) return notFound(res, 'User not found');
  return success(res, rows[0], 'User updated');
});

// ── Jobs CRUD ─────────────────────────────────────────────────────────────────
const createJob = asyncHandler(async (req, res) => {
  const {
    title, company_id, job_type, category, sub_category, description,
    qualification, experience_required, age_limit_min, age_limit_max,
    salary_min, salary_max, salary_display, location, vacancy_count,
    application_fee, selection_process, exam_pattern, syllabus,
    application_start, application_end, exam_date, notification_url, apply_url,
    is_demo = false, skills = [],
  } = req.body;

  if (!title || !job_type) return error(res, 'title and job_type are required', 400);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO jobs (title, company_id, job_type, category, sub_category, description,
         qualification, experience_required, age_limit_min, age_limit_max,
         salary_min, salary_max, salary_display, location, vacancy_count,
         application_fee, selection_process, exam_pattern, syllabus,
         application_start, application_end, exam_date, notification_url, apply_url, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING *`,
      [title, company_id || null, job_type, category || null, sub_category || null,
       description || null, qualification || null, experience_required || null,
       age_limit_min || null, age_limit_max || null, salary_min || null, salary_max || null,
       salary_display || null, location || null, vacancy_count || null, application_fee || null,
       selection_process || null, exam_pattern || null, syllabus || null,
       application_start || null, application_end || null, exam_date || null,
       notification_url || null, apply_url || null, is_demo]
    );

    const jobId = rows[0].id;
    for (const skillName of skills) {
      const { rows: skillRows } = await client.query(
        `INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [skillName]
      );
      await client.query(
        `INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [jobId, skillRows[0].id]
      );
    }

    await client.query('COMMIT');
    return created(res, rows[0], 'Job created successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const updateJob = asyncHandler(async (req, res) => {
  const fields = [
    'title','category','sub_category','description','qualification','experience_required',
    'age_limit_min','age_limit_max','salary_min','salary_max','salary_display','location',
    'vacancy_count','application_fee','selection_process','exam_pattern','syllabus',
    'application_start','application_end','exam_date','notification_url','apply_url','is_active',
  ];

  const setClauses = [];
  const params = [];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      params.push(req.body[field]);
      setClauses.push(`${field} = $${params.length}`);
    }
  });

  if (!setClauses.length) return error(res, 'No fields to update', 400);

  params.push(req.params.jobId);
  const { rows } = await pool.query(
    `UPDATE jobs SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows.length) return notFound(res, 'Job not found');
  return success(res, rows[0], 'Job updated');
});

const deleteJob = asyncHandler(async (req, res) => {
  await pool.query(`UPDATE jobs SET is_active = FALSE WHERE id = $1`, [req.params.jobId]);
  return success(res, {}, 'Job deactivated');
});

// ── Exams CRUD ────────────────────────────────────────────────────────────────
const createExam = asyncHandler(async (req, res) => {
  const { name, short_name, category, conducting_body, description, official_url, exam_date, notification_url, is_demo } = req.body;
  if (!name || !category) return error(res, 'name and category are required', 400);

  const { rows } = await pool.query(
    `INSERT INTO exams (name, short_name, category, conducting_body, description, official_url, exam_date, notification_url, is_demo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, short_name || null, category, conducting_body || null, description || null,
     official_url || null, exam_date || null, notification_url || null, is_demo || false]
  );
  return created(res, rows[0], 'Exam created');
});

// ── Questions CRUD ────────────────────────────────────────────────────────────
const addQuestion = asyncHandler(async (req, res) => {
  const { exam_id, subject_id, topic, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, difficulty, year } = req.body;
  if (!question_text || !correct_ans) return error(res, 'question_text and correct_ans are required', 400);

  const { rows } = await pool.query(
    `INSERT INTO questions (exam_id, subject_id, topic, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, difficulty, year)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [exam_id || null, subject_id || null, topic || null, question_text, option_a, option_b, option_c, option_d,
     correct_ans.toUpperCase(), explanation || null, difficulty || 'medium', year || null]
  );
  return created(res, rows[0], 'Question added');
});

// ── Mock Tests CRUD ───────────────────────────────────────────────────────────
const createMockTest = asyncHandler(async (req, res) => {
  const { exam_id, title, description, duration_min, total_marks, pass_marks, question_ids, is_demo } = req.body;
  if (!title || !question_ids?.length) return error(res, 'title and question_ids are required', 400);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO mock_tests (exam_id, title, description, duration_min, total_marks, pass_marks, question_count, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [exam_id || null, title, description || null, duration_min || 60,
       total_marks || question_ids.length * 2, pass_marks || null, question_ids.length, is_demo || false]
    );
    for (let i = 0; i < question_ids.length; i++) {
      await client.query(
        `INSERT INTO mock_test_questions (test_id, question_id, order_index) VALUES ($1,$2,$3)`,
        [rows[0].id, question_ids[i], i]
      );
    }
    await client.query('COMMIT');
    return created(res, rows[0], 'Mock test created');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ── Analytics ─────────────────────────────────────────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
  const [registrations, activeUsers, testPerf, topJobs] = await Promise.all([
    pool.query(`SELECT DATE(created_at) AS date, COUNT(*)::int AS registrations FROM users WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date`),
    pool.query(`SELECT COUNT(DISTINCT user_id)::int AS active FROM user_stats WHERE last_active >= CURRENT_DATE - INTERVAL '7 days'`),
    pool.query(`SELECT ROUND(AVG(accuracy),1) AS avg_accuracy, ROUND(AVG(score),1) AS avg_score FROM test_attempts WHERE created_at >= NOW() - INTERVAL '30 days'`),
    pool.query(`SELECT j.title, c.name AS company, COUNT(a.id)::int AS applications FROM jobs j LEFT JOIN companies c ON j.company_id = c.id JOIN applications a ON j.id = a.job_id GROUP BY j.id, c.name ORDER BY applications DESC LIMIT 5`),
  ]);

  return success(res, {
    registrations: registrations.rows,
    active_users_7d: activeUsers.rows[0].active,
    test_performance: testPerf.rows[0],
    top_jobs: topJobs.rows,
  });
});

// ── Study Materials ───────────────────────────────────────────────────────────
const addStudyMaterial = asyncHandler(async (req, res) => {
  const { exam_id, subject_id, title, content_type, content_url, content_text, thumbnail, duration_min, is_demo } = req.body;
  if (!title) return error(res, 'title is required', 400);

  const { rows } = await pool.query(
    `INSERT INTO study_materials (exam_id, subject_id, title, content_type, content_url, content_text, thumbnail, duration_min, is_demo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [exam_id || null, subject_id || null, title, content_type || 'article',
     content_url || null, content_text || null, thumbnail || null, duration_min || null, is_demo || false]
  );
  return created(res, rows[0], 'Study material added');
});

module.exports = {
  getDashboard, getUsers, updateUserStatus,
  createJob, updateJob, deleteJob,
  createExam, addQuestion, createMockTest,
  getAnalytics, addStudyMaterial,
};
