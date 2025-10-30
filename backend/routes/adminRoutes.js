import express from 'express';
import { adminAuth } from './adminAuth.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// GET ADMIN DASHBOARD STATISTICS
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin dashboard stats...');

    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active students (users who logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeStudents = await User.countDocuments({
      updatedAt: { $gte: sevenDaysAgo },
      userType: 'student'
    });

    // Get new signups this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newSignups = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
      userType: 'student'
    });

    // Get daily activity (users active today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const dailyActivity = await User.countDocuments({
      updatedAt: { $gte: startOfToday }
    });

    // Get user growth data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format user growth data for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const userGrowthData = months.map((month, index) => {
      const growth = userGrowth.find(g => 
        g._id.month === index + 1 && g._id.year === currentYear
      );
      return growth ? growth.count : 0;
    });

    // Get daily activity for current week
    const dailyActivityData = await getWeeklyActivity();

    res.json({
      success: true,
      data: {
        stats: {
          activeStudents,
          newSignups,
          dailyActivity,
          totalUsers
        },
        charts: {
          userGrowth: {
            labels: months,
            data: userGrowthData
          },
          dailyActivity: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: dailyActivityData
          }
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// GET ALL USERS WITH PAGINATION AND FILTERS
router.get('/users', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      // For now, we'll use updatedAt to determine activity
      // You might want to add an explicit status field to your User model
      if (status === 'Active') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filter.updatedAt = { $gte: thirtyDaysAgo };
      } else if (status === 'Inactive') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filter.updatedAt = { $lt: thirtyDaysAgo };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('firstName lastName email createdAt updatedAt userType isAdmin role')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      joinDate: user.createdAt.toLocaleDateString(),
      lastLogin: user.updatedAt.toLocaleDateString(),
      status: getStatusFromLastActivity(user.updatedAt),
      type: user.userType || 'student',
      isAdmin: user.isAdmin || user.role === 'admin'
    }));

    // Log the activity
    await req.user.logActivity('viewed user management', 'user_management', {
      page,
      search,
      status,
      results: formattedUsers.length
    });

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// UPDATE USER
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, status, userType, isAdmin } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) {
      const [firstName, ...lastNameParts] = name.split(' ');
      user.firstName = firstName;
      user.lastName = lastNameParts.join(' ') || '';
    }
    
    if (email) user.email = email;
    if (userType) user.userType = userType;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();

    // Log the activity
    await req.user.logActivity(`updated user ${user.firstName} ${user.lastName} (${user.email})`, 'user_management', {
      userId: user._id,
      changes: req.body
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          status: getStatusFromLastActivity(user.updatedAt),
          type: user.userType,
          isAdmin: user.isAdmin
        }
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE USER
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find user first to get details for logging
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    if (user.isAdmin || user.userType === 'admin' || user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    // Log the activity
    await req.user.logActivity(`deleted user ${user.firstName} ${user.lastName} (${user.email})`, 'user_management', {
      userId: user._id,
      userEmail: user.email
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// GET ACTIVITY LOGS
router.get('/activity-logs', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;

    // Build filter
    const filter = {};
    if (type !== 'all') {
      filter.type = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get activity logs
    const activities = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalActivities = await ActivityLog.countDocuments(filter);
    const totalPages = Math.ceil(totalActivities / limit);

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      user: activity.user,
      action: activity.action,
      time: activity.createdAt,
      type: activity.type,
      timeAgo: getTimeAgo(activity.createdAt)
    }));

    res.json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalActivities,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
});

// GET RECENT USERS
router.get('/recent-users', adminAuth, async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('firstName lastName email updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    const formattedUsers = recentUsers.map(user => ({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      lastLogin: user.updatedAt.toLocaleDateString()
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users',
      error: error.message
    });
  }
});

// HELPER FUNCTIONS
function getStatusFromLastActivity(lastActivity) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastActivity >= thirtyDaysAgo ? 'Active' : 'Inactive';
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

async function getWeeklyActivity() {
  // This is a simplified version - you might want to implement proper weekly tracking
  return [65, 59, 80, 81, 56, 55, 40]; // Mock data for now
}

export default router;