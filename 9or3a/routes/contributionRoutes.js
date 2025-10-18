const express = require('express');
const router = express.Router();
const { createContribution, payContribution, getGroupDistributions, getGroupPayments, getGroupContributions } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');
const kycMiddleware = require('../middlewares/kycMiddleware');

router.post('/', authMiddleware, kycMiddleware, createContribution);
router.post('/pay', authMiddleware, kycMiddleware, payContribution);
router.get('/group/:groupId', authMiddleware, kycMiddleware, getGroupContributions);
router.get('/group/:groupId/distributions', authMiddleware, kycMiddleware, getGroupDistributions);
router.get('/group/:groupId/payments', authMiddleware, kycMiddleware, getGroupPayments);

module.exports = router;
