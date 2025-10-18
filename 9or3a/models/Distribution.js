const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    turn: { type: Number, required: true }, // Numéro du tour (1, 2, 3...)
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'failed'], 
        default: 'pending' 
    },
    stripeTransferId: { type: String }, // ID du virement Stripe
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Distribution', distributionSchema);
