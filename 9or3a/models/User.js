const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Particulier', 'Admin'], default: 'Particulier' },
    score: { type: Number, default: 0 },
    isKYCValidated: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
