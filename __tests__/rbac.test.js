/**
 * RBAC module tests
 */

import {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessUserData
} from '../rbac.js';

describe('RBAC Module', () => {
  describe('ROLES', () => {
    test('should define all roles', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.MANAGER).toBe('manager');
      expect(ROLES.EMPLOYEE).toBe('employee');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    test('should have permissions for all roles', () => {
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
      expect(ROLE_PERMISSIONS.manager).toBeDefined();
      expect(ROLE_PERMISSIONS.employee).toBeDefined();
    });

    test('admin should have all permissions', () => {
      const adminPerms = ROLE_PERMISSIONS.admin;
      expect(adminPerms).toContain('view_all');
      expect(adminPerms).toContain('edit_all');
      expect(adminPerms).toContain('manage_users');
    });

    test('employee should have limited permissions', () => {
      const empPerms = ROLE_PERMISSIONS.employee;
      expect(empPerms).toContain('view_own');
      expect(empPerms).toContain('edit_own');
      expect(empPerms).not.toContain('manage_users');
    });
  });

  describe('hasPermission', () => {
    test('admin should have all permissions', () => {
      expect(hasPermission('admin', 'manage_users')).toBe(true);
      expect(hasPermission('admin', 'view_all')).toBe(true);
    });

    test('employee should not have admin permissions', () => {
      expect(hasPermission('employee', 'manage_users')).toBe(false);
      expect(hasPermission('employee', 'view_all')).toBe(false);
    });

    test('manager should have team permissions', () => {
      expect(hasPermission('manager', 'view_team')).toBe(true);
      expect(hasPermission('manager', 'edit_team')).toBe(true);
    });

    test('unknown role should have no permissions', () => {
      expect(hasPermission('unknown', 'any_permission')).toBe(false);
    });
  });

  describe('canAccessUserData', () => {
    test('admin should access any user data', () => {
      const result = canAccessUserData('admin', 'user-2', 'user-1', 'team-a', 'team-b');
      expect(result).toBe(true);
    });

    test('user should access own data', () => {
      const result = canAccessUserData('employee', 'user-1', 'user-1', 'team-a', 'team-a');
      expect(result).toBe(true);
    });

    test('employee should not access other employee data', () => {
      const result = canAccessUserData('employee', 'user-2', 'user-1', 'team-a', 'team-a');
      expect(result).toBe(false);
    });

    test('manager should access team member data', () => {
      const result = canAccessUserData('manager', 'user-2', 'user-1', 'team-a', 'team-a');
      expect(result).toBe(true);
    });

    test('manager should not access data from other teams', () => {
      const result = canAccessUserData('manager', 'user-2', 'user-1', 'team-b', 'team-a');
      expect(result).toBe(false);
    });

    test('manager should not access data without team assignment', () => {
      const result = canAccessUserData('manager', 'user-2', 'user-1', null, null);
      expect(result).toBe(false);
    });
  });
});
