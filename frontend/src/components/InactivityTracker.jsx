import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 600000; // 10 minutes in milliseconds (10 * 60 * 1000)

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/login',
  '/signup',
  '/forgot-password',
  '/admin/adminLogin',
];

export default function InactivityTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const locationRef = useRef(location.pathname);

  // Update location ref when it changes
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    let isActive = true;

    const handleLogout = () => {
      if (!isActive) return;
      
      const currentPath = locationRef.current;
      const isAdmin = localStorage.getItem('isAdmin') === 'true' || 
                      currentPath.includes('/admin');

      console.log('🚪 Auto-logout triggered due to inactivity');
      
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');

      // Show logout message
      toast.warning('Session expired due to inactivity', {
        description: 'You have been automatically logged out.',
      });

      // Redirect based on user type
      if (isAdmin) {
        window.location.href = '/admin/adminLogin';
      } else {
        navigate('/');
      }
    };

    const resetTimer = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⏸️ No token found, stopping inactivity tracking');
        return; // No need to track if not logged in
      }

      // Check if user is on a public route
      const currentPath = locationRef.current;
      const isPublicRoute = PUBLIC_ROUTES.some(route => {
        // Exact match for root path
        if (route === '/') {
          return currentPath === '/' || currentPath === '/landing';
        }
        // Exact match or starts with for other routes (but not just '/')
        return currentPath === route || currentPath.startsWith(route + '/');
      });
      
      if (isPublicRoute) {
        console.log('⏸️ On public route (' + currentPath + '), stopping inactivity tracking');
        return; // Don't track inactivity on public routes
      }

      console.log('✅ Tracking inactivity on protected route:', currentPath);

      // Update last activity time
      lastActivityRef.current = Date.now();

      // Set new timeout for logout
      timeoutRef.current = setTimeout(() => {
        if (isActive) {
          console.log('⏰ Inactivity timeout reached, logging out...');
          handleLogout();
        }
      }, INACTIVITY_TIMEOUT);

      console.log('🔄 Timer reset - will logout in', INACTIVITY_TIMEOUT / 60000, 'minutes if inactive');
    };

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only process activity if at least 1 second has passed since last activity
      // This prevents rapid-fire resets
      if (timeSinceLastActivity >= 1000) {
        const token = localStorage.getItem('token');
        if (token) {
          resetTimer();
        }
      }
    };

    // List of events that indicate user activity
    // Removed 'mousemove', 'scroll', and 'wheel' as they fire too frequently
    const events = [
      'mousedown',
      'keypress',
      'touchstart',
      'click',
      'keydown',
      'focus',
    ];

    // Add event listeners with passive option for better performance
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true, capture: true });
    });

    // Initialize timer if user is logged in
    resetTimer();

    // Cleanup function
    return () => {
      isActive = false;
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, { capture: true });
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [location.pathname, navigate]);

  return null; // This component doesn't render anything
}

