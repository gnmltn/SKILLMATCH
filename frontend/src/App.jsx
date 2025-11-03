import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ThemeTransition from "./components/ThemeTransition.jsx";
import InactivityTracker from "./components/InactivityTracker.jsx";
import HeartbeatTracker from "./components/HeartbeatTracker.jsx";

function AppContent() {
  const { isDarkMode, isThemeTransitioning } = useTheme();
  
  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
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
    </Router>
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