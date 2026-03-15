const bcrypt = require('bcryptjs');
const { query, queryOne, execute } = require('../config/database');
const { signToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

// ─── POST /api/auth/register ─────────────────────────────────
async function register(req, res, next) {
  try {
    const {
      role = 'client', email, password,
      firstName, lastName, phone,
      // lawyer-specific
      barLicenseNumber, barState, lawFirm,
      yearsExperience, bio, consultationFee,
      specializations = [], practiceStates = [],
    } = req.body;

    // Check duplicate email
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return error(res, 'Email already in use', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await execute(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, role, firstName, lastName, phone || null]
    );
    const userId = result.insertId;

    if (role === 'client') {
      await execute('INSERT INTO clients (user_id) VALUES (?)', [userId]);
    }

    if (role === 'lawyer') {
      const lawyerResult = await execute(
        `INSERT INTO lawyers
         (user_id, bar_license_number, bar_state, law_firm, years_experience, bio, consultation_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, barLicenseNumber, barState, lawFirm || null,
         Number(yearsExperience) || 0, bio || null, Number(consultationFee) || 0]
      );
      const lawyerId = lawyerResult.insertId;

      for (const specId of specializations) {
        await execute(
          'INSERT IGNORE INTO lawyer_specializations (lawyer_id, specialization_id) VALUES (?, ?)',
          [lawyerId, specId]
        );
      }
      for (const state of practiceStates) {
        await execute(
          'INSERT IGNORE INTO lawyer_practice_states (lawyer_id, state) VALUES (?, ?)',
          [lawyerId, state]
        );
      }
    }

    const token = signToken({ userId, email, role });

    return success(res, {
      message: role === 'lawyer'
        ? 'Application submitted. You will be notified once approved.'
        : 'Account created successfully',
      token,
      user: { id: userId, email, role, firstName, lastName },
    }, 201);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await queryOne(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user) return error(res, 'Invalid email or password', 401);
    if (!user.is_active) return error(res, 'Account suspended. Contact support.', 403);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return error(res, 'Invalid email or password', 401);

    // Lawyers must be approved
    if (user.role === 'lawyer') {
      const lawyer = await queryOne(
        'SELECT approval_status FROM lawyers WHERE user_id = ?', [user.id]
      );
      if (lawyer?.approval_status === 'pending') {
        return error(res, 'Your application is pending review. You will be notified once approved.', 403);
      }
      if (lawyer?.approval_status === 'rejected') {
        return error(res, 'Your application was not approved.', 403);
      }
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return success(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────
async function me(req, res, next) {
  try {
    const user = await queryOne(
      'SELECT id, email, role, first_name, last_name, phone, avatar_url, created_at FROM users WHERE id = ? AND is_active = 1',
      [req.user.userId]
    );
    if (!user) return error(res, 'User not found', 404);

    return success(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/change-password ──────────────────────────
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.userId]);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return error(res, 'Current password is incorrect', 400);

    const newHash = await bcrypt.hash(newPassword, 12);
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.userId]);
    return success(res, { message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, changePassword };
