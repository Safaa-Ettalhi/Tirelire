const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const kycMiddleware = require('../middlewares/kycMiddleware');

router.post('/', authMiddleware, kycMiddleware, sendMessage);
router.get('/:groupId', authMiddleware, kycMiddleware, getMessages);

module.exports = router;
