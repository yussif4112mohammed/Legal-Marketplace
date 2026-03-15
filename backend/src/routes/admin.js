const express = require('express');
const router = express.Router();
const {
  getStats, getPendingLawyers, approveLawyer, rejectLawyer,
  getUsers, toggleUser, getReviews, toggleReview, getLogs,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/stats',           getStats);
router.get('/pending-lawyers', getPendingLawyers);
router.patch('/lawyers/:id/approve', approveLawyer);
router.patch('/lawyers/:id/reject',  rejectLawyer);
router.get('/users',           getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/reviews',         getReviews);
router.patch('/reviews/:id/toggle', toggleReview);
router.get('/logs',            getLogs);

module.exports = router;
