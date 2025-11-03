import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, AlertTriangle, Mail, Home, Shield, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';

const ArchivedAccount = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [archivedDate, setArchivedDate] = useState(null);

  useEffect(() => {
    // Clear any stored auth data
    localStorage.removeItem('token');
    
    // Try to get archived date from stored data before clearing user
    let foundDate = null;
    
    try {
      // First try archivedInfo
      const archivedInfo = localStorage.getItem('archivedInfo');
      if (archivedInfo) {
        const info = JSON.parse(archivedInfo);
        if (info.archivedAt) {
          foundDate = new Date(info.archivedAt);
          localStorage.removeItem('archivedInfo'); // Clean up after using
        }
      }
      
      // Also check user data (in case it wasn't cleared yet)
      if (!foundDate) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.archivedAt) {
            foundDate = new Date(userData.archivedAt);
          }
        }
      }
      
      // Set the date if found
      if (foundDate) {
        setArchivedDate(foundDate);
      }
    } catch (error) {
      console.error('Error parsing stored data:', error);
    }
    
    // Clear user data after extracting archived date
    localStorage.removeItem('user');
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="SkillMatch Logo" 
            className="h-16 w-auto"
          />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full">
                <Archive className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Archived by Administrator
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Your account access has been restricted
          </p>

          {/* Admin Notice */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Account Archived by Admin
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  An administrator has archived your account. This action was taken by a system administrator and restricts your access to the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Archived Date */}
          {archivedDate && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Archived on: {formatDate(archivedDate)}</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  What does this mean?
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You will not be able to access your account or any of its features until it is restored by an administrator. 
                  If you believe this is a mistake, please contact our support team immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Need help? Contact support:</span>
            </div>
            <a 
              href="mailto:admin@skillmatch.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm mt-1 block"
            >
              admin@skillmatch.com
            </a>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} SkillMatch. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ArchivedAccount;

