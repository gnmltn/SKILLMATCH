import Settings from '../models/Settings.js';

// Middleware to check maintenance mode
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Allow admin routes and public settings endpoint to bypass maintenance mode
    // Check both the path and originalUrl to handle different route mounting scenarios
    const isAdminRoute = req.path.startsWith('/admin') || 
                        req.originalUrl?.startsWith('/api/admin') ||
                        req.path.includes('/admin');
    
    const isPublicSettings = req.path.includes('/settings/system/public') ||
                             req.originalUrl?.includes('/settings/system/public');
    
    if (isAdminRoute || isPublicSettings) {
      return next();
    }

    const settings = await Settings.getSettings();
    
    if (settings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: settings.maintenanceMessage || 'The website is currently under maintenance. Please check back later.',
        maintenanceMode: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    // On error, allow request to proceed (fail open)
    next();
  }
};

// Middleware to check if registrations are allowed
export const checkRegistrationStatus = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    
    if (!settings.allowRegistrations) {
      return res.status(404).json({
        success: false,
        message: 'Registration is currently disabled',
        registrationDisabled: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Registration status check error:', error);
    // On error, allow registration (fail open)
    next();
  }
};

// Helper function to get settings (for use in routes)
export const getSettings = async () => {
  return await Settings.getSettings();
};
