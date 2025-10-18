const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    audioPath: { type: String }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
