/**
 * Get default route based on user role
 * @param {string} role - User role (e.g., 'member', 'church-admin', 'superadmin')
 * @returns {string} Default route for the role
 */
export function getDefaultRouteByRole(role) {
  switch (role) {
    case 'superadmin':
      return '/admin/adminPanel';
    case 'church-admin':
      return '/admin/adminPanel';
    case 'admin':
      return '/admin/adminPanel';
    case 'member':
    case 'student':
    case 'user':
    default:
      return '/dashboard';
  }
}

