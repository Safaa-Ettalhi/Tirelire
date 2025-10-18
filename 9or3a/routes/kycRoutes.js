const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadKYC, verifyFace, getKYCStatus } = require('../controllers/kycController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/upload', authMiddleware, upload.fields([{ name: 'cardImage' }, { name: 'selfieImage' }]), uploadKYC);
router.post('/verify/:id', authMiddleware, roleMiddleware('Admin'), verifyFace);
router.get('/status', authMiddleware, getKYCStatus);

module.exports = router;
