const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    getAllGroups, 
    getGroupDetails, 
    getAllUsers, 
    getPendingKYC, 
    getOpenTickets, 
    getAdvancedStats 
} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Toutes les routes admin nécessitent l'authentification et le rôle Admin
router.use(authMiddleware);
router.use(roleMiddleware('Admin'));

router.get('/dashboard', getDashboard);
router.get('/groups', getAllGroups);
router.get('/groups/:id', getGroupDetails);
router.get('/users', getAllUsers);
router.get('/kyc/pending', getPendingKYC);
router.get('/tickets/open', getOpenTickets);
router.get('/stats/advanced', getAdvancedStats);

module.exports = router;
