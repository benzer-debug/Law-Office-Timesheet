/**
 * Role-Based Access Control (RBAC) Utilities
 * Handles user roles and permissions
 */

// Available roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  admin: ['view_all', 'edit_all', 'manage_users', 'manage_roles', 'view_reports'],
  manager: ['view_team', 'edit_team', 'view_reports'],
  employee: ['view_own', 'edit_own']
};

/**
 * Check if user has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if user can access another user's data
 * @param {string} currentUserRole - Current user's role
 * @param {string} targetUserId - ID of user to access
 * @param {string} currentUserId - Current user's ID
 * @param {string} targetUserTeamId - Target user's team ID
 * @param {string} currentUserTeamId - Current user's team ID
 * @returns {boolean}
 */
export function canAccessUserData(
  currentUserRole,
  targetUserId,
  currentUserId,
  targetUserTeamId,
  currentUserTeamId
) {
  // Admins can access anyone
  if (currentUserRole === ROLES.ADMIN) {
    return true;
  }

  // Users can always access their own data
  if (currentUserId === targetUserId) {
    return true;
  }

  // Managers can access their team members
  if (
    currentUserRole === ROLES.MANAGER &&
    currentUserTeamId &&
    currentUserTeamId === targetUserTeamId
  ) {
    return true;
  }

  return false;
}

/**
 * Get user's role from Firestore
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @returns {Promise<string>} User's role
 */
export async function getUserRole(db, userId) {
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data().role || ROLES.EMPLOYEE) : ROLES.EMPLOYEE;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return ROLES.EMPLOYEE;
  }
}
