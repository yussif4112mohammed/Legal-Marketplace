const { execute } = require('../config/database');

/**
 * Logs an action into the activity log (table is named admin_logs for
 * historical reasons, but it now records general user activity too —
 * logins, registrations, and admin moderation actions alike).
 */
async function logAction(userId, action, targetType, targetId, ip) {
  try {
    await execute(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, ip_address) VALUES (?,?,?,?,?)',
      [userId, action, targetType || null, targetId || null, ip || null]
    );
  } catch (err) {
    // Activity logging should never break the actual request it's attached to.
    console.error('Activity log failed:', err.message);
  }
}

module.exports = { logAction };
