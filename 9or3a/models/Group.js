const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['mensuel', 'hebdomadaire'], default: 'mensuel' },
    rotationOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    currentTurn: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', groupSchema);
