const { Router } = require('express');
const { ping } = require('../controllers/healthController');
const { signup, login, submitKYC, verifyKYC, getProfile, makeAdmin } = require('../controllers/authController');
const { checkToken, checkAdmin, checkKYC } = require('../middleware/auth');

const router = Router();

router.get('/health', ping);                    
router.post('/auth/signup', signup);           
router.post('/auth/login', login);              

router.get('/auth/profile', checkToken, getProfile);  
router.post('/auth/kyc/submit', checkToken, submitKYC);  


router.post('/admin/verify-kyc', checkToken, checkAdmin, verifyKYC);  // Vérifier KYC
router.post('/admin/make-admin', checkToken, checkAdmin, makeAdmin);   // Promouvoir en admin



module.exports = { router };