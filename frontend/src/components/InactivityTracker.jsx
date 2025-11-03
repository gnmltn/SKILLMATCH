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
  const isAdminRouteRef = useRef(false);

  // Update location ref when it changes
  useEffect(() => {
    locationRef.current = location.pathname;
    isAdminRouteRef.current = location.pathname.includes('/admin');
  }, [location.pathname]);

  useEffect(() => {
    let isActive = true;

    const handleLogout = async () => {
      if (!isActive) return;
      
      const currentPath = locationRef.current;
      const isAdmin = isAdminRouteRef.current || 
                      localStorage.getItem('isAdmin') === 'true';

      console.log('🚪 Auto-logout triggered due to inactivity');

      // Clear only the appropriate authentication data based on route
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isAdmin');
        toast.warning('Session expired due to inactivity', {
          description: 'You have been automatically logged out.',
        });
        window.location.href = '/admin/adminLogin';
      } else {
        const token = localStorage.getItem('token');
        
        // Call logout API to log inactivity logout activity
        if (token) {
          try {
            await fetch('http://localhost:5000/api/users/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: 'inactivity' })
            });
          } catch (error) {
            console.error('Failed to call logout endpoint:', error);
            // Continue with logout even if API call fails
          }
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.warning('Session expired due to inactivity', {
          description: 'You have been automatically logged out.',
        });
        navigate('/');
      }
    };

    const resetTimer = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Check if user is on a public route FIRST - don't do any tracking on public routes
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

      // Check if user is logged in - use appropriate token based on route
      const isAdmin = isAdminRouteRef.current || localStorage.getItem('isAdmin') === 'true';
      
      // Use adminToken for admin routes, token for student routes
      const token = isAdmin 
        ? localStorage.getItem('adminToken')
        : localStorage.getItem('token');
        
      if (!token) {
        console.log('⏸️ No token found, stopping inactivity tracking');
        return; // No need to track if not logged in
      }

      // Only track inactivity for admin users - regular users don't need automatic logout
      if (!isAdmin) {
        console.log('⏸️ Regular user session - inactivity tracking disabled');
        return; // Don't track inactivity for regular users
      }

      console.log('✅ Tracking inactivity on protected route:', currentPath, '(Admin)');

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
        // Check if we're on a public route first - don't track activity on public routes
        const currentPath = locationRef.current;
        const isPublicRoute = PUBLIC_ROUTES.some(route => {
          if (route === '/') {
            return currentPath === '/' || currentPath === '/landing';
          }
          return currentPath === route || currentPath.startsWith(route + '/');
        });
        
        if (isPublicRoute) {
          return; // Don't track activity on public routes
        }
        
        const isAdmin = isAdminRouteRef.current || localStorage.getItem('isAdmin') === 'true';
        // Only track activity for admin users
        if (isAdmin) {
          const token = localStorage.getItem('adminToken');
          if (token) {
            resetTimer();
          }
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

    // Listen for storage changes from other tabs (but don't auto-logout on storage events)
    // This allows tabs to coexist without interfering with each other
    // Only track for admin users
    const handleStorageChange = (e) => {
      if (!isActive) return;
      
      // Only react if admin token was removed by another tab
      const isAdmin = isAdminRouteRef.current || localStorage.getItem('isAdmin') === 'true';
      
      if (isAdmin && (e.key === 'adminToken' || e.key === null)) {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          // Token was removed by another tab, reset timer to stop tracking
          console.log('🔔 Admin token removed in another tab, stopping inactivity tracking');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
      // Regular users don't need to track storage changes for inactivity
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      isActive = false;
      window.removeEventListener('storage', handleStorageChange);
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

