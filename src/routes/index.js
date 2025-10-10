const { Router } = require('express');
const { ping } = require('../controllers/healthController');
const { signup, login, submitKYC, verifyKYC, getProfile, makeAdmin } = require('../controllers/authController');
const { checkToken, checkAdmin, checkKYC } = require('../middleware/auth');
const profileRoutes = require('./profileRoutes');
const groupRoutes = require('./groupRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = Router();

router.get('/health', ping);                    

// Routes d'authentification
router.post('/auth/signup', signup);           
router.post('/auth/login', login);              
router.get('/auth/profile', checkToken, getProfile);  
router.post('/auth/kyc/submit', checkToken, submitKYC);  

// Routes d'administration
router.post('/admin/verify-kyc', checkToken, checkAdmin, verifyKYC); 
router.post('/admin/make-admin', checkToken, checkAdmin, makeAdmin);   

// Routes de gestion du profil utilisateur
router.use('/profile', profileRoutes);

// Routes de gestion des groupes
router.use('/groups', groupRoutes);

// Routes de notifications et distribution
router.use('/notifications', notificationRoutes);

module.exports = { router };