const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getBookings, createBooking, updateBooking, getBookingById,
} = require('../controllers/bookingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All booking routes require auth
router.use(authenticate);

// GET /api/bookings
router.get('/', getBookings);

// POST /api/bookings  (clients only)
router.post('/',
  authorize('client'),
  [
    body('lawyerId').isInt({ min: 1 }).withMessage('Valid lawyer ID required'),
    body('scheduledAt').isISO8601().withMessage('Valid date/time required'),
    body('durationMinutes').isIn([30, 60, 90, 120]).withMessage('Duration must be 30, 60, 90, or 120'),
  ],
  validate,
  createBooking
);

// GET /api/bookings/:id
router.get('/:id', getBookingById);

// PATCH /api/bookings/:id
router.patch('/:id',
  [body('status').optional().isIn(['pending','confirmed','completed','cancelled','no_show'])],
  validate,
  updateBooking
);

module.exports = router;
