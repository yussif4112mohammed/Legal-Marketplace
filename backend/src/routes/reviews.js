const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewsController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// GET /api/reviews?lawyerId=X  — public
router.get('/', getReviews);

// POST /api/reviews  — clients only
router.post('/',
  authenticate,
  authorize('client'),
  [
    body('lawyerId').isInt({ min: 1 }),
    body('bookingId').isInt({ min: 1 }),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('comment').trim().isLength({ min: 10, max: 2000 }).withMessage('Comment must be 10–2000 chars'),
  ],
  validate,
  createReview
);

module.exports = router;
