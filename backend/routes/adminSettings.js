import express from 'express';
import { adminAuth } from './adminAuth.js';

const router = express.Router();

// GET SYSTEM SETTINGS
router.get('/system', adminAuth, async (req, res) => {
  try {
    // In a real application, you'd store these in a database
    // For now, we'll return default settings
    const systemSettings = {
      allowRegistrations: true,
      emailVerification: true,
      maintenanceMode: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5
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
    const settings = req.body;

    // Validate settings
    if (settings.sessionTimeout && (settings.sessionTimeout < 1 || settings.sessionTimeout > 480)) {
      return res.status(400).json({
        success: false,
        message: 'Session timeout must be between 1 and 480 minutes'
      });
    }

    if (settings.maxLoginAttempts && (settings.maxLoginAttempts < 1 || settings.maxLoginAttempts > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Max login attempts must be between 1 and 10'
      });
    }

    // In a real application, you'd save these to a database
    // For now, we'll just return success

    // Log the activity
    await req.user.logActivity('updated system settings', 'settings', {
      changes: settings
    });

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings
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