const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Check if user is archived
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        if (data.isArchived) {
          localStorage.removeItem('token');
          // Store archived info before clearing user data
          if (data.user && data.user.archivedAt) {
            try {
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              currentUser.archivedAt = data.user.archivedAt;
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (e) {
              // If parsing fails, store minimal archived info
              localStorage.setItem('archivedInfo', JSON.stringify({ archivedAt: data.user.archivedAt }));
            }
          }
          localStorage.removeItem('user');
          window.location.href = '/archived-account';
          throw new Error('Account archived');
        }
      }
      
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    
    // Double-check archived status in response
    if (data.isArchived) {
      localStorage.removeItem('token');
      // Store archived info before clearing user data
      if (data.user && data.user.archivedAt) {
        try {
          localStorage.setItem('archivedInfo', JSON.stringify({ archivedAt: data.user.archivedAt }));
        } catch (e) {
          console.error('Failed to store archived info:', e);
        }
      }
      localStorage.removeItem('user');
      window.location.href = '/archived-account';
      throw new Error('Account archived');
    }
    
    return data;
  },

  async login(credentials) {
    // This is a placeholder - actual login is handled in Login.jsx
    // But keeping for API compatibility
    throw new Error('Use Login component for login');
  },

  async logout() {
    const token = localStorage.getItem('token');
    
    // Call logout endpoint to log activity
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to call logout endpoint:', error);
        // Continue with client-side logout even if API call fails
      }
    }

    // Always clear localStorage regardless of API call result
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export { apiService };

