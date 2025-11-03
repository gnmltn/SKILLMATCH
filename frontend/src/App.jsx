import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RoleHistory from "./pages/RoleHistory.jsx";
import Settings from "./pages/Settings.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import CareerPath from "./pages/CareerPath.jsx";
import AdminLogin from "./pages/admin/adminLogin.jsx"; 
import AdminPanel from "./pages/admin/adminPanel.jsx";
import ArchivedAccount from "./pages/ArchivedAccount.jsx";
import MaintenanceMode from "./pages/MaintenanceMode.jsx";
import ThemeTransition from "./components/ThemeTransition.jsx";
import InactivityTracker from "./components/InactivityTracker.jsx";
import HeartbeatTracker from "./components/HeartbeatTracker.jsx";
import { useEffect, useState } from "react";

// Component to track and persist the current route
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // List of user dashboard routes that should be persisted
    const userRoutes = [
      '/dashboard',
      '/profile',
      '/roles',
      '/suggestions',
      '/career-paths',
      '/settings'
    ];

    // Only save user routes, not login/signup/landing pages
    if (userRoutes.includes(location.pathname)) {
      localStorage.setItem('userActivePage', location.pathname);
    }
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const { isDarkMode, isThemeTransitioning } = useTheme();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  return (
    <Router>
      <MaintenanceModeChecker 
        setMaintenanceMode={setMaintenanceMode} 
        setLoading={setLoading}
        maintenanceMode={maintenanceMode}
        loading={loading}
        isDarkMode={isDarkMode}
        isThemeTransitioning={isThemeTransitioning}
      />
    </Router>
  );
}

function MaintenanceModeChecker({ setMaintenanceMode, setLoading, maintenanceMode, loading, isDarkMode, isThemeTransitioning }) {
  const location = useLocation();
  
  // Check maintenance mode on mount and when route changes
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      // Admin routes should always bypass maintenance mode
      if (location.pathname.startsWith('/admin')) {
        setMaintenanceMode(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/settings/system/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.maintenanceMode) {
            setMaintenanceMode(true);
          } else {
            setMaintenanceMode(false);
          }
        }
      } catch (error) {
        console.error('Failed to check maintenance mode:', error);
        setMaintenanceMode(false);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceMode();
  }, [location.pathname, setMaintenanceMode, setLoading]);

  // Show maintenance mode if enabled (but not for admin routes)
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Only show maintenance mode for non-admin routes
  if (maintenanceMode && !location.pathname.startsWith('/admin')) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <MaintenanceMode />
      </div>
    );
  }
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <RouteTracker />
      <InactivityTracker />
      <HeartbeatTracker />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roles" element={<RoleHistory />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/career-paths" element={<CareerPath />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/adminLogin" element={<AdminLogin />} />
        <Route path="/admin/adminPanel" element={<AdminPanel/>} />
        <Route path="/archived-account" element={<ArchivedAccount />} />
      </Routes>
      <Toaster 
        position="bottom-right" 
        richColors 
        expand={true}
        closeButton={false}
      />
      
      {/* Theme Transition Animation */}
      <AnimatePresence>
        {isThemeTransitioning && (
          <ThemeTransition isDarkMode={!isDarkMode} />
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  console.log('App rendering');
  
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;