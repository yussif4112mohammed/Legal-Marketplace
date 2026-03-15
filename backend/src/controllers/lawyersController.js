const { query, queryOne, execute } = require('../config/database');
const { success, error, paginated } = require('../utils/response');

// ─── GET /api/lawyers ─────────────────────────────────────────
async function searchLawyers(req, res, next) {
  try {
    const {
      state, city, specialization, minPrice, maxPrice,
      minRating, q, page = 1, limit = 12,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where  = ["l.approval_status = 'approved'", 'u.is_active = 1'];
    const params = [];

    if (state) {
      where.push('EXISTS (SELECT 1 FROM lawyer_practice_states lps WHERE lps.lawyer_id = l.id AND lps.state = ?)');
      params.push(state);
    }
    if (city) {
      where.push('l.city LIKE ?');
      params.push(`%${city}%`);
    }
    if (specialization) {
      where.push('EXISTS (SELECT 1 FROM lawyer_specializations ls WHERE ls.lawyer_id = l.id AND ls.specialization_id = ?)');
      params.push(Number(specialization));
    }
    if (minPrice !== undefined) { where.push('l.consultation_fee >= ?'); params.push(Number(minPrice)); }
    if (maxPrice !== undefined) { where.push('l.consultation_fee <= ?'); params.push(Number(maxPrice)); }
    if (minRating !== undefined) { where.push('l.avg_rating >= ?'); params.push(Number(minRating)); }
    if (q) {
      where.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR l.law_firm LIKE ? OR l.bio LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRow] = await query(
      `SELECT COUNT(*) AS total FROM lawyers l JOIN users u ON u.id = l.user_id ${whereSQL}`,
      params
    );
    const total = countRow?.total || 0;

    const lawyers = await query(
      `SELECT l.id, l.law_firm, l.years_experience, l.consultation_fee,
              l.avg_rating, l.total_reviews, l.city, l.state, l.bio,
              u.first_name, u.last_name, u.avatar_url,
              GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ', ') AS specializations,
              GROUP_CONCAT(DISTINCT lps.state ORDER BY lps.state SEPARATOR ', ') AS practice_states
       FROM lawyers l
       JOIN users u ON u.id = l.user_id
       LEFT JOIN lawyer_specializations ls  ON ls.lawyer_id = l.id
       LEFT JOIN specializations s          ON s.id = ls.specialization_id
       LEFT JOIN lawyer_practice_states lps ON lps.lawyer_id = l.id
       ${whereSQL}
       GROUP BY l.id
       ORDER BY l.avg_rating DESC, l.total_reviews DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    return paginated(res, lawyers, {
      total, page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/lawyers/:id ─────────────────────────────────────
async function getLawyerById(req, res, next) {
  try {
    const { id } = req.params;

    const lawyer = await queryOne(
      `SELECT l.id, l.law_firm, l.bar_license_number, l.bar_state,
              l.years_experience, l.consultation_fee, l.avg_rating,
              l.total_reviews, l.total_bookings, l.city, l.state,
              l.bio, l.website_url, l.linkedin_url,
              u.first_name, u.last_name, u.avatar_url, u.email,
              u.created_at AS member_since
       FROM lawyers l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = ? AND l.approval_status = 'approved' AND u.is_active = 1`,
      [id]
    );

    if (!lawyer) return error(res, 'Lawyer not found', 404);

    const specializations = await query(
      `SELECT s.id, s.name, s.icon FROM specializations s
       JOIN lawyer_specializations ls ON ls.specialization_id = s.id
       WHERE ls.lawyer_id = ?`, [id]
    );

    const practiceStates = await query(
      'SELECT state FROM lawyer_practice_states WHERE lawyer_id = ?', [id]
    );

    const reviews = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.first_name, u.last_name, u.avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       WHERE r.lawyer_id = ? AND r.is_visible = 1
       ORDER BY r.created_at DESC LIMIT 20`,
      [id]
    );

    return success(res, {
      lawyer: {
        ...lawyer,
        specializations,
        practiceStates: practiceStates.map(r => r.state),
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/lawyers/me  (lawyer's own profile) ─────────────
async function getMyProfile(req, res, next) {
  try {
    const lawyer = await queryOne(
      `SELECT l.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
       FROM lawyers l JOIN users u ON u.id = l.user_id
       WHERE l.user_id = ?`,
      [req.user.userId]
    );
    if (!lawyer) return error(res, 'Lawyer profile not found', 404);

    const specializations = await query(
      `SELECT s.id, s.name, s.icon FROM specializations s
       JOIN lawyer_specializations ls ON ls.specialization_id = s.id
       WHERE ls.lawyer_id = ?`, [lawyer.id]
    );

    const practiceStates = await query(
      'SELECT state FROM lawyer_practice_states WHERE lawyer_id = ?', [lawyer.id]
    );

    return success(res, {
      lawyer: { ...lawyer, specializations, practiceStates: practiceStates.map(r => r.state) },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/lawyers/me ──────────────────────────────────────
async function updateMyProfile(req, res, next) {
  try {
    const {
      lawFirm, yearsExperience, bio, consultationFee,
      city, state, websiteUrl, linkedinUrl,
      specializations, practiceStates,
    } = req.body;

    const lawyer = await queryOne('SELECT id FROM lawyers WHERE user_id = ?', [req.user.userId]);
    if (!lawyer) return error(res, 'Lawyer profile not found', 404);

    await execute(
      `UPDATE lawyers SET law_firm=?, years_experience=?, bio=?, consultation_fee=?,
       city=?, state=?, website_url=?, linkedin_url=? WHERE id=?`,
      [lawFirm || null, Number(yearsExperience) || 0, bio || null,
       Number(consultationFee) || 0, city || null, state || null,
       websiteUrl || null, linkedinUrl || null, lawyer.id]
    );

    if (specializations) {
      await execute('DELETE FROM lawyer_specializations WHERE lawyer_id = ?', [lawyer.id]);
      for (const s of specializations) {
        await execute('INSERT IGNORE INTO lawyer_specializations (lawyer_id, specialization_id) VALUES (?,?)', [lawyer.id, s]);
      }
    }

    if (practiceStates) {
      await execute('DELETE FROM lawyer_practice_states WHERE lawyer_id = ?', [lawyer.id]);
      for (const s of practiceStates) {
        await execute('INSERT IGNORE INTO lawyer_practice_states (lawyer_id, state) VALUES (?,?)', [lawyer.id, s]);
      }
    }

    return success(res, { message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchLawyers, getLawyerById, getMyProfile, updateMyProfile };
