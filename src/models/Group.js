const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  contributionAmount: { type: Number, required: true },
  contributionFrequency: { type: String, default: 'monthly' },
  maxMembers: { type: Number, default: 10 },
  status: { type: String, default: 'active' },
  contributions: [{
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    status: { type: String, default: 'paid' },
    date: { type: Date, default: Date.now }
  }],
  distributionRounds: [{
    roundNumber: { type: Number },
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    date: { type: Date },
    status: { type: String, default: 'completed' }
  }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    type: { type: String, default: 'text' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
