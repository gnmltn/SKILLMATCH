// utils/studentActivityLogger.js
import ActivityLog from '../models/ActivityLog.js';

class StudentActivityLogger {
  static async logActivity(userId, userData, action, type = 'system', metadata = {}) {
    try {
      // Skip if it's an admin user
      if (userData.isAdmin || userData.userType === 'admin') {
        return null;
      }

      const activity = new ActivityLog({
        user: `${userData.firstName} ${userData.lastName}`,
        userId: userId,
        action,
        type,
        userType: 'student',
        ipAddress: metadata.ipAddress || 'N/A',
        userAgent: metadata.userAgent || 'N/A',
        metadata: {
          ...metadata,
          userEmail: userData.email
        }
      });

      await activity.save();
      console.log(`✅ Student activity logged: ${userData.firstName} ${userData.lastName} - ${action}`);
      return activity;
    } catch (error) {
      console.error('❌ Student activity logging error:', error);
      return null;
    }
  }

  // Specific activity methods
  static async logLogin(userId, userData, ipAddress, userAgent) {
    return this.logActivity(userId, userData, 'User logged in successfully', 'login', {
      ipAddress,
      userAgent
    });
  }

  static async logLogout(userId, userData, ipAddress, userAgent) {
    return this.logActivity(userId, userData, 'User logged out', 'logout', {
      ipAddress,
      userAgent
    });
  }

  static async logFailedLogin(userId, userData, ipAddress, userAgent) {
    return this.logActivity(userId, userData, 'Failed login attempt', 'failed_login', {
      ipAddress,
      userAgent
    });
  }

  static async logSkillUpdate(userId, userData, skillName, previousLevel, newLevel) {
    return this.logActivity(userId, userData, `Updated skill: ${skillName} from ${previousLevel} to ${newLevel}`, 'skill', {
      skillName,
      previousLevel,
      newLevel
    });
  }

  static async logProjectAdded(userId, userData, projectName) {
    return this.logActivity(userId, userData, `Added new project: ${projectName}`, 'project', {
      projectName
    });
  }

  static async logProfileUpdate(userId, userData, fieldsUpdated) {
    return this.logActivity(userId, userData, `Updated profile information`, 'profile', {
      fieldsUpdated
    });
  }

  static async logRegistration(userId, userData) {
    return this.logActivity(userId, userData, 'New user registration', 'registration', {
      course: userData.course,
      yearLevel: userData.yearLevel
    });
  }
}

export default StudentActivityLogger;