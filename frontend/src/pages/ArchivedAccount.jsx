import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, AlertTriangle, Mail, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.png';

const ArchivedAccount = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Clear any stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleGoHome = () => {
    navigate('/');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Account Archived
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Your account has been archived by an administrator.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    What does this mean?
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You will not be able to access your account until it is restored by an administrator. 
                    Please contact support if you believe this is a mistake.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              <span>Need help? Contact: admin@skillmatch.com</span>
            </div>
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

