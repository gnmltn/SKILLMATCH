import express from 'express';
import { adminAuth } from './adminAuth.js';
import Settings from '../models/Settings.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// GET SYSTEM SETTINGS
router.get('/system', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    const systemSettings = {
      allowRegistrations: settings.allowRegistrations,
      emailVerification: settings.emailVerification,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      sessionTimeout: settings.sessionTimeout,
      maxLoginAttempts: settings.maxLoginAttempts,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      contactEmail: settings.contactEmail,
      maxFileSize: settings.maxFileSize,
      allowedFileTypes: settings.allowedFileTypes
    };

    res.json({
      success: true,
      data: systemSettings
    });

  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system settings',
      error: error.message
    });
  }
});

// UPDATE SYSTEM SETTINGS
router.put('/system', adminAuth, async (req, res) => {
  try {
    const settingsData = req.body;

    // Validate settings
    if (settingsData.sessionTimeout !== undefined && (settingsData.sessionTimeout < 1 || settingsData.sessionTimeout > 480)) {
      return res.status(400).json({
        success: false,
        message: 'Session timeout must be between 1 and 480 minutes'
      });
    }

    if (settingsData.maxLoginAttempts !== undefined && (settingsData.maxLoginAttempts < 1 || settingsData.maxLoginAttempts > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Max login attempts must be between 1 and 10'
      });
    }

    // Get current settings
    const settings = await Settings.getSettings();
    
    // Update settings from request body
    if (settingsData.allowRegistrations !== undefined) {
      settings.allowRegistrations = settingsData.allowRegistrations;
    }
    if (settingsData.emailVerification !== undefined) {
      settings.emailVerification = settingsData.emailVerification;
    }
    if (settingsData.maintenanceMode !== undefined) {
      settings.maintenanceMode = settingsData.maintenanceMode;
    }
    if (settingsData.maintenanceMessage !== undefined) {
      settings.maintenanceMessage = settingsData.maintenanceMessage;
    }
    if (settingsData.sessionTimeout !== undefined) {
      settings.sessionTimeout = settingsData.sessionTimeout;
    }
    if (settingsData.maxLoginAttempts !== undefined) {
      settings.maxLoginAttempts = settingsData.maxLoginAttempts;
    }
    if (settingsData.siteName !== undefined) {
      settings.siteName = settingsData.siteName;
    }
    if (settingsData.siteDescription !== undefined) {
      settings.siteDescription = settingsData.siteDescription;
    }
    if (settingsData.contactEmail !== undefined) {
      settings.contactEmail = settingsData.contactEmail;
    }
    if (settingsData.maxFileSize !== undefined) {
      settings.maxFileSize = settingsData.maxFileSize;
    }
    if (settingsData.allowedFileTypes !== undefined) {
      settings.allowedFileTypes = settingsData.allowedFileTypes;
    }

    // Save to database
    await settings.save();

    // Log the activity
    await ActivityLog.create({
      user: `Admin: ${req.user.firstName} ${req.user.lastName}`,
      action: 'Updated system settings',
      type: 'system',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { settings: settingsData }
    });

    const updatedSettings = {
      allowRegistrations: settings.allowRegistrations,
      emailVerification: settings.emailVerification,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      sessionTimeout: settings.sessionTimeout,
      maxLoginAttempts: settings.maxLoginAttempts,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      contactEmail: settings.contactEmail,
      maxFileSize: settings.maxFileSize,
      allowedFileTypes: settings.allowedFileTypes
    };

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: error.message
    });
  }
});

export default router;