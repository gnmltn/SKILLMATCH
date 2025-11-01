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
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
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

