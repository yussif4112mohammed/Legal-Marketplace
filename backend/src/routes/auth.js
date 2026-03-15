const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, me, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
    body('role').optional().isIn(['client', 'lawyer']).withMessage('Role must be client or lawyer'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/me
router.get('/me', authenticate, me);

// POST /api/auth/change-password
router.post('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  changePassword
);

module.exports = router;
