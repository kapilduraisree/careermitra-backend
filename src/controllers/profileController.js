const pool = require('../config/database');
const { success, error, notFound, created } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { calculateCareerReadiness } = require('../utils/careerReadiness');

// ── GET /api/users/profile ────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.created_at,
            p.*,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object(
                'id', s.id, 'name', s.name, 'category', s.category, 'proficiency', us.proficiency
              )) FILTER (WHERE s.id IS NOT NULL), '[]'
            ) AS skills,
            st.xp_total, st.current_streak, st.longest_streak,
            st.questions_done, st.tests_done, st.jobs_applied, st.videos_watched
     FROM users u
     LEFT JOIN profiles p ON u.id = p.user_id
     LEFT JOIN user_skills us ON u.id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     LEFT JOIN user_stats st ON u.id = st.user_id
     WHERE u.id = $1
     GROUP BY u.id, p.id, st.id`,
    [req.user.id]
  );
  if (!rows.length) return notFound(res, 'Profile not found');
  return success(res, rows[0]);
});

// ── PUT /api/users/profile ────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name, phone, bio, qualification, graduation_year,
    experience_level, preferred_job_type, preferred_location,
    github_url, linkedin_url, portfolio_url, language_preference,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (name || phone) {
      await client.query(
        `UPDATE users SET
           name = COALESCE($1, name),
           phone = COALESCE($2, phone)
         WHERE id = $3`,
        [name, phone, req.user.id]
      );
    }

    await client.query(
      `UPDATE profiles SET
         bio = COALESCE($1, bio),
         qualification = COALESCE($2, qualification),
         graduation_year = COALESCE($3, graduation_year),
         experience_level = COALESCE($4, experience_level),
         preferred_job_type = COALESCE($5, preferred_job_type),
         preferred_location = COALESCE($6, preferred_location),
         github_url = COALESCE($7, github_url),
         linkedin_url = COALESCE($8, linkedin_url),
         portfolio_url = COALESCE($9, portfolio_url),
         language_preference = COALESCE($10, language_preference)
       WHERE user_id = $11`,
      [bio, qualification, graduation_year, experience_level,
       preferred_job_type, preferred_location, github_url, linkedin_url,
       portfolio_url, language_preference, req.user.id]
    );

    // Recalculate career readiness
    const readiness = await calculateCareerReadiness(req.user.id, client);
    await client.query(
      `UPDATE profiles SET career_readiness = $1 WHERE user_id = $2`, [readiness, req.user.id]
    );

    await client.query('COMMIT');
    return success(res, { career_readiness: readiness }, 'Profile updated successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ── POST /api/users/skills ────────────────────────────────────────────────────
const addSkill = asyncHandler(async (req, res) => {
  const { skill_name, proficiency = 1 } = req.body;
  if (!skill_name) return error(res, 'skill_name is required', 400);

  const { rows: skillRows } = await pool.query(
    `INSERT INTO skills (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [skill_name.trim()]
  );

  await pool.query(
    `INSERT INTO user_skills (user_id, skill_id, proficiency)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, skill_id) DO UPDATE SET proficiency = $3`,
    [req.user.id, skillRows[0].id, proficiency]
  );

  return created(res, { skill_id: skillRows[0].id, skill_name, proficiency }, 'Skill added');
});

// ── DELETE /api/users/skills/:skillId ─────────────────────────────────────────
const removeSkill = asyncHandler(async (req, res) => {
  await pool.query(
    `DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2`,
    [req.user.id, req.params.skillId]
  );
  return success(res, {}, 'Skill removed');
});

// ── GET /api/users/progress ───────────────────────────────────────────────────
const getProgress = asyncHandler(async (req, res) => {
  const [profileRes, statsRes, achievRes, testRes, roadmapRes] = await Promise.all([
    pool.query(`SELECT career_readiness FROM profiles WHERE user_id = $1`, [req.user.id]),
    pool.query(`SELECT * FROM user_stats WHERE user_id = $1`, [req.user.id]),
    pool.query(
      `SELECT ua.earned_at, a.title, a.description, a.icon, a.xp_value
       FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = $1 ORDER BY ua.earned_at DESC`, [req.user.id]
    ),
    pool.query(
      `SELECT score, total_marks, accuracy, created_at FROM test_attempts
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [req.user.id]
    ),
    pool.query(
      `SELECT r.title, r.completion_pct FROM roadmaps r WHERE r.user_id = $1`, [req.user.id]
    ),
  ]);

  const readiness = calculateCareerReadiness(req.user.id, pool);

  return success(res, {
    career_readiness: profileRes.rows[0]?.career_readiness || 0,
    stats: statsRes.rows[0] || {},
    achievements: achievRes.rows,
    recent_tests: testRes.rows,
    roadmaps: roadmapRes.rows,
  });
});

// ── POST /api/users/avatar ────────────────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 'Avatar image is required', 400);
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await pool.query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, req.user.id]);
  return success(res, { avatar_url: avatarUrl }, 'Avatar updated');
});

// ── GET /api/users/achievements ───────────────────────────────────────────────
const getAchievements = asyncHandler(async (req, res) => {
  const [allRes, userRes] = await Promise.all([
    pool.query(`SELECT * FROM achievements ORDER BY category, xp_value`),
    pool.query(`SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1`, [req.user.id]),
  ]);

  const earned = new Set(userRes.rows.map((r) => r.achievement_id));
  const achievements = allRes.rows.map((a) => ({
    ...a,
    earned: earned.has(a.id),
    earned_at: userRes.rows.find((u) => u.achievement_id === a.id)?.earned_at || null,
  }));

  return success(res, achievements);
});

module.exports = { getProfile, updateProfile, addSkill, removeSkill, getProgress, uploadAvatar, getAchievements };
