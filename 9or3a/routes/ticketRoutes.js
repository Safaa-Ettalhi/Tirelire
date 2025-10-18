const express = require('express');
const router = express.Router();
const { createTicket, updateTicketStatus, getUserTickets, getTicketById } = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getUserTickets);
router.get('/:id', authMiddleware, getTicketById);
router.patch('/:id', authMiddleware, roleMiddleware('Admin'), updateTicketStatus);

module.exports = router;
