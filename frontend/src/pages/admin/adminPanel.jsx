import { useState, useEffect } from "react";
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Users, 
  Activity, 
  Sliders,
  Search,
  Mail,
  Calendar,
  User,
  Shield,
  LogOut,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Palette,
  Zap,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

// API Functions
const API_BASE = '/api/admin';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// Dashboard API calls
const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const fetchRecentUsers = async () => {
  try {
    const response = await fetch(`${API_BASE}/recent-users`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
};

// Users API calls
const fetchUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/users?${queryParams}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Activity Log API calls
const fetchActivityLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/activity-logs?${queryParams}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

// FIXED: Proper daily activity endpoint that matches your backend
const fetchDashboardDailyActivity = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    
    // Extract daily activity data from the stats response
    return data.data.charts?.dailyActivity || {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [342, 389, 425, 398, 367, 285, 210]
    };
  } catch (error) {
    console.error('Error fetching daily activity:', error);
    // Return fallback data
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [342, 389, 425, 398, 367, 285, 210]
    };
  }
};

const fetchAllActivities = async (filters = {}) => {
  try {
    const qp = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/activity-logs?${qp}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (err) {
    console.error('fetchAllActivities error:', err);
    throw err;
  }
};

// Settings API calls
const fetchSystemSettings = async () => {
  try {
    const response = await fetch(`${API_BASE}/settings/system`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

const updateSystemSettings = async (settings) => {
  try {
    const response = await fetch(`${API_BASE}/settings/system`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

// Helper functions
const getRoleIcon = (type) => {
  switch (type) {
    case 'admin': return Shield;
    case 'student': return User;
    default: return User;
  }
};

const getRoleColor = (type) => {
  switch (type) {
    case 'admin': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
    case 'student': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// FIXED: Add missing activity log helper functions
const getActivityIcon = (type) => {
  switch (type) {
    case 'login': return CheckCircle;
    case 'logout': return CheckCircle;
    case 'failed': return XCircle;
    case 'security': return Shield;
    case 'system': return SettingsIcon;
    case 'user_management': return Users;
    case 'user': return User;
    default: return Activity;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'login': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
    case 'logout': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
    case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
    case 'security': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
    case 'system': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
    case 'user_management': return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900';
    case 'user': return 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
  }
};

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// Sidebar Component
const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "manage-users", label: "Manage Users", icon: Users },
    { id: "activity-log", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    toast.success('Logged out successfully');
    window.location.href = '/admin/adminLogin';
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Info Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-semibold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              System Admin
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              admin@skillmatch.com
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="py-4">
          <nav>
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActivePage(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Logout Button*/}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component - FIXED with real data integration
const Dashboard = () => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    newSignups: 0,
    dailyActivity: 0,
    totalUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  });
  const [dailyActivityData, setDailyActivityData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  });
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        border: {
          display: false
        },
        beginAtZero: true
      }
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // FIXED: Use proper API calls that match your backend
        const [statsData, recentUsersData, activityData, dailyData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentUsers(),
          fetchActivityLogs({ limit: 5 }),
          fetchDashboardDailyActivity()
        ]);

        console.log('Dashboard data loaded:', {
          stats: statsData,
          recentUsers: recentUsersData,
          activity: activityData,
          daily: dailyData
        });

        // Set stats with real data
        if (statsData && statsData.stats) {
          setStats(statsData.stats);
          
          // Set user growth data from backend
          if (statsData.charts?.userGrowth) {
            setUserGrowthData(prev => ({
              ...prev,
              datasets: [{
                ...prev.datasets[0],
                data: statsData.charts.userGrowth.data
              }]
            }));
          }
        }

        // Set daily activity data
        if (dailyData) {
          setDailyActivityData({
            labels: dailyData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Active Users',
              data: dailyData.data || [],
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            }]
          });
        }

        // Set recent users with real data
        if (recentUsersData && Array.isArray(recentUsersData)) {
          setRecentUsers(recentUsersData);
        }

        // FIXED: Set recent activity with real data from activity logs
        if (activityData && activityData.activities) {
          // Filter out admin activities and get only user activities for the recent activity section
          const userActivities = activityData.activities
            .filter(activity => 
              !activity.user?.toLowerCase().includes('admin') && 
              !activity.user?.toLowerCase().includes('system')
            )
            .slice(0, 5); // Get only first 5 activities
          
          setRecentActivity(userActivities);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
        
        // Fallback data only if API fails completely
        setStats({
          activeStudents: 1247,
          newSignups: 89,
          dailyActivity: 342,
          totalUsers: 15689
        });
        
        setRecentUsers([
          { name: "John Smith", email: "john.smith@university.edu", lastLogin: "2 hours ago" },
          { name: "Sarah Johnson", email: "sarah.johnson@university.edu", lastLogin: "3 hours ago" },
          { name: "Mike Davis", email: "mike.davis@university.edu", lastLogin: "5 hours ago" },
          { name: "Emily Wilson", email: "emily.wilson@university.edu", lastLogin: "6 hours ago" }
        ]);

        setRecentActivity([
          { user: "John Smith", action: "Logged in successfully", time: new Date(), timeAgo: "2 hours ago" },
          { user: "Sarah Johnson", action: "Updated profile information", time: new Date(), timeAgo: "3 hours ago" },
          { user: "Mike Davis", action: "Completed skill assessment", time: new Date(), timeAgo: "5 hours ago" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All registered users</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.activeStudents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Logged in last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Signups</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.newSignups}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Now</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.dailyActivity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently active</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* User Growth and Daily Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">User Growth</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly signups over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={userGrowthData}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Daily Activity</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active users by day</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
              <span>Peak: Wednesday</span>
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={dailyActivityData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length > 0 ? recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last login</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{user.lastLogin}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No recent users</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - FIXED: Now using real activity data */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent User Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {activity.timeAgo || getTimeAgo(activity.time)}
                </span>
              </div>
            )) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No recent user activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete User Modal Component
const DeleteUserModal = ({ isOpen, onClose, user, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete User
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Are you absolutely sure?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user)}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    status: "Active"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        status: user.status
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(user.id, editForm);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Edit User
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Update user account information
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Manage Users Component
const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(false);

  // Load users automatically on component mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Load users when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ 
        ...prev, 
        page: 1,
        search: searchTerm || undefined 
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const queryFilters = {
        ...filters,
        search: searchTerm || undefined
      };
      
      // Remove undefined values
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key] === undefined || queryFilters[key] === 'all') {
          delete queryFilters[key];
        }
      });
      
      console.log('Fetching users with filters:', queryFilters);
      
      const usersData = await fetchUsers(queryFilters);
      console.log('Users data received:', usersData);
      
      setUsers(usersData.users || []);
      setPagination(usersData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: usersData.users?.length || 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (userId, userData) => {
    try {
      await updateUser(userId, userData);
      toast.success('User updated successfully');
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (user) => {
    try {
      await deleteUser(user.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? undefined : value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Filter users based on search term for client-side filtering as fallback
  const filteredUsers = users.filter(user => 
    searchTerm === '' || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayUsers = searchTerm ? filteredUsers : users;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage system users</p>
      </div>

      {/* All Users Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">System Users</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-500 dark:text-gray-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : displayUsers.length > 0 ? displayUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.type);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getRoleColor(user.type)}`}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {user.joinDate}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : user.status === 'Inactive'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.type !== 'admin' && (
                          <button 
                            onClick={() => handleDelete(user)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="text-center py-4">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No users found matching your search' : 'No users found'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {displayUsers.length} of {pagination.totalUsers} users
          </p>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleUpdate}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

// Activity Log Component - FIXED
const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
  });
  const [filters, setFilters] = useState({
    type: 'all',
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [filters]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchAllActivities(filters);

      // Use all activities from the database
      setActivities(data.activities || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalActivities: data.activities?.length || 0,
      });
    } catch (error) {
      toast.error('Failed to load activity logs');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Activity Log</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          All user actions (login, logout, skill changes, project changes, failed logins…)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <select
          value={filters.type}
          onChange={e => handleFilterChange('type', e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="failed">Failed Login</option>
          <option value="skill">Skill Added/Deleted</option>
          <option value="project">Project Added/Deleted</option>
          <option value="user_management">User Management</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading…</p>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(act => {
              const Icon = getActivityIcon(act.type);
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(act.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">{act.user}</span>
                      <span className="text-gray-600 dark:text-gray-400">{act.action}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {act.timeAgo || getTimeAgo(act.time)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No activities found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >Prev</button>
          <span className="px-3 py-1 text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >Next</button>
        </div>
      )}
    </div>
  );
};

// SettingsTab Component
function SettingsTab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-200 flex items-center justify-center text-xs font-medium px-1 py-2 rounded-full w-full hover:scale-105 ${
        active 
          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
      }`}
    >
      {children}
    </button>
  );
}

// SystemSettings Component
function SystemSettings({ user, setUser }) {
  const [systemSettings, setSystemSettings] = useState({
    allowRegistrations: true,
    emailVerification: true,
    maintenanceMode: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      const settings = await fetchSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const handleToggle = (key) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNumberChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateSystemSettings(systemSettings);
      toast.success('System settings saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSystemSettings({
      allowRegistrations: true,
      emailVerification: true,
      maintenanceMode: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5
    });
    toast.info('System settings reset to defaults');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/20 flex items-center justify-center">
          <SettingsIcon size={16} className="text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure system preferences</p>
        </div>
      </div>

      {/* System Configuration Card */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Sliders size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">System Configuration</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage global system settings and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings Section */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">General Settings</h5>
            <div className="space-y-4">
              {/* Allow New Registrations */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-1 flex-1 min-w-0">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Allow New Registrations</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enable users to create new accounts</p>
                </div>
                <button
                  onClick={() => handleToggle('allowRegistrations')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
                    systemSettings.allowRegistrations ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemSettings.allowRegistrations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Email Verification */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-1 flex-1 min-w-0">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Email Verification</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require email confirmation for new users</p>
                </div>
                <button
                  onClick={() => handleToggle('emailVerification')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
                    systemSettings.emailVerification ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemSettings.emailVerification ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-1 flex-1 min-w-0">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Restrict access to administrators only</p>
                </div>
                <button
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
                    systemSettings.maintenanceMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings Section */}
          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h5>
            <div className="space-y-4">
              {/* Session Timeout */}
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatic logout after inactivity</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => handleNumberChange('sessionTimeout', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                  </div>
                </div>
              </div>

              {/* Max Login Attempts */}
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Max Login Attempts</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Before account lockout</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => handleNumberChange('maxLoginAttempts', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">attempts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleReset}
            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition text-sm font-medium"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// AccountSettings Component
function AccountSettings({ user, setUser, showPasswords, togglePasswordVisibility }) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if ((newEmail || newPassword) && !currentPassword) {
      toast.error('Current password is required to make email or password changes!');
      return;
    }

    try {
      setIsLoading(true);
      // In a real implementation, you would call an API to update the admin's email/password
      setTimeout(() => {
        const updatedUser = { ...user };
        if (newEmail) updatedUser.email = newEmail;
        setUser(updatedUser);
        
        toast.success('Security settings saved successfully!');
        
        setNewEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Failed to save changes. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation', {
      description: 'Please contact support to proceed with account deletion.'
    });
  };

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Palette size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your email address and password</p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          {/* Current Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Current Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm"
            />
          </div>
          
          {/* New Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@skillmatch.com"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be a valid email address</p>
          </div>
          
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Required for email or password changes</p>
          </div>
          
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-900/20 w-full">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">Irreversible account actions</p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>
    </div>
  );
}

// AppearanceSettings Component
function AppearanceSettings({ isDarkMode, toggleDarkMode, user }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = async () => {
    try {
      setIsLoading(true);
      toggleDarkMode();
      toast.success('Theme updated successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update theme');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <Palette size={16} className="text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance Settings</h3>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Moon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Switch between light and dark theme for better viewing experience</p>
            </div>
          </div>
          
          <button
            onClick={handleThemeChange}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg disabled:opacity-50 ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap size={14} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Current Theme</h6>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                {isDarkMode ? 'Dark mode is currently enabled' : 'Light mode is currently enabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// NotificationSettings Component
function NotificationSettings({ user, setUser }) {
  const [notifications, setNotifications] = useState({
    skillAlerts: user.settings?.notifications?.skillAlerts ?? true,
    projectUpdates: user.settings?.notifications?.projectUpdates ?? true,
    weeklyReports: user.settings?.notifications?.weeklyReports ?? false,
    recommendations: user.settings?.notifications?.recommendations ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        const updatedUser = { ...user, settings: { ...user.settings, notifications } };
        setUser(updatedUser);
        toast.success('Notification preferences saved!');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to save preferences');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
          <Bell size={16} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Skill Improvement Alerts</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when you reach new proficiency levels</p>
          </div>
          <button
            onClick={() => handleToggle('skillAlerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.skillAlerts ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.skillAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Project Updates</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your collaborative projects</p>
          </div>
          <button
            onClick={() => handleToggle('projectUpdates')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.projectUpdates ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.projectUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Weekly Progress Reports</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get a weekly summary of your skill development</p>
          </div>
          <button
            onClick={() => handleToggle('weeklyReports')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.weeklyReports ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-gray-900 dark:text-white">AI Recommendations</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receive personalized skill suggestions</p>
          </div>
          <button
            onClick={() => handleToggle('recommendations')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 hover:scale-105 hover:shadow-lg ${
              notifications.recommendations ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.recommendations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

// PrivacySettings Component
function PrivacySettings({ user, setUser }) {
  const [privacy, setPrivacy] = useState({
    profileVisible: user.settings?.privacy?.profileVisible ?? true,
    skillsVisible: user.settings?.privacy?.skillsVisible ?? true,
    projectsVisible: user.settings?.privacy?.projectsVisible ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        const updatedUser = { ...user, settings: { ...user.settings, privacy } };
        setUser(updatedUser);
        toast.success('Privacy settings saved!');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to save privacy settings');
      setIsLoading(false);
    }
  };

  const handleDownloadData = () => {
    toast.success('Preparing your data export...');
  };

  const handleRequestDeletion = () => {
    toast.info('Contact admin to request data deletion');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <Shield size={16} className="text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h3>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Palette size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Privacy Controls</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage what information is visible to others</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Profile Visibility</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to view your profile</p>
            </div>
            <button
              onClick={() => handleToggle('profileVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.profileVisible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Show Skills</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display your skills on your public profile</p>
            </div>
            <button
              onClick={() => handleToggle('skillsVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.skillsVisible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.skillsVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">Show Projects</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display your project history publicly</p>
            </div>
            <button
              onClick={() => handleToggle('projectsVisible')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105 hover:shadow-lg ${
                privacy.projectsVisible ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.projectsVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Download size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Data Management</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download or delete your personal data</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleDownloadData}
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
          >
            Download My Data
          </button>
          
          <button 
            onClick={handleRequestDeletion}
            className="w-full text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 py-2.5 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm font-medium"
          >
            Request Data Deletion
          </button>
        </div>
      </div>
    </div>
  );
}

// SettingsPage Component
const SettingsPage = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setUser({ 
          name: 'System Admin', 
          email: 'admin@skillmatch.com',
          settings: {
            appearance: { theme: 'system', darkMode: darkMode },
            notifications: {
              skillAlerts: true,
              projectUpdates: true,
              weeklyReports: false,
              recommendations: true,
            },
            privacy: {
              profileVisible: true,
              skillsVisible: true,
              projectsVisible: true,
            },
            system: {
              allowRegistrations: true,
              emailVerification: true,
              maintenanceMode: false,
              sessionTimeout: 30,
              maxLoginAttempts: 5
            }
          }
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Fetch error:', err);
      setUser({ 
        name: 'System Admin', 
        email: 'admin@skillmatch.com',
        settings: {
          appearance: { theme: 'system', darkMode: darkMode },
          notifications: {
            skillAlerts: true,
            projectUpdates: true,
            weeklyReports: false,
            recommendations: true,
          },
          privacy: {
            profileVisible: true,
            skillsVisible: true,
            projectsVisible: true,
          },
          system: {
            allowRegistrations: true,
            emailVerification: true,
            maintenanceMode: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5
          }
        }
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Error loading user data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
      </div>

      {/* Settings Container */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Palette size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and application settings</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 pt-6">
          <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-800 rounded-full p-1 w-full gap-1">
            <SettingsTab active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
              Account
            </SettingsTab>
            <SettingsTab active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
              Appearance
            </SettingsTab>
            <SettingsTab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
              Notifications
            </SettingsTab>
            <SettingsTab active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
              Privacy
            </SettingsTab>
            <SettingsTab active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
              System
            </SettingsTab>
          </div>
        </div>

        <div className="p-6 w-full">
          {activeTab === 'account' && (
            <AccountSettings 
              user={user} 
              setUser={setUser}
              showPasswords={showPasswords} 
              togglePasswordVisibility={togglePasswordVisibility}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings 
              isDarkMode={darkMode} 
              toggleDarkMode={toggleDarkMode}
              user={user}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings 
              user={user}
              setUser={setUser}
            />
          )}
          {activeTab === 'privacy' && (
            <PrivacySettings 
              user={user}
              setUser={setUser}
            />
          )}
          {activeTab === 'system' && (
            <SystemSettings 
              user={user}
              setUser={setUser}
            />
          )}
        </div>
      </section>
    </div>
  );
};

// Main Admin Panel Component
const AdminPanel = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      toast.error('Please login as admin first');
      navigate('/admin/adminLogin');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (!userData.isAdmin) {
        toast.error('Admin privileges required');
        navigate('/admin/adminLogin');
      }
    } catch (error) {
      toast.error('Invalid user data');
      navigate('/admin/adminLogin');
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "manage-users":
        return <ManageUsers />;
      case "activity-log":
        return <ActivityLog />;
      case "settings":
        return <SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300 flex flex-col">
      {/* Full width header*/}
      <div className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 sticky top-0 z-50 flex-shrink-0">
        <div className="w-full px-6 py-3">
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="SkillMatch Logo"
                  className="w-8 h-8 object-contain rounded-full"
                />
                <span className="font-semibold text-gray-700 dark:text-white">
                  SkillMatch
                </span>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Content area below header */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar*/}
        <div className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-[60px] h-[calc(100vh-60px)]">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;