import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DEFAULT_TIMEOUT = 30; // Default 30 minutes in case fetch fails
const DEFAULT_TIMEOUT_MS = DEFAULT_TIMEOUT * 60 * 1000; // Convert to milliseconds

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
  const sessionTimeoutMinutesRef = useRef(DEFAULT_TIMEOUT);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const lastTimerResetRef = useRef(0); // Track when timer was last reset to prevent spam

  // Fetch session timeout from settings
  useEffect(() => {
    const fetchSessionTimeout = async () => {
      try {
        // Try to fetch from authenticated endpoint first (for admin users)
        const adminToken = localStorage.getItem('adminToken');
        let response;
        
        if (adminToken) {
          // Use authenticated endpoint for admin users
          response = await fetch('http://localhost:5000/api/admin/settings/system', {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
        } else {
          // Use public endpoint as fallback
          response = await fetch('http://localhost:5000/api/admin/settings/system/public');
        }

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.sessionTimeout) {
            const timeoutMinutes = parseInt(data.data.sessionTimeout, 10);
            if (timeoutMinutes >= 1 && timeoutMinutes <= 480) {
              const oldTimeout = sessionTimeoutMinutesRef.current;
              // Only update and dispatch event if the value actually changed
              if (oldTimeout !== timeoutMinutes) {
                sessionTimeoutMinutesRef.current = timeoutMinutes;
                console.log(`✅ Session timeout updated from ${oldTimeout} to ${timeoutMinutes} minutes`);
                
                // Trigger immediate timer reset by dispatching a custom event
                // The main useEffect will listen for this and reset the timer
                window.dispatchEvent(new CustomEvent('sessionTimeoutUpdated'));
              }
            }
          }
        }
      } catch (error) {
        console.error('⚠️ Failed to fetch session timeout, using default:', error);
        sessionTimeoutMinutesRef.current = DEFAULT_TIMEOUT;
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSessionTimeout();
    
    // Refresh settings every 2 minutes to pick up changes (not too frequently to avoid unnecessary resets)
    const settingsRefreshInterval = setInterval(fetchSessionTimeout, 2 * 60 * 1000);
    
    return () => {
      clearInterval(settingsRefreshInterval);
    };
  }, []);

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
      // Prevent resetting timer too frequently (at least 2 seconds between resets)
      const now = Date.now();
      if (now - lastTimerResetRef.current < 2000) {
        return; // Skip reset if it was reset less than 2 seconds ago
      }
      lastTimerResetRef.current = now;

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

      // Get current session timeout from ref (in minutes, convert to milliseconds)
      const timeoutMs = sessionTimeoutMinutesRef.current * 60 * 1000;

      // Set new timeout for logout
      timeoutRef.current = setTimeout(() => {
        if (isActive) {
          console.log('⏰ Inactivity timeout reached, logging out...');
          handleLogout();
        }
      }, timeoutMs);

      console.log('🔄 Timer reset - will logout in', sessionTimeoutMinutesRef.current, 'minutes if inactive');
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

    // Listen for session timeout updates from settings fetch
    const handleSessionTimeoutUpdate = async () => {
      const isAdmin = isAdminRouteRef.current || localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        const token = localStorage.getItem('adminToken');
        if (token) {
          console.log('🔄 Session timeout settings changed, fetching new value...');
          try {
            const response = await fetch('http://localhost:5000/api/admin/settings/system', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data && data.data.sessionTimeout) {
                const timeoutMinutes = parseInt(data.data.sessionTimeout, 10);
                if (timeoutMinutes >= 1 && timeoutMinutes <= 480) {
                  const oldTimeout = sessionTimeoutMinutesRef.current;
                  if (oldTimeout !== timeoutMinutes) {
                    sessionTimeoutMinutesRef.current = timeoutMinutes;
                    console.log(`✅ Session timeout updated from ${oldTimeout} to ${timeoutMinutes} minutes`);
                  }
                  // Reset timer with new timeout
                  resetTimer();
                }
              }
            }
          } catch (error) {
            console.error('Failed to fetch updated session timeout:', error);
          }
        }
      }
    };

    window.addEventListener('sessionTimeoutUpdated', handleSessionTimeoutUpdate);

    // Listen for storage changes from other tabs (but don't auto-logout on storage events)
    // This allows tabs to coexist without interfering with each other
    // Only track for admin users
    const handleStorageChange = (e) => {
      if (!isActive) return;
      
      // Check if settings were updated (triggered by admin panel save)
      if (e.key === 'systemSettingsUpdated') {
        // Trigger immediate settings refresh
        console.log('🔔 Settings updated signal detected, refreshing session timeout');
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          fetch('http://localhost:5000/api/admin/settings/system', {
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data && data.data.sessionTimeout) {
              const timeoutMinutes = parseInt(data.data.sessionTimeout, 10);
              if (timeoutMinutes >= 1 && timeoutMinutes <= 480) {
                const oldTimeout = sessionTimeoutMinutesRef.current;
                if (oldTimeout !== timeoutMinutes) {
                  sessionTimeoutMinutesRef.current = timeoutMinutes;
                  console.log(`✅ Session timeout updated from ${oldTimeout} to ${timeoutMinutes} minutes`);
                  window.dispatchEvent(new CustomEvent('sessionTimeoutUpdated'));
                }
              }
            }
          })
          .catch(err => console.error('Failed to refresh settings:', err));
        }
      }
      
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
      window.removeEventListener('sessionTimeoutUpdated', handleSessionTimeoutUpdate);
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

