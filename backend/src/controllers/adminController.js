const { query, queryOne, execute } = require('../config/database');
const { success, error } = require('../utils/response');

async function logAction(adminId, action, targetType, targetId, ip) {
  await execute(
    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, ip_address) VALUES (?,?,?,?,?)',
    [adminId, action, targetType, targetId, ip]
  );
}

// ─── GET /api/admin/stats ─────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [users]    = await query('SELECT COUNT(*) AS v FROM users');
    const [lawyers]  = await query("SELECT COUNT(*) AS v FROM lawyers WHERE approval_status = 'approved'");
    const [pending]  = await query("SELECT COUNT(*) AS v FROM lawyers WHERE approval_status = 'pending'");
    const [bookings] = await query('SELECT COUNT(*) AS v FROM bookings');
    const [reviews]  = await query('SELECT COUNT(*) AS v FROM reviews');

    return success(res, {
      stats: {
        totalUsers:     users.v,
        activeLawyers:  lawyers.v,
        pendingLawyers: pending.v,
        totalBookings:  bookings.v,
        totalReviews:   reviews.v,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/pending-lawyers ──────────────────────────
async function getPendingLawyers(req, res, next) {
  try {
    const lawyers = await query(
      `SELECT l.id, l.bar_license_number, l.bar_state, l.law_firm,
              l.years_experience, l.consultation_fee, l.created_at,
              u.first_name, u.last_name, u.email, u.phone,
              GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS specializations
       FROM lawyers l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN lawyer_specializations ls ON ls.lawyer_id = l.id
       LEFT JOIN specializations s         ON s.id = ls.specialization_id
       WHERE l.approval_status = 'pending'
       GROUP BY l.id
       ORDER BY l.created_at DESC`
    );
    return success(res, { lawyers });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/lawyers/:id/approve ────────────────────
async function approveLawyer(req, res, next) {
  try {
    const { id } = req.params;
    await execute(
      `UPDATE lawyers SET approval_status = 'approved', approved_at = NOW(), approved_by = ? WHERE id = ?`,
      [req.user.userId, id]
    );
    await execute(
      `INSERT INTO notifications (user_id, type, title, body)
       SELECT user_id, 'lawyer_approved', 'Application Approved!',
       'Congratulations! Your lawyer profile has been approved.'
       FROM lawyers WHERE id = ?`,
      [id]
    );
    await logAction(req.user.userId, 'approve_lawyer', 'lawyer', id, req.ip);
    return success(res, { message: 'Lawyer approved' });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/lawyers/:id/reject ─────────────────────
async function rejectLawyer(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await execute(
      `UPDATE lawyers SET approval_status = 'rejected', rejection_reason = ? WHERE id = ?`,
      [reason || 'Does not meet requirements', id]
    );
    await logAction(req.user.userId, 'reject_lawyer', 'lawyer', id, req.ip);
    return success(res, { message: 'Lawyer rejected' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/users ─────────────────────────────────────
async function getUsers(req, res, next) {
  try {
    const users = await query(
      'SELECT id, email, role, first_name, last_name, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 200'
    );
    return success(res, { users });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/users/:id/toggle ───────────────────────
async function toggleUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await queryOne('SELECT role, is_active FROM users WHERE id = ?', [id]);
    if (!user) return error(res, 'User not found', 404);
    if (user.role === 'admin') return error(res, 'Cannot modify admin accounts', 403);
    await execute('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
    await logAction(req.user.userId, 'toggle_user', 'user', id, req.ip);
    return success(res, { message: 'User status updated' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/reviews ───────────────────────────────────
async function getReviews(req, res, next) {
  try {
    const reviews = await query(
      `SELECT r.*,
              cu.first_name AS client_first, cu.last_name AS client_last,
              lu.first_name AS lawyer_first, lu.last_name AS lawyer_last
       FROM reviews r
       JOIN users cu  ON cu.id = r.client_id
       JOIN lawyers l ON l.id = r.lawyer_id
       JOIN users lu  ON lu.id = l.user_id
       ORDER BY r.created_at DESC LIMIT 200`
    );
    return success(res, { reviews });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/reviews/:id/toggle ─────────────────────
async function toggleReview(req, res, next) {
  try {
    const { id } = req.params;
    const review = await queryOne('SELECT lawyer_id, is_visible FROM reviews WHERE id = ?', [id]);
    if (!review) return error(res, 'Review not found', 404);

    await execute('UPDATE reviews SET is_visible = NOT is_visible WHERE id = ?', [id]);

    // Recalculate lawyer rating
    await execute(
      `UPDATE lawyers
       SET avg_rating    = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE lawyer_id = ? AND is_visible = 1),
           total_reviews = (SELECT COUNT(*) FROM reviews WHERE lawyer_id = ? AND is_visible = 1)
       WHERE id = ?`,
      [review.lawyer_id, review.lawyer_id, review.lawyer_id]
    );

    await logAction(req.user.userId, 'toggle_review', 'review', id, req.ip);
    return success(res, { message: 'Review visibility updated' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/logs ──────────────────────────────────────
async function getLogs(req, res, next) {
  try {
    const logs = await query(
      `SELECT al.*, u.first_name, u.last_name
       FROM admin_logs al JOIN users u ON u.id = al.admin_id
       ORDER BY al.created_at DESC LIMIT 100`
    );
    return success(res, { logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats, getPendingLawyers, approveLawyer, rejectLawyer,
  getUsers, toggleUser, getReviews, toggleReview, getLogs,
};
