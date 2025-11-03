import { useEffect, useState } from 'react';
import { Wrench, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const MaintenanceMode = () => {
  const [message, setMessage] = useState('The website is currently under maintenance. Please check back later.');

  useEffect(() => {
    // Fetch maintenance message from API
    const fetchMaintenanceMessage = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/settings/system/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.maintenanceMessage) {
            setMessage(data.data.maintenanceMessage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch maintenance message:', error);
      }
    };

    fetchMaintenanceMessage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-4">
            <Wrench className="text-yellow-600 dark:text-yellow-400" size={48} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Under Maintenance
        </h1>
        
        <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-gray-700 dark:text-gray-300 text-left">
            {message}
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <img src={logo} alt="logo" className="w-6 h-6" />
          <span className="text-sm font-medium">SkillMatch</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;

