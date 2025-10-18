const express = require('express');
const router = express.Router();
const { 
    createPaymentIntent, 
    confirmPayment, 
    getUserPayments, 
    refundPayment 
} = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const kycMiddleware = require('../middlewares/kycMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Routes pour les paiements
router.post('/create-intent', authMiddleware, kycMiddleware, createPaymentIntent);
router.post('/confirm', authMiddleware, kycMiddleware, confirmPayment);
router.get('/user-payments', authMiddleware, kycMiddleware, getUserPayments);

// Route admin pour les remboursements
router.post('/refund/:paymentId', authMiddleware, roleMiddleware('Admin'), refundPayment);

module.exports = router;
