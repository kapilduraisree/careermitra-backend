const pool = require('../config/database');
const { success, error, created, notFound } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  chatWithMentor, generateJobMatch, analyzeSkillGap,
  generateCareerRoadmap, analyzeResume, generateMockInterviewQuestion,
  evaluateInterviewAnswer, generateDailyPlan, compareCareerPaths, recommendVideos,
} = require('../services/aiService');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { getPagination } = require('../utils/pagination');

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
const chat = asyncHandler(async (req, res) => {
  const { message, conversation_id, language = 'english' } = req.body;
  if (!message?.trim()) return error(res, 'message is required', 400);

  let convId = conversation_id;

  // Create or fetch conversation
  if (!convId) {
    const { rows } = await pool.query(
      `INSERT INTO ai_conversations (user_id, title, language)
       VALUES ($1, $2, $3) RETURNING id`,
      [req.user.id, message.substring(0, 60), language]
    );
    convId = rows[0].id;
  } else {
    // Verify ownership
    const { rows } = await pool.query(
      `SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2`, [convId, req.user.id]
    );
    if (!rows.length) return error(res, 'Conversation not found', 404);
  }

  // Fetch last 6 messages for context
  const { rows: history } = await pool.query(
    `SELECT sender, content FROM ai_messages
     WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 6`,
    [convId]
  );

  // Save user message
  await pool.query(
    `INSERT INTO ai_messages (conversation_id, sender, content) VALUES ($1, 'user', $2)`,
    [convId, message]
  );

  const aiResponse = await chatWithMentor(message, history.reverse(), language);

  // Save AI response
  await pool.query(
    `INSERT INTO ai_messages (conversation_id, sender, content) VALUES ($1, 'ai', $2)`,
    [convId, aiResponse]
  );

  // Update stats
  await pool.query(
    `UPDATE user_stats SET ai_chats = ai_chats + 1 WHERE user_id = $1`, [req.user.id]
  );

  return success(res, { conversation_id: convId, reply: aiResponse });
});

