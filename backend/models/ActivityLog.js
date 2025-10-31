// models/ActivityLog.js - Enhanced version
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'login', 'logout', 'system', 'user_management', 
      'security', 'settings', 'skill', 'project', 
      'profile', 'registration', 'failed_login'
    ],
    default: 'system'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['student', 'admin', 'system'],
    default: 'student'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userType: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;