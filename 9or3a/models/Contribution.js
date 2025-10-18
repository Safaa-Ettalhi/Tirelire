const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contribution', contributionSchema);