// ── GET /api/ai/conversations ─────────────────────────────────────────────────
const getConversations = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ac.*, COUNT(am.id)::int AS message_count
     FROM ai_conversations ac
     LEFT JOIN ai_messages am ON ac.id = am.conversation_id
     WHERE ac.user_id = $1
     GROUP BY ac.id ORDER BY ac.updated_at DESC LIMIT 20`,
    [req.user.id]
  );
  return success(res, rows);
});

// ── GET /api/ai/conversations/:id/messages ────────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { rows: conv } = await pool.query(
    `SELECT id FROM ai_conversations WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]
  );
  if (!conv.length) return notFound(res, 'Conversation not found');

  const { rows } = await pool.query(
    `SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [req.params.id]
  );
  return success(res, rows);
});

// ── POST /api/ai/job-match ────────────────────────────────────────────────────
const jobMatch = asyncHandler(async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return error(res, 'job_id is required', 400);

  const [jobRes, profileRes] = await Promise.all([
    pool.query(
      `SELECT j.*, ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS required_skills
       FROM jobs j LEFT JOIN job_skills js ON j.id = js.job_id LEFT JOIN skills s ON js.skill_id = s.id
       WHERE j.id = $1 GROUP BY j.id`, [job_id]
    ),
    pool.query(
      `SELECT p.*, u.name, ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
       FROM profiles p JOIN users u ON p.user_id = u.id
       LEFT JOIN user_skills us ON u.id = us.user_id LEFT JOIN skills s ON us.skill_id = s.id
       WHERE p.user_id = $1 GROUP BY p.id, u.name`, [req.user.id]
    ),
  ]);

  if (!jobRes.rows.length) return notFound(res, 'Job not found');

  const result = await generateJobMatch(profileRes.rows[0] || {}, jobRes.rows[0]);
  return success(res, result);
});

// ── POST /api/ai/skill-gap ────────────────────────────────────────────────────
const skillGap = asyncHandler(async (req, res) => {
  const { target_role } = req.body;
  if (!target_role) return error(res, 'target_role is required', 400);

  const { rows } = await pool.query(
    `SELECT ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = $1`,
    [req.user.id]
  );
  const userSkills = rows[0]?.skills || [];

  const result = await analyzeSkillGap(userSkills, target_role);
  return success(res, result);
});

// ── POST /api/ai/resume-analysis ──────────────────────────────────────────────
const resumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 'Resume PDF is required', 400);

  const filePath = req.file.path;
  let resumeText = '';
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    resumeText = parsed.text;
  } catch (e) {
    return error(res, 'Failed to parse PDF. Ensure the file is a valid PDF.', 422);
  }

  const analysis = await analyzeResume(resumeText);

  // Save to DB
  const { rows } = await pool.query(
    `INSERT INTO resumes (user_id, filename, file_url, ats_score, skills_found, missing_skills, suggestions, raw_text, analyzed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`,
    [req.user.id, req.file.originalname, req.file.path,
     analysis.ats_score, analysis.skills_found, analysis.missing_keywords,
     JSON.stringify(analysis.improvements), resumeText.substring(0, 5000)]
  );

  // Update profile readiness
  await pool.query(
    `UPDATE profiles SET career_readiness = (
       SELECT LEAST(100, career_readiness + 10) FROM profiles WHERE user_id = $1
     ) WHERE user_id = $1`, [req.user.id]
  );

  return success(res, { resume_id: rows[0].id, ...analysis });
});

// ── POST /api/ai/career-roadmap ───────────────────────────────────────────────
const careerRoadmap = asyncHandler(async (req, res) => {
  const { goal, save = false } = req.body;
  if (!goal) return error(res, 'goal is required', 400);

  const { rows: profileRows } = await pool.query(
    `SELECT p.*, ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM profiles p LEFT JOIN user_skills us ON p.user_id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1 GROUP BY p.id`, [req.user.id]
  );
  const profile = profileRows[0] || {};

  const roadmap = await generateCareerRoadmap(goal, profile);

  if (save) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create career goal
      const { rows: goalRows } = await client.query(
        `INSERT INTO career_goals (user_id, title) VALUES ($1, $2) RETURNING id`,
        [req.user.id, goal]
      );

      // Create roadmap
      const { rows: roadmapRows } = await client.query(
        `INSERT INTO roadmaps (goal_id, user_id, title, description, ai_generated)
         VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
        [goalRows[0].id, req.user.id, roadmap.title, roadmap.description]
      );

      // Create steps
      for (let i = 0; i < roadmap.steps.length; i++) {
        const step = roadmap.steps[i];
        await client.query(
          `INSERT INTO roadmap_steps (roadmap_id, title, description, resources, order_index, estimated_days, mini_project)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [roadmapRows[0].id, step.title, step.description,
           step.resources?.join('\n'), i, step.estimated_days, step.mini_project]
        );
      }

      await client.query('COMMIT');
      return created(res, { roadmap_id: roadmapRows[0].id, ...roadmap }, 'Roadmap saved');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return success(res, roadmap);
});

// ── GET /api/ai/roadmaps — user's saved roadmaps ──────────────────────────────
const getRoadmaps = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, cg.title AS goal_title,
            COUNT(rs.id)::int AS total_steps,
            COUNT(rs.id) FILTER (WHERE rs.status = 'completed')::int AS completed_steps
     FROM roadmaps r
     JOIN career_goals cg ON r.goal_id = cg.id
     LEFT JOIN roadmap_steps rs ON r.id = rs.roadmap_id
     WHERE r.user_id = $1
     GROUP BY r.id, cg.title ORDER BY r.created_at DESC`,
    [req.user.id]
  );
  return success(res, rows);
});

