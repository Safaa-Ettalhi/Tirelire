const { Router } = require('express');
const { 
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMessage,
  getGroupMessages,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  makeContribution,
  getContributions,
  validateContribution
} = require('../controllers/groupController');
const { checkToken } = require('../middleware/auth');

const router = Router();
router.use(checkToken);

router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/:id', getGroupDetails);
router.post('/:id/join', joinGroup);
router.delete('/:id/leave', leaveGroup);
router.get('/:id/members', getGroupMembers);
router.post('/:id/contribute', makeContribution);
router.get('/:id/contributions', getContributions);
router.put('/:id/contributions/:contributionId/validate', validateContribution);
router.post('/:id/messages', addMessage);
router.get('/:id/messages', getGroupMessages);

module.exports = router;
