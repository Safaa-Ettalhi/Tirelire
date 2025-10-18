const mongoose = require('mongoose');

const groupAgreementSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['amount', 'frequency', 'member_addition', 'member_removal'], 
        required: true 
    },
    currentValue: { type: mongoose.Schema.Types.Mixed }, // Valeur actuelle
    proposedValue: { type: mongoose.Schema.Types.Mixed }, // Nouvelle valeur proposée
    votes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approved: { type: Boolean, required: true },
        votedAt: { type: Date, default: Date.now }
    }],
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'expired'], 
        default: 'pending' 
    },
    expiresAt: { type: Date, required: true }, // Expiration du vote
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GroupAgreement', groupAgreementSchema);