// ── GET /api/ai/roadmaps/:id ──────────────────────────────────────────────────
const getRoadmapById = asyncHandler(async (req, res) => {
  const { rows: roadmapRows } = await pool.query(
    `SELECT r.*, cg.title AS goal_title FROM roadmaps r
     JOIN career_goals cg ON r.goal_id = cg.id
     WHERE r.id = $1 AND r.user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!roadmapRows.length) return notFound(res, 'Roadmap not found');

  const { rows: steps } = await pool.query(
    `SELECT * FROM roadmap_steps WHERE roadmap_id = $1 ORDER BY order_index`,
    [req.params.id]
  );

  return success(res, { ...roadmapRows[0], steps });
});

// ── PATCH /api/ai/roadmaps/:roadmapId/steps/:stepId ───────────────────────────
const updateRoadmapStep = asyncHandler(async (req, res) => {
  const { status, completion_pct } = req.body;

  const { rows } = await pool.query(
    `UPDATE roadmap_steps SET
       status = COALESCE($1, status),
       completion_pct = COALESCE($2, completion_pct),
       completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $3 AND roadmap_id IN (SELECT id FROM roadmaps WHERE user_id = $4)
     RETURNING *`,
    [status, completion_pct, req.params.stepId, req.user.id]
  );
  if (!rows.length) return notFound(res, 'Step not found');

  // Recalculate roadmap completion
  await pool.query(
    `UPDATE roadmaps SET completion_pct = (
       SELECT ROUND(AVG(completion_pct))
       FROM roadmap_steps WHERE roadmap_id = $1
     ) WHERE id = $1`,
    [req.params.roadmapId]
  );

  return success(res, rows[0]);
});

// ── POST /api/ai/mock-interview/start ─────────────────────────────────────────
const startInterview = asyncHandler(async (req, res) => {
  const { interview_type = 'hr' } = req.body;

  const firstQuestion = await generateMockInterviewQuestion(interview_type, [], 1);

  const { rows } = await pool.query(
    `INSERT INTO interviews (user_id, interview_type) VALUES ($1, $2) RETURNING id`,
    [req.user.id, interview_type]
  );

  return created(res, {
    interview_id: rows[0].id,
    question_number: 1,
    ...firstQuestion,
  }, 'Interview started');
});

// ── POST /api/ai/mock-interview/:id/answer ────────────────────────────────────
const submitInterviewAnswer = asyncHandler(async (req, res) => {
  const { question, answer, question_number } = req.body;
  if (!question || !answer) return error(res, 'question and answer are required', 400);

  const { rows: intRows } = await pool.query(
    `SELECT * FROM interviews WHERE id = $1 AND user_id = $2 AND completed_at IS NULL`,
    [req.params.id, req.user.id]
  );
  if (!intRows.length) return notFound(res, 'Active interview not found');

  const evaluation = await evaluateInterviewAnswer(question, answer, intRows[0].interview_type);

  // Append to transcript
  await pool.query(
    `UPDATE interviews SET transcript = COALESCE(transcript, '[]')::jsonb || $1::jsonb WHERE id = $2`,
    [JSON.stringify({ question, answer, evaluation }), req.params.id]
  );

  let nextQuestion = null;
  if (question_number < 10) {
    const { rows: transcriptRows } = await pool.query(
      `SELECT transcript FROM interviews WHERE id = $1`, [req.params.id]
    );
    const prevQA = JSON.parse(transcriptRows[0].transcript || '[]');
    nextQuestion = await generateMockInterviewQuestion(
      intRows[0].interview_type, prevQA, question_number + 1
    );
  }

  return success(res, {
    evaluation,
    next_question: nextQuestion,
    question_number: question_number + 1,
    is_complete: question_number >= 10,
  });
});

// ── POST /api/ai/mock-interview/:id/complete ──────────────────────────────────
const completeInterview = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM interviews WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]
  );
  if (!rows.length) return notFound(res, 'Interview not found');

  const transcript = JSON.parse(rows[0].transcript || '[]');
  const scores = transcript.map((t) => t.evaluation?.score || 5);
  const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) : 60;

  const { rows: updated } = await pool.query(
    `UPDATE interviews SET
       overall_score = $1, completed_at = NOW(),
       feedback = 'Interview completed. Review your answers to improve.',
       suggestions = 'Practice STAR method for behavioral questions.'
     WHERE id = $2 RETURNING *`,
    [avgScore, req.params.id]
  );

  return success(res, updated[0], 'Interview completed');
});

// ── GET /api/ai/videos/recommended ───────────────────────────────────────────
const recommendedVideos = asyncHandler(async (req, res) => {
  const { rows: profileRows } = await pool.query(
    `SELECT p.preferred_job_type, ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
     FROM profiles p LEFT JOIN user_skills us ON p.user_id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1 GROUP BY p.id`, [req.user.id]
  );

  const { rows: weakRows } = await pool.query(
    `SELECT weak_areas FROM test_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3`,
    [req.user.id]
  );

  const profile = profileRows[0] || {};
  const weakAreas = [...new Set(weakRows.flatMap((r) => r.weak_areas || []))];
  const jobGoals = profile.preferred_job_type ? [profile.preferred_job_type] : ['software development'];

  // Check DB first for pre-curated videos
  const { rows: dbVideos } = await pool.query(
    `SELECT * FROM videos WHERE is_verified = TRUE ORDER BY created_at DESC LIMIT 10`
  );

  if (dbVideos.length >= 5) {
    return success(res, dbVideos, 'Recommended videos from our library');
  }

  // AI-generated recommendations (search queries, not fake URLs)
  const aiRecs = await recommendVideos(weakAreas, jobGoals, []);
  return success(res, aiRecs, 'AI-recommended video topics');
});

// ── POST /api/ai/daily-plan ───────────────────────────────────────────────────
const getDailyPlan = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Check if plan already exists for today
  const { rows: existingRows } = await pool.query(
    `SELECT * FROM daily_plans WHERE user_id = $1 AND plan_date = $2`, [req.user.id, today]
  );
  if (existingRows.length) return success(res, existingRows[0], 'Today\'s plan');

  const { rows: profileRows } = await pool.query(
    `SELECT p.experience_level, ARRAY_AGG(DISTINCT s.name) AS skills
     FROM profiles p LEFT JOIN user_skills us ON p.user_id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE p.user_id = $1 GROUP BY p.id`, [req.user.id]
  );
  const { rows: weakRows } = await pool.query(
    `SELECT weak_areas FROM test_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [req.user.id]
  );

  const profile = profileRows[0] || {};
  const weakAreas = weakRows[0]?.weak_areas || [];

  const plan = await generateDailyPlan(profile, weakAreas, []);

  const { rows: saved } = await pool.query(
    `INSERT INTO daily_plans (user_id, plan_date, tasks, ai_generated)
     VALUES ($1, $2, $3, TRUE) RETURNING *`,
    [req.user.id, today, JSON.stringify(plan.tasks)]
  );

  return success(res, saved[0], 'Daily plan generated');
});

