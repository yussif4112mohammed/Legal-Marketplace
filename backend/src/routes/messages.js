const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getMessages, sendMessage, getUnreadCount } = require('../controllers/messagesController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getMessages);
router.get('/unread-count', getUnreadCount);
router.post('/',
  [
    body('recipientId').isInt({ min: 1 }),
    body('content').trim().notEmpty().withMessage('Message cannot be empty').isLength({ max: 5000 }),
  ],
  validate,
  sendMessage
);

module.exports = router;
