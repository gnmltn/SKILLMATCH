import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otpCode: {
    type: String,
    required: true,
    length: 6,
    index: true
  },
  otpExpiresAt: {
    type: Date,
    required: true
    // Remove index: true from here
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for cleanup of expired OTPs (keep this)
passwordResetSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods...
passwordResetSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default mongoose.model('PasswordReset', passwordResetSchema);
