const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create({
            user: req.user._id,
            group: req.body.group,
            subject: req.body.subject,
            description: req.body.description,
        });
        res.json({ message: 'Ticket créé', ticket });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
        
        ticket.status = req.body.status;
        ticket.assignedTo = req.body.assignedTo || ticket.assignedTo;
        await ticket.save();
        res.json({ message: 'Ticket mis à jour', ticket });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id });
        res.json({ tickets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
        res.json({ ticket });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};