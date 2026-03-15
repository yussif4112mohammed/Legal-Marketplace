const { query, queryOne, execute } = require('../config/database');
const { success, error } = require('../utils/response');

// ─── GET /api/bookings ────────────────────────────────────────
async function getBookings(req, res, next) {
  try {
    const { role, userId } = req.user;
    let bookings;

    if (role === 'client') {
      bookings = await query(
        `SELECT b.id, b.scheduled_at, b.duration_minutes, b.status, b.fee_charged,
                b.notes, b.meeting_url, b.created_at,
                u.first_name AS lawyer_first, u.last_name AS lawyer_last,
                u.avatar_url AS lawyer_avatar, l.law_firm, l.consultation_fee, l.id AS lawyer_id,
                GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS specializations
         FROM bookings b
         JOIN lawyers l ON l.id = b.lawyer_id
         JOIN users u   ON u.id = l.user_id
         LEFT JOIN lawyer_specializations ls ON ls.lawyer_id = l.id
         LEFT JOIN specializations s         ON s.id = ls.specialization_id
         WHERE b.client_id = ?
         GROUP BY b.id
         ORDER BY b.scheduled_at DESC`,
        [userId]
      );
    } else if (role === 'lawyer') {
      const lawyer = await queryOne('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
      if (!lawyer) return error(res, 'Lawyer profile not found', 404);
      bookings = await query(
        `SELECT b.id, b.scheduled_at, b.duration_minutes, b.status, b.fee_charged,
                b.notes, b.lawyer_notes, b.meeting_url, b.created_at,
                u.first_name AS client_first, u.last_name AS client_last,
                u.avatar_url AS client_avatar, u.email AS client_email, u.phone AS client_phone
         FROM bookings b
         JOIN users u ON u.id = b.client_id
         WHERE b.lawyer_id = ?
         ORDER BY b.scheduled_at DESC`,
        [lawyer.id]
      );
    } else {
      // admin — all bookings
      bookings = await query(
        `SELECT b.*,
                cu.first_name AS client_first, cu.last_name AS client_last,
                lu.first_name AS lawyer_first, lu.last_name AS lawyer_last
         FROM bookings b
         JOIN users cu ON cu.id = b.client_id
         JOIN lawyers l ON l.id = b.lawyer_id
         JOIN users lu  ON lu.id = l.user_id
         ORDER BY b.created_at DESC LIMIT 200`
      );
    }

    return success(res, { bookings });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/bookings ───────────────────────────────────────
async function createBooking(req, res, next) {
  try {
    const { lawyerId, scheduledAt, durationMinutes, notes } = req.body;
    const clientId = req.user.userId;

    const lawyer = await queryOne(
      'SELECT id, consultation_fee, approval_status FROM lawyers WHERE id = ?',
      [lawyerId]
    );
    if (!lawyer || lawyer.approval_status !== 'approved') {
      return error(res, 'Lawyer not available', 404);
    }

    const result = await execute(
      `INSERT INTO bookings (client_id, lawyer_id, scheduled_at, duration_minutes, fee_charged, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [clientId, lawyerId, scheduledAt, Number(durationMinutes), lawyer.consultation_fee, notes || null]
    );

    // Notify lawyer
    await execute(
      `INSERT INTO notifications (user_id, type, title, body)
       SELECT l.user_id, 'new_booking', 'New Consultation Request',
              'A client has requested a consultation with you.'
       FROM lawyers l WHERE l.id = ?`,
      [lawyerId]
    );

    return success(res, { bookingId: result.insertId, message: 'Booking request sent' }, 201);
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/bookings/:id ──────────────────────────────────
async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { status, lawyerNotes, meetingUrl, cancellationReason } = req.body;
    const { role, userId } = req.user;

    const booking = await queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return error(res, 'Booking not found', 404);

    if (role === 'lawyer') {
      const lawyer = await queryOne('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
      if (booking.lawyer_id !== lawyer?.id) return error(res, 'Forbidden', 403);

      await execute(
        `UPDATE bookings SET status = ?, lawyer_notes = ?, meeting_url = ? WHERE id = ?`,
        [status || booking.status, lawyerNotes || booking.lawyer_notes, meetingUrl || booking.meeting_url, id]
      );
    } else if (role === 'client') {
      if (booking.client_id !== userId) return error(res, 'Forbidden', 403);
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return error(res, 'Booking cannot be cancelled at this stage', 400);
      }
      await execute(
        `UPDATE bookings SET status = 'cancelled', cancelled_by = ?, cancellation_reason = ? WHERE id = ?`,
        [userId, cancellationReason || null, id]
      );
    } else if (role === 'admin') {
      await execute('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    }

    return success(res, { message: 'Booking updated' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/bookings/:id ────────────────────────────────────
async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await queryOne(
      `SELECT b.*,
              cu.first_name AS client_first, cu.last_name AS client_last, cu.email AS client_email,
              lu.first_name AS lawyer_first, lu.last_name AS lawyer_last,
              l.law_firm, l.consultation_fee
       FROM bookings b
       JOIN users cu  ON cu.id = b.client_id
       JOIN lawyers l ON l.id = b.lawyer_id
       JOIN users lu  ON lu.id = l.user_id
       WHERE b.id = ?`,
      [id]
    );
    if (!booking) return error(res, 'Booking not found', 404);

    const { role, userId } = req.user;
    if (role === 'client' && booking.client_id !== userId) return error(res, 'Forbidden', 403);
    if (role === 'lawyer') {
      const lawyer = await queryOne('SELECT id FROM lawyers WHERE user_id = ?', [userId]);
      if (booking.lawyer_id !== lawyer?.id) return error(res, 'Forbidden', 403);
    }

    return success(res, { booking });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBookings, createBooking, updateBooking, getBookingById };
