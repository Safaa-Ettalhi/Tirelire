const express = require('express');
const router = express.Router();
const { createGroup, joinGroup, getGroups } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');
const kycMiddleware = require('../middlewares/kycMiddleware');

router.get('/', authMiddleware, getGroups);
router.post('/', authMiddleware, kycMiddleware, createGroup);
router.post('/:id/join', authMiddleware, kycMiddleware, joinGroup);

module.exports = router;
