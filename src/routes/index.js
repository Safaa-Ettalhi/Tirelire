const { Router } = require('express');
const { ping } = require('../controllers/healthController');
const { signup, login } = require('../controllers/authController');
const { getMe } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = Router();
router.get('/health', ping);
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.get('/users/me', requireAuth, getMe);

module.exports = { router };


