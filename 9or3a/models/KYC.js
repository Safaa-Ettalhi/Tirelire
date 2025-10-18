const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardImage: { type: String, required: true },
    selfieImage: { type: String, required: true },
    status: { type: String, enum: ['pending', 'validated', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KYC', kycSchema);
