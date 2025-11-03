import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds
const OFFLINE_TIMEOUT = 15000; // 15 seconds - mark offline if no heartbeat for this long

export default function HeartbeatTracker() {
  const location = useLocation();
  const intervalRef = useRef(null);
  const offlineTimeoutRef = useRef(null);
  const lastHeartbeatRef = useRef(Date.now());

  // Function to mark user as offline
  const markUserOffline = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use fetch with keepalive for reliability when page is closing
      // This ensures the request completes even if the page is closing
      await fetch(`${API_BASE_URL}/users/offline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        keepalive: true // Critical: ensures request completes even if page closes
      }).catch(() => {
        // Silently fail - page might be closing
      });
    } catch (error) {
      // Silently fail - page might be closing
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    // Don't track heartbeat on public routes
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/admin/adminLogin'];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!token || isPublicRoute) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
      return;
    }

    // Send heartbeat immediately
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Token removed, stop heartbeat
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current);
            offlineTimeoutRef.current = null;
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          lastHeartbeatRef.current = Date.now();
          
          // Reset offline timeout
          if (offlineTimeoutRef.current) {
            clearTimeout(offlineTimeoutRef.current);
          }
          
          // Set new offline timeout - if no heartbeat received in OFFLINE_TIMEOUT, mark as offline
          offlineTimeoutRef.current = setTimeout(() => {
            markUserOffline();
          }, OFFLINE_TIMEOUT);
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
        // Don't stop heartbeat on error - network issues might be temporary
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for heartbeat
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Set initial offline timeout
    offlineTimeoutRef.current = setTimeout(() => {
      markUserOffline();
    }, OFFLINE_TIMEOUT);

    // Cleanup on unmount or route change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
    };
  }, [location.pathname]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (document.hidden) {
        // Page is hidden - don't mark offline immediately, but check if heartbeat stops
        const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
        
        // If it's been a while since last heartbeat and page is hidden, mark offline
        if (timeSinceLastHeartbeat > OFFLINE_TIMEOUT) {
          markUserOffline();
        }
      } else {
        // Page is visible again - send immediate heartbeat
        fetch(`${API_BASE_URL}/users/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => console.error('Heartbeat on visibility change error:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle page close/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      markUserOffline();
    };

    const handlePageHide = () => {
      markUserOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return null; // This component doesn't render anything
}

