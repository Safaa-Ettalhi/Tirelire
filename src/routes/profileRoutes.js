const { Router } = require('express');
const { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getPaymentHistory, 
  getReliabilityStats 
} = require('../controllers/profileController');
const { checkToken } = require('../middleware/auth');

const router = Router();
router.use(checkToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.get('/payments', getPaymentHistory);
router.get('/reliability', getReliabilityStats);

module.exports = router;
