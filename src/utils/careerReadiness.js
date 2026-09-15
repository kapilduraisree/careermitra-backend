/**
 * Calculate career readiness percentage for a user
 * Weights: skills 25%, resume 20%, mock tests 20%, interview 15%, learning 20%
 */
const calculateCareerReadiness = async (userId, pool) => {
  let score = 0;

  // Skills: max 25 — 5 points per skill, cap at 5 skills
  const { rows: skills } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM user_skills WHERE user_id = $1', [userId]
  );
  const skillCount = parseInt(skills[0].cnt);
  score += Math.min(25, skillCount * 5);

  // Resume: 20 points if resume uploaded and analyzed
  const { rows: resumes } = await pool.query(
    'SELECT ats_score FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]
  );
  if (resumes.length) {
    const ats = resumes[0].ats_score || 0;
    score += Math.round((ats / 100) * 20);
  }

  // Mock tests: max 20 — average accuracy across last 5 tests
  const { rows: tests } = await pool.query(
    'SELECT accuracy FROM test_attempts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]
  );
  if (tests.length) {
    const avg = tests.reduce((sum, t) => sum + parseFloat(t.accuracy || 0), 0) / tests.length;
    score += Math.round((avg / 100) * 20);
  }

  // Interview: 15 points if at least one interview completed
  const { rows: interviews } = await pool.query(
    'SELECT overall_score FROM interviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]
  );
  if (interviews.length) {
    score += Math.round(((interviews[0].overall_score || 0) / 100) * 15);
  }

  // Learning (videos + roadmap): max 20
  const { rows: vids } = await pool.query(
    'SELECT COUNT(*) AS cnt FROM user_stats WHERE user_id = $1', [userId]
  );
  const { rows: stats } = await pool.query(
    'SELECT videos_watched FROM user_stats WHERE user_id = $1', [userId]
  );
  if (stats.length) {
    score += Math.min(20, Math.round((stats[0].videos_watched || 0) * 2));
  }

  return Math.min(100, Math.round(score));
};

module.exports = { calculateCareerReadiness };
