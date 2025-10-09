const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    name: { type: String, trim: true },
    kycStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    nationalId: { type: String, trim: true },
    nationalIdImage: { type: String }, 
    faceVerificationImage: { type: String },
    faceVerificationResult: {
      isMatch: { type: Boolean },
      confidence: { type: Number },
      message: { type: String },
      timestamp: { type: Date },
      method: { type: String }
    }, 
    kycVerifiedAt: { type: Date },
    kycVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    reliabilityScore: { type: Number, default: 0, min: 0, max: 100 },
    paymentHistory: [{
      date: { type: Date, default: Date.now },
      amount: { type: Number },
      onTime: { type: Boolean, default: true },
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


