import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

export default function HeartbeatTracker() {
  const location = useLocation();
  const intervalRef = useRef(null);

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
          return;
        }

        await fetch(`${API_BASE_URL}/users/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
        // Don't stop heartbeat on error - network issues might be temporary
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for heartbeat
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Cleanup on unmount or route change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [location.pathname]);

  // Also handle visibility change (when user switches tabs or minimizes browser)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (document.hidden) {
        // Page is hidden - could pause heartbeat, but keep it running
        // User is still considered "online" but might be inactive
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

  return null; // This component doesn't render anything
}