// ── PUT /api/ai/daily-plan/task/:idx ─────────────────────────────────────────
const updateDailyTask = asyncHandler(async (req, res) => {
  const { completed } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const taskIdx = parseInt(req.params.idx);

  const { rows } = await pool.query(
    `SELECT * FROM daily_plans WHERE user_id = $1 AND plan_date = $2`, [req.user.id, today]
  );
  if (!rows.length) return notFound(res, 'No plan for today');

  const tasks = rows[0].tasks;
  if (taskIdx >= tasks.length) return error(res, 'Invalid task index', 400);
  tasks[taskIdx].completed = completed;

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPct = Math.round((completedCount / tasks.length) * 100);

  const { rows: updated } = await pool.query(
    `UPDATE daily_plans SET tasks = $1, completion_pct = $2 WHERE user_id = $3 AND plan_date = $4 RETURNING *`,
    [JSON.stringify(tasks), completionPct, req.user.id, today]
  );

  return success(res, updated[0]);
});

// ── POST /api/ai/career-comparison ───────────────────────────────────────────
const careerComparison = asyncHandler(async (req, res) => {
  const { careers } = req.body;
  if (!Array.isArray(careers) || careers.length < 2) {
    return error(res, 'Provide at least 2 careers to compare', 400);
  }

  const result = await compareCareerPaths(careers.slice(0, 4));

  await pool.query(
    `INSERT INTO career_comparisons (user_id, careers, result) VALUES ($1, $2, $3)`,
    [req.user.id, careers, JSON.stringify(result)]
  );

  return success(res, result);
});

module.exports = {
  chat, getConversations, getMessages, jobMatch, skillGap,
  resumeAnalysis, careerRoadmap, getRoadmaps, getRoadmapById, updateRoadmapStep,
  startInterview, submitInterviewAnswer, completeInterview,
  recommendedVideos, getDailyPlan, updateDailyTask, careerComparison,
};
