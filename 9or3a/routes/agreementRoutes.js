const express = require('express');
const router = express.Router();
const { proposeAgreement, voteOnAgreement, getGroupAgreements } = require('../controllers/agreementController');
const authMiddleware = require('../middlewares/authMiddleware');
const kycMiddleware = require('../middlewares/kycMiddleware');

router.post('/propose', authMiddleware, kycMiddleware, proposeAgreement);
router.post('/:agreementId/vote', authMiddleware, kycMiddleware, voteOnAgreement);
router.get('/group/:groupId', authMiddleware, kycMiddleware, getGroupAgreements);

module.exports = router;
