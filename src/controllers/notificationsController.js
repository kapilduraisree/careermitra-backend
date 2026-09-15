const pool = require('../config/database');
const { success, notFound } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/pagination');

// ── GET /api/notifications ────────────────────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { type, unread_only } = req.query;

  const conditions = [`user_id = $1`];
  const params = [req.user.id];

  if (type)        { params.push(type);  conditions.push(`type = $${params.length}`); }
  if (unread_only === 'true') conditions.push(`is_read = FALSE`);

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM notifications ${where}`, params),
    pool.query(`SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    ),
  ]);

  // Also get unread count
  const { rows: unreadRows } = await pool.query(
    `SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [req.user.id]
  );

  return success(res, {
    notifications: dataRes.rows,
    total: parseInt(countRes.rows[0].count),
    unread_count: unreadRows[0].unread,
  });
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
const markRead = asyncHandler(async (req, res) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  return success(res, {}, 'Notification marked as read');
});

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
const markAllRead = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING id`,
    [req.user.id]
  );
  return success(res, { updated: rows.length }, 'All notifications marked as read');
});

// ── GET /api/notifications/preferences ───────────────────────────────────────
const getPreferences = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM notification_preferences WHERE user_id = $1`, [req.user.id]
  );
  if (!rows.length) {
    await pool.query(`INSERT INTO notification_preferences (user_id) VALUES ($1)`, [req.user.id]);
    const { rows: created } = await pool.query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`, [req.user.id]
    );
    return success(res, created[0]);
  }
  return success(res, rows[0]);
});

// ── PUT /api/notifications/preferences ───────────────────────────────────────
const updatePreferences = asyncHandler(async (req, res) => {
  const {
    job_alerts, exam_alerts, deadlines, study_reminder,
    interview, learning, push_enabled, email_enabled, fcm_token,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE notification_preferences SET
       job_alerts     = COALESCE($1, job_alerts),
       exam_alerts    = COALESCE($2, exam_alerts),
       deadlines      = COALESCE($3, deadlines),
       study_reminder = COALESCE($4, study_reminder),
       interview      = COALESCE($5, interview),
       learning       = COALESCE($6, learning),
       push_enabled   = COALESCE($7, push_enabled),
       email_enabled  = COALESCE($8, email_enabled),
       fcm_token      = COALESCE($9, fcm_token)
     WHERE user_id = $10
     RETURNING *`,
    [job_alerts, exam_alerts, deadlines, study_reminder,
     interview, learning, push_enabled, email_enabled, fcm_token, req.user.id]
  );
  if (!rows.length) return notFound(res, 'Preferences not found');
  return success(res, rows[0], 'Preferences updated');
});

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
const deleteNotification = asyncHandler(async (req, res) => {
  await pool.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]
  );
  return success(res, {}, 'Notification deleted');
});

module.exports = { getNotifications, markRead, markAllRead, getPreferences, updatePreferences, deleteNotification };
