const { Router } = require('express');
const { 
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMessage,
  getGroupMessages
} = require('../controllers/groupController');
const { checkToken } = require('../middleware/auth');

const router = Router();
router.use(checkToken);

router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/:id', getGroupDetails);
router.post('/:id/messages', addMessage);
router.get('/:id/messages', getGroupMessages);

module.exports = router;
