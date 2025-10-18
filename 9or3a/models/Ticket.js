const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Ticket', ticketSchema);
