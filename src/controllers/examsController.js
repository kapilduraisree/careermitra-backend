const pool = require('../config/database');
const { success, paginated, notFound, error, created } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/pagination');

// ── GET /api/exams ────────────────────────────────────────────────────────────
const getAllExams = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { category, search } = req.query;

  const conditions = ['is_active = TRUE'];
  const params = [];

  if (category) { params.push(`%${category}%`); conditions.push(`category ILIKE $${params.length}`); }
  if (search)   { params.push(`%${search}%`);   conditions.push(`(name ILIKE $${params.length} OR short_name ILIKE $${params.length})`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM exams ${where}`, params),
    pool.query(`SELECT * FROM exams ${where} ORDER BY name LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/exams/:id ────────────────────────────────────────────────────────
const getExamById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM exams WHERE id = $1 AND is_active = TRUE`, [req.params.id]);
  if (!rows.length) return notFound(res, 'Exam not found');

  // Fetch subjects
  const { rows: subjects } = await pool.query(
    `SELECT * FROM subjects WHERE exam_id = $1 ORDER BY order_index`, [req.params.id]
  );

  return success(res, { ...rows[0], subjects });
});

// ── GET /api/exams/:id/materials ──────────────────────────────────────────────
const getStudyMaterials = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { subject_id, content_type } = req.query;

  const conditions = [`exam_id = $1`];
  const params = [req.params.id];

  if (subject_id)   { params.push(subject_id);      conditions.push(`subject_id = $${params.length}`); }
  if (content_type) { params.push(content_type);     conditions.push(`content_type = $${params.length}`); }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM study_materials ${where}`, params),
    pool.query(`SELECT * FROM study_materials ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`, [...params, limit, offset]),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/exams/:id/tests ──────────────────────────────────────────────────
const getMockTests = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT mt.*, COUNT(mtq.id)::int AS actual_question_count
     FROM mock_tests mt
     LEFT JOIN mock_test_questions mtq ON mt.id = mtq.test_id
     WHERE mt.exam_id = $1
     GROUP BY mt.id ORDER BY mt.created_at DESC`,
    [req.params.id]
  );
  return success(res, rows);
});

// ── GET /api/tests/:testId — single test with questions ───────────────────────
const getTestById = asyncHandler(async (req, res) => {
  const { rows: testRows } = await pool.query(`SELECT * FROM mock_tests WHERE id = $1`, [req.params.testId]);
  if (!testRows.length) return notFound(res, 'Test not found');

  const { rows: questions } = await pool.query(
    `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
            q.difficulty, q.topic, mtq.order_index, mtq.marks
     FROM mock_test_questions mtq
     JOIN questions q ON mtq.question_id = q.id
     WHERE mtq.test_id = $1
     ORDER BY mtq.order_index`,
    [req.params.testId]
  );

  return success(res, { ...testRows[0], questions });
});

// ── POST /api/tests/:testId/submit ────────────────────────────────────────────
const submitTest = asyncHandler(async (req, res) => {
  const { answers, time_taken_min } = req.body;
  // answers: [{ question_id, selected }]

  if (!Array.isArray(answers)) return error(res, 'answers array is required', 400);

  const { rows: testRows } = await pool.query(`SELECT * FROM mock_tests WHERE id = $1`, [req.params.testId]);
  if (!testRows.length) return notFound(res, 'Test not found');
  const test = testRows[0];

  // Fetch correct answers
  const questionIds = answers.map((a) => a.question_id);
  const { rows: correctRows } = await pool.query(
    `SELECT q.id, q.correct_ans, q.topic,
            s.name AS subject_name,
            mtq.marks
     FROM questions q
     JOIN mock_test_questions mtq ON q.id = mtq.question_id
     LEFT JOIN subjects s ON q.subject_id = s.id
     WHERE q.id = ANY($1::uuid[]) AND mtq.test_id = $2`,
    [questionIds, req.params.testId]
  );

  const correctMap = {};
  correctRows.forEach((r) => { correctMap[r.id] = r; });

  let score = 0;
  const subjectPerformance = {};
  const processedAnswers = answers.map((a) => {
    const correct = correctMap[a.question_id];
    const isCorrect = correct && a.selected === correct.correct_ans;
    if (isCorrect) score += correct.marks || 2;

    const subject = correct?.subject_name || correct?.topic || 'General';
    if (!subjectPerformance[subject]) subjectPerformance[subject] = { correct: 0, total: 0 };
    subjectPerformance[subject].total++;
    if (isCorrect) subjectPerformance[subject].correct++;

    return { question_id: a.question_id, selected: a.selected, is_correct: isCorrect };
  });

  const accuracy = answers.length ? Math.round((processedAnswers.filter((a) => a.is_correct).length / answers.length) * 100) : 0;

  const strongAreas = Object.entries(subjectPerformance)
    .filter(([, v]) => v.total > 0 && (v.correct / v.total) >= 0.6)
    .map(([k]) => k);
  const weakAreas = Object.entries(subjectPerformance)
    .filter(([, v]) => v.total > 0 && (v.correct / v.total) < 0.6)
    .map(([k]) => k);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: attemptRows } = await client.query(
      `INSERT INTO test_attempts (user_id, test_id, score, total_marks, accuracy, time_taken_min, strong_areas, weak_areas, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id`,
      [req.user.id, req.params.testId, score, test.total_marks, accuracy, time_taken_min || null, strongAreas, weakAreas]
    );
    const attemptId = attemptRows[0].id;

    for (const a of processedAnswers) {
      await client.query(
        `INSERT INTO test_answers (attempt_id, question_id, selected, is_correct) VALUES ($1, $2, $3, $4)`,
        [attemptId, a.question_id, a.selected, a.is_correct]
      );
    }

    // Update user_stats
    await client.query(
      `UPDATE user_stats SET tests_done = tests_done + 1, questions_done = questions_done + $1 WHERE user_id = $2`,
      [answers.length, req.user.id]
    );

    await client.query('COMMIT');

    return success(res, {
      attempt_id: attemptId,
      score,
      total_marks: test.total_marks,
      accuracy,
      time_taken_min,
      strong_areas: strongAreas,
      weak_areas: weakAreas,
      answers: processedAnswers,
    }, 'Test submitted successfully');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ── GET /api/tests/history ────────────────────────────────────────────────────
const getTestHistory = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM test_attempts WHERE user_id = $1`, [req.user.id]),
    pool.query(`
      SELECT ta.*, mt.title AS test_title, mt.duration_min, e.name AS exam_name
      FROM test_attempts ta
      JOIN mock_tests mt ON ta.test_id = mt.id
      LEFT JOIN exams e ON mt.exam_id = e.id
      WHERE ta.user_id = $1
      ORDER BY ta.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

// ── GET /api/questions — topic-wise questions ─────────────────────────────────
const getQuestions = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { exam_id, subject_id, topic, difficulty } = req.query;

  const conditions = [];
  const params = [];

  if (exam_id)    { params.push(exam_id);           conditions.push(`q.exam_id = $${params.length}`); }
  if (subject_id) { params.push(subject_id);         conditions.push(`q.subject_id = $${params.length}`); }
  if (topic)      { params.push(`%${topic}%`);       conditions.push(`q.topic ILIKE $${params.length}`); }
  if (difficulty) { params.push(difficulty);          conditions.push(`q.difficulty = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM questions q ${where}`, params),
    pool.query(`
      SELECT q.*, s.name AS subject_name
      FROM questions q LEFT JOIN subjects s ON q.subject_id = s.id
      ${where} ORDER BY RANDOM()
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    ),
  ]);

  return paginated(res, dataRes.rows, parseInt(countRes.rows[0].count), page, limit);
});

module.exports = {
  getAllExams, getExamById, getStudyMaterials, getMockTests,
  getTestById, submitTest, getTestHistory, getQuestions,
};
