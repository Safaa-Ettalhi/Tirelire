const { Router } = require('express');
const { 
  sendNotification,
  getUserNotifications,
  markAsRead,
  sendReminder,
  distributePot
} = require('../controllers/notificationController');
const { checkToken } = require('../middleware/auth');

const router = Router();
router.use(checkToken);

router.post('/', sendNotification);
router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.post('/reminder/:id', sendReminder);
router.post('/distribute/:id', distributePot);

module.exports = router;
