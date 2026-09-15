const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { success, created, error, unauthorized } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// ── Register ──────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone,
    qualification, graduation_year, experience_level,
    preferred_job_type, preferred_location, skills = [],
  } = req.body;

  // Check for existing email
  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.length) {
    return error(res, 'Email already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create user
    const { rows: users } = await client.query(
      `INSERT INTO users (name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, password_hash, phone || null]
    );
    const user = users[0];

    // Create profile
    await client.query(
      `INSERT INTO profiles (user_id, qualification, graduation_year, experience_level, preferred_job_type, preferred_location)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, qualification || null, graduation_year || null,
       experience_level || 'fresher', preferred_job_type || null, preferred_location || null]
    );

    // Create user_stats row
    await client.query('INSERT INTO user_stats (user_id) VALUES ($1)', [user.id]);

    // Create notification preferences
    await client.query('INSERT INTO notification_preferences (user_id) VALUES ($1)', [user.id]);

    // Add skills if provided
    if (skills.length) {
      for (const skillName of skills) {
        // Upsert skill
        const { rows: skillRows } = await client.query(
          `INSERT INTO skills (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
          [skillName.trim()]
        );
        const skillId = skillRows[0].id;
        await client.query(
          `INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2)
           ON CONFLICT (user_id, skill_id) DO NOTHING`,
          [user.id, skillId]
        );
      }
    }

    await client.query('COMMIT');

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    return created(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    }, 'Registration successful! Welcome to CareerMitra AI.');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.is_active, u.avatar_url,
            p.qualification, p.experience_level, p.preferred_job_type, p.preferred_location,
            p.career_readiness, p.language_preference
     FROM users u LEFT JOIN profiles p ON u.id = p.user_id
     WHERE u.email = $1`,
    [email]
  );

  if (!rows.length) {
    return unauthorized(res, 'Invalid email or password');
  }

  const user = rows[0];

  if (!user.is_active) {
    return unauthorized(res, 'Account has been deactivated. Contact support.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return unauthorized(res, 'Invalid email or password');
  }

  // Update last login
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  const { password_hash, ...safeUser } = user;

  return success(res, { user: safeUser, accessToken, refreshToken }, 'Login successful');
});

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return error(res, 'Refresh token required', 401);

  const { verifyRefreshToken } = require('../utils/jwt');
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return error(res, 'Invalid or expired refresh token', 401);
  }

  const { rows } = await pool.query('SELECT id, role FROM users WHERE id = $1 AND is_active = TRUE', [decoded.userId]);
  if (!rows.length) return error(res, 'User not found', 401);

  const accessToken = generateAccessToken(rows[0].id, rows[0].role);
  return success(res, { accessToken }, 'Token refreshed');
});

// ── Get Current User ──────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar_url, u.last_login, u.created_at,
            p.qualification, p.graduation_year, p.experience_level,
            p.preferred_job_type, p.preferred_location, p.bio,
            p.github_url, p.linkedin_url, p.portfolio_url,
            p.career_readiness, p.language_preference,
            COALESCE(
              json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'category', s.category))
              FILTER (WHERE s.id IS NOT NULL), '[]'
            ) AS skills
     FROM users u
     LEFT JOIN profiles p ON u.id = p.user_id
     LEFT JOIN user_skills us ON u.id = us.user_id
     LEFT JOIN skills s ON us.skill_id = s.id
     WHERE u.id = $1
     GROUP BY u.id, p.qualification, p.graduation_year, p.experience_level,
              p.preferred_job_type, p.preferred_location, p.bio,
              p.github_url, p.linkedin_url, p.portfolio_url,
              p.career_readiness, p.language_preference`,
    [req.user.id]
  );

  if (!rows.length) return error(res, 'User not found', 404);
  return success(res, rows[0]);
});

// ── Change Password ───────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) return error(res, 'Current password is incorrect', 400);

  const newHash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

  return success(res, {}, 'Password changed successfully');
});

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client discards tokens. Log the event.
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [req.user.id]);
  return success(res, {}, 'Logged out successfully');
});

module.exports = { register, login, refreshToken, getMe, changePassword, logout };
