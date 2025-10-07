const { Router } = require('express');
const { ping } = require('../controllers/healthController');

const router = Router();
router.get('/health', ping);

module.exports = { router };


