const { query, queryOne, execute } = require('../config/database');
const { success, error } = require('../utils/response');

// ─── GET /api/messages — inbox / conversation ─────────────────
async function getMessages(req, res, next) {
  try {
    const { userId } = req.user;
    const withUserId = req.query.with;

    if (withUserId) {
      // Thread between two users
      const messages = await query(
        `SELECT m.*,
                su.first_name AS sender_first, su.last_name AS sender_last, su.avatar_url AS sender_avatar,
                ru.first_name AS recipient_first, ru.last_name AS recipient_last
         FROM messages m
         JOIN users su ON su.id = m.sender_id
         JOIN users ru ON ru.id = m.recipient_id
         WHERE (m.sender_id = ? AND m.recipient_id = ?)
            OR (m.sender_id = ? AND m.recipient_id = ?)
         ORDER BY m.created_at ASC`,
        [userId, withUserId, withUserId, userId]
      );

      // Mark received messages as read
      await execute(
        `UPDATE messages SET is_read = 1, read_at = NOW()
         WHERE recipient_id = ? AND sender_id = ? AND is_read = 0`,
        [userId, withUserId]
      );

      return success(res, { messages });
    }

    // Conversation list (inbox)
    const conversations = await query(
      `SELECT
         other_u.id   AS user_id,
         other_u.first_name, other_u.last_name,
         other_u.avatar_url, other_u.role,
         lm.content   AS last_message,
         lm.created_at AS last_message_at,
         SUM(CASE WHEN m.recipient_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
       FROM messages m
       JOIN users other_u ON other_u.id = IF(m.sender_id = ?, m.recipient_id, m.sender_id)
       JOIN (
         SELECT LEAST(sender_id, recipient_id) u1, GREATEST(sender_id, recipient_id) u2,
                content, created_at,
                ROW_NUMBER() OVER (
                  PARTITION BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)
                  ORDER BY created_at DESC
                ) AS rn
         FROM messages
       ) lm ON lm.u1 = LEAST(m.sender_id, m.recipient_id)
           AND lm.u2 = GREATEST(m.sender_id, m.recipient_id)
           AND lm.rn  = 1
       WHERE m.sender_id = ? OR m.recipient_id = ?
       GROUP BY other_u.id, lm.content, lm.created_at
       ORDER BY lm.created_at DESC`,
      [userId, userId, userId, userId]
    );

    return success(res, { conversations });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/messages ───────────────────────────────────────
async function sendMessage(req, res, next) {
  try {
    const { recipientId, content } = req.body;
    const { userId } = req.user;

    if (Number(recipientId) === userId) {
      return error(res, 'Cannot send message to yourself', 400);
    }

    const recipient = await queryOne(
      'SELECT id, role FROM users WHERE id = ? AND is_active = 1',
      [recipientId]
    );
    if (!recipient) return error(res, 'Recipient not found', 404);

    const result = await execute(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
      [userId, recipientId, content]
    );

    // Notification
    await execute(
      'INSERT INTO notifications (user_id, type, title, body) VALUES (?, ?, ?, ?)',
      [recipientId, 'new_message', 'New Message', 'You have a new message']
    );

    return success(res, { messageId: result.insertId }, 201);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/messages/unread-count ──────────────────────────
async function getUnreadCount(req, res, next) {
  try {
    const row = await queryOne(
      'SELECT COUNT(*) AS count FROM messages WHERE recipient_id = ? AND is_read = 0',
      [req.user.userId]
    );
    return success(res, { count: row?.count || 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMessages, sendMessage, getUnreadCount };
