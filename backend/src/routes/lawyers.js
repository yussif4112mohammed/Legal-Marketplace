const express = require('express');
const router = express.Router();
const {
  searchLawyers, getLawyerById, getMyProfile, updateMyProfile,
} = require('../controllers/lawyersController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/lawyers         — public search
router.get('/', searchLawyers);

// GET /api/lawyers/me      — lawyer's own profile (auth required)
router.get('/me', authenticate, authorize('lawyer'), getMyProfile);

// PUT /api/lawyers/me      — update own profile
router.put('/me', authenticate, authorize('lawyer'), updateMyProfile);

// GET /api/lawyers/:id     — public profile
router.get('/:id', getLawyerById);

module.exports = router;
