const { query, queryOne, execute } = require('../config/database');
const { success, error } = require('../utils/response');

// ─── GET /api/reviews?lawyerId=X ─────────────────────────────
async function getReviews(req, res, next) {
  try {
    const { lawyerId } = req.query;
    if (!lawyerId) return error(res, 'lawyerId is required', 400);

    const reviews = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.first_name, u.last_name, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       WHERE r.lawyer_id = ? AND r.is_visible = 1
       ORDER BY r.created_at DESC`,
      [lawyerId]
    );

    return success(res, { reviews });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/reviews ────────────────────────────────────────
async function createReview(req, res, next) {
  try {
    const { lawyerId, bookingId, rating, comment } = req.body;
    const clientId = req.user.userId;

    // Verify booking is completed and belongs to this client
    const booking = await queryOne(
      `SELECT id FROM bookings
       WHERE id = ? AND client_id = ? AND lawyer_id = ? AND status = 'completed'`,
      [bookingId, clientId, lawyerId]
    );
    if (!booking) return error(res, 'You can only review a completed consultation', 403);

    // No duplicate reviews
    const existing = await queryOne('SELECT id FROM reviews WHERE booking_id = ?', [bookingId]);
    if (existing) return error(res, 'You have already reviewed this consultation', 409);

    await execute(
      'INSERT INTO reviews (client_id, lawyer_id, booking_id, rating, comment) VALUES (?,?,?,?,?)',
      [clientId, lawyerId, bookingId, Number(rating), comment.trim()]
    );

    // Recalculate lawyer average rating
    await execute(
      `UPDATE lawyers
       SET avg_rating    = (SELECT AVG(rating)  FROM reviews WHERE lawyer_id = ? AND is_visible = 1),
           total_reviews = (SELECT COUNT(*)     FROM reviews WHERE lawyer_id = ? AND is_visible = 1)
       WHERE id = ?`,
      [lawyerId, lawyerId, lawyerId]
    );

    return success(res, { message: 'Review submitted successfully' }, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviews, createReview };
