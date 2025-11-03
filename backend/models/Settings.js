import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Unique identifier to ensure only one settings document exists
  type: {
    type: String,
    default: 'system',
    unique: true
  },
  allowRegistrations: {
    type: Boolean,
    default: true
  },
  emailVerification: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'The website is currently under maintenance. Please check back later.'
  },
  sessionTimeout: {
    type: Number,
    default: 30 // minutes
  },
  maxLoginAttempts: {
    type: Number,
    default: 5
  },
  siteName: {
    type: String,
    default: 'SkillMatch'
  },
  siteDescription: {
    type: String,
    default: 'Skill Development Platform'
  },
  contactEmail: {
    type: String,
    default: 'admin@skillmatch.com'
  },
  maxFileSize: {
    type: Number,
    default: 5 // MB
  },
  allowedFileTypes: {
    type: [String],
    default: ['image/jpeg', 'image/png', 'image/gif']
  }
}, {
  timestamps: true
});

// Static method to get or create settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ type: 'system' });
  
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({ type: 'system' });
  }
  
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

