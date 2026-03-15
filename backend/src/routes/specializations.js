const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { success } = require('../utils/response');

// GET /api/specializations — public
router.get('/', async (req, res, next) => {
  try {
    const specializations = await query(
      'SELECT id, name, slug, icon FROM specializations WHERE is_active = 1 ORDER BY name'
    );
    return success(res, { specializations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
