const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contribution: { type: mongoose.Schema.Types.ObjectId, ref: 'Contribution', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'failed'], default: 'paid' },
    stripePaymentId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
