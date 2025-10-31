import { useState, useEffect, useRef } from "react";
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
  Filter,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

// ========== 100% WORKING API FUNCTIONS ==========
const API_BASE = '/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No authentication token found');
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// BULLETPROOF API CALL WRAPPER
const apiCall = async (url, options = {}) => {
  try {
    console.log(`🔄 API Call: ${url}`, options);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    // For FormData, don't set Content-Type header - let the browser set it
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    // Only add Content-Type for JSON requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(`📡 Response status: ${response.status} for ${url}`);

    if (response.status === 401 || response.status === 403) {
      console.error('❌ Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      window.location.href = '/admin/adminLogin';
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error! status: ${response.status}, response:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${url}`, data);

    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`❌ API call error for ${url}:`, error);
    
    // Don't throw auth errors again to prevent loops
    if (error.message.includes('Authentication failed')) {
      return { success: false, message: error.message };
    }
    
    throw error;
  }
};

// ADMIN PROFILE API
const fetchAdminProfileData = async () => {
  console.log('🔄 Fetching admin profile...');
  const data = await apiCall(`${API_BASE}/profile`);
  return data.user;
};


// DASHBOARD API
const fetchDashboardStats = async () => {
  console.log('🔄 Fetching dashboard stats...');
  const data = await apiCall(`${API_BASE}/dashboard/stats`);
  return data.data;
};

const fetchRecentUsers = async () => {
  console.log('🔄 Fetching recent users...');
  const data = await apiCall(`${API_BASE}/recent-users`);
  return data.data;
};

// USERS API
const fetchUsers = async (filters = {}) => {
  console.log('🔄 Fetching users with filters:', filters);
  const queryParams = new URLSearchParams(filters).toString();
  const data = await apiCall(`${API_BASE}/users?${queryParams}`);
  return data.data;
};

const updateUser = async (userId, userData) => {
  console.log('🔄 Updating user:', userId, userData);
  const data = await apiCall(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  return data.data;
};

const deleteUser = async (userId) => {
  console.log('🔄 Deleting user:', userId);
  const data = await apiCall(`${API_BASE}/users/${userId}`, {
    method: 'DELETE'
  });
  return data;
};



// Profile API calls - REAL IMPLEMENTATION
const updateAdminProfile = async (profileData) => {
  const data = await apiCall(`${API_BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  return data.data;
};

const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const data = await apiCall(`${API_BASE}/profile/picture`, {
    method: 'POST',
    body: formData,
  });
  return data.data;
};

const deleteProfilePicture = async () => {
  const data = await apiCall(`${API_BASE}/profile/picture`, {
    method: 'DELETE',
  });
  return data.data;
};

// ACTIVITY LOGS API
const fetchRecentActivities = async (limit = 50) => {
  console.log('🔄 Fetching recent activities, limit:', limit);
  const data = await apiCall(`${API_BASE}/recent-activities?limit=${limit}`);
  return data.data;
};

const fetchActivityLogsWithFilters = async (filters = {}) => {
  console.log('🔄 Fetching activity logs with filters:', filters);
  const queryParams = new URLSearchParams(filters).toString();
  const data = await apiCall(`${API_BASE}/activity-logs?${queryParams}`);
  return data.data;
};

const fetchActivityLogs = async (filters = {}) => {
  console.log('🔄 Fetching activity logs:', filters);
  const queryParams = new URLSearchParams(filters).toString();
  const data = await apiCall(`${API_BASE}/activity-logs?${queryParams}`);
  return data.data;
};

// SETTINGS API
const fetchSystemSettings = async () => {
  console.log('🔄 Fetching system settings...');
  const data = await apiCall(`${API_BASE}/settings/system`);
  return data.data;
};

const updateSystemSettings = async (settings) => {
  console.log('🔄 Updating system settings:', settings);
  const data = await apiCall(`${API_BASE}/settings/system`, {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
  return data.data;
};

// SKILLS API
const fetchSkillStats = async () => {
  console.log('🔄 Fetching skill stats...');
  const data = await apiCall(`${API_BASE}/skills/stats`);
  return data.data;
};

// ========== HELPER FUNCTIONS ==========
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

const getActivityIcon = (type) => {
  switch (type) {
    case 'login': return CheckCircle;
    case 'logout': return CheckCircle;
    case 'failed': return XCircle;
    case 'security': return Shield;
    case 'system': return SettingsIcon;
    case 'user_management': return Users;
    case 'user': return User;
    case 'skill': return TrendingUp;
    case 'project': return LayoutDashboard;
    default: return Activity;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'login': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'logout': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'security': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'system': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
    case 'user_management': return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20';
    case 'skill': return 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20';
    case 'project': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
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

// ========== SIDEBAR COMPONENT ==========
const Sidebar = ({ activePage, setActivePage, adminUser }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "manage-users", label: "Manage Users", icon: Users },
    { id: "activity-log", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    toast.success('Logged out successfully');
    window.location.href = '/admin/adminLogin';
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  console.log('👤 Sidebar admin user:', adminUser);

  return (
    <div className="flex flex-col h-full">
      {/* User Info Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          {adminUser?.profilePicture ? (
            <img
              src={adminUser.profilePicture}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {getInitials(adminUser?.name || 'Admin')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {adminUser?.name || 'System Admin'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {adminUser?.email || 'admin@skillmatch.com'}
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
                      onClick={() => {
                        console.log(`📱 Navigating to: ${item.id}`);
                        setActivePage(item.id);
                      }}
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

// ========== DASHBOARD COMPONENT ==========
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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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
  const [skillStatsData, setSkillStatsData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Users with Skill',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(40, 159, 64, 0.7)',
          'rgba(210, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(199, 199, 199)',
          'rgb(83, 102, 255)',
          'rgb(40, 159, 64)',
          'rgb(210, 99, 132)'
        ],
        borderWidth: 1,
        borderRadius: 4,
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

  const skillChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: 'rgb(107, 114, 128)'
        }
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
      console.log('📊 Loading REAL dashboard data from database...');
      setLoading(true);

      const [statsData, recentUsersData, activityData, skillStats] = await Promise.all([
        fetchDashboardStats().catch(err => {
          console.error('Failed to fetch stats:', err);
          return null;
        }),
        fetchRecentUsers().catch(err => {
          console.error('Failed to fetch recent users:', err);
          return [];
        }),
        fetchActivityLogs({ limit: 5 }).catch(err => {
          console.error('Failed to fetch activity:', err);
          return { activities: [] };
        }),
        fetchSkillStats().catch(err => {
          console.error('Failed to fetch skill stats:', err);
          return null;
        })
      ]);

      console.log('✅ REAL Dashboard data loaded:', {
        stats: statsData,
        skillStats: skillStats
      });

      // Set stats with REAL data
      if (statsData) {
        setStats(statsData.stats || {
          activeStudents: 0,
          newSignups: 0,
          dailyActivity: 0,
          totalUsers: 0
        });
        
        // Set REAL user growth data from backend
        if (statsData.charts?.userGrowth) {
          setUserGrowthData(prev => ({
            ...prev,
            labels: statsData.charts.userGrowth.labels || prev.labels,
            datasets: [{
              ...prev.datasets[0],
              data: statsData.charts.userGrowth.data || []
            }]
          }));
        }
      }

      // Set REAL skill statistics data
      if (skillStats) {
        setSkillStatsData({
          labels: skillStats.labels || [],
          datasets: [{
            label: 'Users with Skill',
            data: skillStats.data || [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(199, 199, 199, 0.7)',
              'rgba(83, 102, 255, 0.7)',
              'rgba(40, 159, 64, 0.7)',
              'rgba(210, 99, 132, 0.7)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)',
              'rgb(199, 199, 199)',
              'rgb(83, 102, 255)',
              'rgb(40, 159, 64)',
              'rgb(210, 99, 132)'
            ],
            borderWidth: 1,
            borderRadius: 4,
          }]
        });
      }

      // Set recent users
      setRecentUsers(recentUsersData || []);

      // Set recent activity
      if (activityData && activityData.activities) {
        const userActivities = activityData.activities
          .filter(activity => 
            !activity.user?.toLowerCase().includes('admin') && 
            !activity.user?.toLowerCase().includes('system')
          )
          .slice(0, 5);
        setRecentActivity(userActivities);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Minimal fallback data only if API fails completely
      setStats({
        activeStudents: 0,
        newSignups: 0,
        dailyActivity: 0,
        totalUsers: 0
      });
      
      setRecentUsers([]);
      setRecentActivity([]);

    } finally {
      setLoading(false);
      console.log('✅ Dashboard loading complete');
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
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
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
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.activeStudents.toLocaleString()}</p>
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
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.newSignups.toLocaleString()}</p>
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
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.dailyActivity.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently active</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
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

        {/* Skill Statistics Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Popular Skills</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most common skills among users</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
              <span>Top {skillStatsData.labels.length} skills</span>
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={skillStatsData}
              options={skillChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Recent Data */}
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

        {/* Recent Activity */}
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

// ========== DELETE USER MODAL ==========
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

// ========== EDIT USER MODAL ==========
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

// ========== MANAGE USERS COMPONENT ==========
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

  useEffect(() => {
    loadUsers();
  }, [filters]);

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
      
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key] === undefined || queryFilters[key] === 'all') {
          delete queryFilters[key];
        }
      });
      
      console.log('🔄 Loading users with filters:', queryFilters);
      
      const usersData = await fetchUsers(queryFilters);
      console.log('✅ Users data received:', usersData);
      
      setUsers(usersData.users || []);
      setPagination(usersData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: usersData.users?.length || 0,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('❌ Error loading users:', error);
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
      loadUsers();
    } catch (error) {
      console.error('❌ Error updating user:', error);
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
      loadUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const displayUsers = users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage system users</p>
      </div>

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

      {/* Modals */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleUpdate}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

// ========== ACTIVITY LOG COMPONENT ==========
const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalActivities: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    type: 'all',
    user: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadActivities();
      }, 10000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      const cleanFilters = { ...filters };
      Object.keys(cleanFilters).forEach(key => {
        if (cleanFilters[key] === '' || cleanFilters[key] === 'all') {
          delete cleanFilters[key];
        }
      });

      console.log('🔄 Loading activities with filters:', cleanFilters);
      
      const data = await fetchActivityLogsWithFilters(cleanFilters);
      console.log('✅ Activities data received:', data);

      if (data && data.activities) {
        const userActivities = data.activities.filter(activity => 
          !isAdminActivity(activity.user) && !isAdminActivity(activity.action)
        );
        
        setActivities(userActivities);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalActivities: userActivities.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setActivities([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalActivities: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('❌ Error loading activities:', error);
      toast.error('Failed to load user activity logs');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const isAdminActivity = (text) => {
    if (!text) return false;
    const adminKeywords = ['admin', 'system', 'administrator'];
    return adminKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      user: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    });
  };

  const handleRefresh = () => {
    loadActivities();
    toast.success('User activity log refreshed');
  };

  const exportActivities = () => {
    toast.info('Preparing user activity log export...');
  };

  const activityTypes = [
    { value: 'all', label: 'All User Activities' },
    { value: 'login', label: 'User Logins' },
    { value: 'logout', label: 'User Logouts' },
    { value: 'failed', label: 'Failed Logins' },
    { value: 'skill', label: 'Skill Changes' },
    { value: 'project', label: 'Project Changes' },
    { value: 'user_management', label: 'Profile Updates' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of student activities (Admin activities are hidden)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Only student activities are shown. Admin and system activities are filtered out.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder="Search by student name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {activities.length} student activities
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={exportActivities}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Student Activities
              {autoRefresh && (
                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {autoRefresh && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  Live
                </span>
              )}
              <span>Updated {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-500 dark:text-gray-400">
                  Loading student activities...
                </span>
              </div>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {activity.user}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.action}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {activity.timeAgo || getTimeAgo(activity.time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full capitalize ${
                          activity.type === 'login' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          activity.type === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          activity.type === 'skill' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          activity.type === 'project' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                        {activity.ipAddress && (
                          <span>IP: {activity.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No student activities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filters.type !== 'all' || filters.user || filters.startDate || filters.endDate
                  ? 'Try adjusting your filters to see more results.'
                  : 'Student activities will appear here as they occur.'
                }
              </p>
              {(filters.type !== 'all' || filters.user || filters.startDate || filters.endDate) && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== SETTINGS COMPONENTS ==========
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
      console.error('❌ Error loading system settings:', error);
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
      console.error('❌ Error:', error);
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
          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">General Settings</h5>
            <div className="space-y-4">
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

          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h5>
            <div className="space-y-4">
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

// AccountSettings Component - WITH REAL API INTEGRATION
function AccountSettings({ user, setUser, showPasswords, togglePasswordVisibility }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.profilePicture || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form data when user changes
  useEffect(() => {
    console.log('🔍 Profile Picture Debug:', {
      userProfilePicture: user?.profilePicture,
      profilePreview: profilePreview,
      hasUser: !!user,
      userData: user
    });
  }, [user, profilePreview]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setProfilePreview(user.profilePicture || '');
    }
  }, [user]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfilePicture(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload profile picture
  const handleUploadPicture = async () => {
    if (!profilePicture) return;

    try {
      setIsUploading(true);
      
      // REAL API CALL
      const response = await uploadProfilePicture(profilePicture);
      
      // Update user state with response from API
      setUser(response);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedStoredUser = { ...storedUser, ...response };
      localStorage.setItem('user', JSON.stringify(updatedStoredUser));
      
      toast.success('Profile picture updated successfully!');
      
      // Reset file state
      setProfilePicture(null);
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture. Please try again.');
      // Reset on error
      setProfilePicture(null);
      setProfilePreview(user?.profilePicture || '');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove profile picture
  const handleRemovePicture = async () => {
    try {
      setIsUploading(true);
      
      // REAL API CALL
      const response = await deleteProfilePicture();
      
      // Update user state
      setUser(response);
      setProfilePicture(null);
      setProfilePreview('');
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedStoredUser = { ...storedUser, ...response };
      localStorage.setItem('user', JSON.stringify(updatedStoredUser));
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Profile picture removed successfully!');
      
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error(error.message || 'Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    // Check if name is provided
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match!');
        return false;
      }

      if (!formData.currentPassword) {
        toast.error('Current password is required to change password');
        return false;
      }
    }

    // If changing email, require current password
    if (formData.email !== user.email && !formData.currentPassword) {
      toast.error('Current password is required to change email address');
      return false;
    }

    return true;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare update data for API
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Only include password fields if they have values
      if (formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      // REAL API CALL
      const response = await updateAdminProfile(updateData);

      // Update user state with response from API
      setUser(response);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedStoredUser = { ...storedUser, ...response };
      localStorage.setItem('user', JSON.stringify(updatedStoredUser));
      
      toast.success('Profile updated successfully!');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setProfilePreview(user?.profilePicture || '');
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Changes cancelled');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires confirmation', {
      description: 'Please contact support to proceed with account deletion.'
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <User size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your profile information and photo</p>
          </div>
        </div>
        
        {/* Profile Picture Section */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="relative group">
                {profilePreview ? (
                  <>
                    <img
                      src={profilePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg transition-all duration-200 group-hover:opacity-80"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg group-hover:opacity-80 transition-all duration-200">
                    <span className="text-white text-xl font-bold">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}
                
                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer">
                  <Edit className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Remove button - only show if user has a profile picture */}
              {user?.profilePicture && !isUploading && (
                <button
                  onClick={handleRemovePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove profile picture"
                  disabled={isUploading}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Profile Photo</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                JPG, PNG, GIF or WebP. Max size 5MB.
              </p>
              <div className="flex flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  {user?.profilePicture ? 'Change Photo' : 'Upload Photo'}
                </button>
                
                {/* Upload button - only show when a new file is selected */}
                {profilePicture && (
                  <button
                    onClick={handleUploadPicture}
                    disabled={isUploading}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Photo
                      </>
                    )}
                  </button>
                )}
                
                {user?.profilePicture && !isUploading && (
                  <button
                    onClick={handleRemovePicture}
                    disabled={isUploading}
                    className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {/* File info */}
              {profilePicture && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Selected:</strong> {profilePicture.name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Size: {(profilePicture.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Click "Save Photo" to upload this image as your profile picture.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Leave blank if you don't want to change your password
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.newPassword && formData.newPassword.length < 8 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleSaveProfile}
              disabled={isLoading || isUploading}
              className="bg-blue-600 text-white py-2.5 px-8 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isLoading || isUploading}
              className="px-6 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-900/20 w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings({ isDarkMode, toggleDarkMode, user }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = async () => {
    try {
      setIsLoading(true);
      toggleDarkMode();
      toast.success('Theme updated successfully!');
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
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

// ========== SETTINGS PAGE ==========
const SettingsPage = ({ darkMode, toggleDarkMode, adminUser, setAdminUser }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Error loading user data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences and application settings</p>
      </div>

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
          <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-full p-1 w-full gap-1">
            <SettingsTab active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
              Account
            </SettingsTab>
            <SettingsTab active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')}>
              Appearance
            </SettingsTab>
            <SettingsTab active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
              System
            </SettingsTab>
          </div>
        </div>

        <div className="p-6 w-full">
          {activeTab === 'account' && (
            <AccountSettings 
              user={adminUser} 
              setUser={setAdminUser}
              showPasswords={showPasswords} 
              togglePasswordVisibility={togglePasswordVisibility}
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings 
              isDarkMode={darkMode} 
              toggleDarkMode={toggleDarkMode}
              user={adminUser}
            />
          )}
          {activeTab === 'system' && (
            <SystemSettings 
              user={adminUser}
              setUser={setAdminUser}
            />
          )}
        </div>
      </section>
    </div>
  );
};

// ========== MAIN ADMIN PANEL COMPONENT ==========
const AdminPanel = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const loadAdminProfile = async () => {
    try {
      console.log('🔄 Loading admin profile...');
      
      // Try to get from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('📁 Loaded user from localStorage:', userData);
        setAdminUser(userData);
      }

      // Then try to fetch from API
      try {
        const profile = await fetchAdminProfileData();
        console.log('🌐 Loaded user from API:', profile);
        setAdminUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (apiError) {
        console.warn('⚠️ Could not fetch admin profile from API, using stored data:', apiError);
        // Continue with stored data
      }
    } catch (error) {
      console.error('❌ Error loading admin profile:', error);
      // Ultimate fallback
      setAdminUser({
        name: 'System Admin',
        email: 'admin@skillmatch.com',
        profilePicture: '',
        isAdmin: true
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 Checking authentication...');
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 User exists:', !!user);
      
      if (!token || !user) {
        console.error('❌ No token or user, redirecting to login');
        toast.error('Please login as admin first');
        navigate('/admin/adminLogin');
        return;
      }

      try {
        const userData = JSON.parse(user);
        console.log('🔐 User data:', userData);
        
        if (!userData.isAdmin) {
          console.error('❌ User is not admin, redirecting');
          toast.error('Admin privileges required');
          navigate('/admin/adminLogin');
          return;
        }

        await loadAdminProfile();
        console.log('✅ Authentication successful');
        
      } catch (error) {
        console.error('❌ Auth check error:', error);
        toast.error('Invalid user data');
        navigate('/admin/adminLogin');
      } finally {
        setLoading(false);
        console.log('✅ Auth check complete');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading admin panel...</p>
          </div>
        </div>
      );
    }

    console.log(`🔄 Rendering page: ${activePage}`);

    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "manage-users":
        return <ManageUsers />;
      case "activity-log":
        return <ActivityLog />;
      case "settings":
        return <SettingsPage 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          adminUser={adminUser}
          setAdminUser={setAdminUser}
        />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300 flex flex-col">
      {/* Header */}
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
                  SkillMatch Admin
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {adminUser?.name || 'System Admin'}
            </div>
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar*/}
        <div className="w-64 bg-white dark:bg-gray-900 shadow-sm border-r border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-[60px] h-[calc(100vh-60px)]">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage}
            adminUser={adminUser}
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