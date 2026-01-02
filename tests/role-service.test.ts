/**
 * Tests pour le service de gestion des rôles
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

import {
  ROLE_CONFIGS,
  hasPermission,
  getRolePermissions,
  type UserRole,
  type Feature,
  type Permission,
} from '../lib/role-service';

describe('Role Service', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('ROLE_CONFIGS', () => {
    it('should define all 5 roles', () => {
      const roles: UserRole[] = ['admin', 'manager', 'dispatcher', 'technician', 'driver'];
      roles.forEach(role => {
        expect(ROLE_CONFIGS[role]).toBeDefined();
        expect(ROLE_CONFIGS[role].id).toBe(role);
        expect(ROLE_CONFIGS[role].nameFr).toBeTruthy();
        expect(ROLE_CONFIGS[role].dashboardRoute).toBeTruthy();
      });
    });

    it('should have correct dashboard routes for each role', () => {
      expect(ROLE_CONFIGS.admin.dashboardRoute).toBe('/dashboard/admin');
      expect(ROLE_CONFIGS.manager.dashboardRoute).toBe('/dashboard/manager');
      expect(ROLE_CONFIGS.dispatcher.dashboardRoute).toBe('/dashboard/dispatcher');
      expect(ROLE_CONFIGS.technician.dashboardRoute).toBe('/dashboard/technician');
      expect(ROLE_CONFIGS.driver.dashboardRoute).toBe('/dashboard/driver');
    });

    it('should have unique colors for each role', () => {
      const colors = Object.values(ROLE_CONFIGS).map(config => config.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin on common features', () => {
      // Admin has CRUD on vehicles, inspections, workOrders
      expect(hasPermission('admin', 'vehicles', 'create')).toBe(true);
      expect(hasPermission('admin', 'vehicles', 'read')).toBe(true);
      expect(hasPermission('admin', 'vehicles', 'update')).toBe(true);
      expect(hasPermission('admin', 'vehicles', 'delete')).toBe(true);
      expect(hasPermission('admin', 'inspections', 'create')).toBe(true);
      expect(hasPermission('admin', 'workOrders', 'create')).toBe(true);
      expect(hasPermission('admin', 'users', 'create')).toBe(true);
    });

    it('should return false for driver on restricted features', () => {
      expect(hasPermission('driver', 'users', 'create')).toBe(false);
      expect(hasPermission('driver', 'settings', 'update')).toBe(false);
      expect(hasPermission('driver', 'audit', 'read')).toBe(false);
    });

    it('should allow driver to read vehicles and update missions', () => {
      expect(hasPermission('driver', 'vehicles', 'read')).toBe(true);
      expect(hasPermission('driver', 'missions', 'read')).toBe(true);
      expect(hasPermission('driver', 'missions', 'update')).toBe(true);
    });

    it('should allow technician to create inspections', () => {
      expect(hasPermission('technician', 'inspections', 'create')).toBe(true);
      expect(hasPermission('technician', 'inspections', 'read')).toBe(true);
      expect(hasPermission('technician', 'inspections', 'update')).toBe(true);
    });

    it('should allow dispatcher to manage missions', () => {
      expect(hasPermission('dispatcher', 'missions', 'create')).toBe(true);
      expect(hasPermission('dispatcher', 'missions', 'read')).toBe(true);
      expect(hasPermission('dispatcher', 'missions', 'update')).toBe(true);
      expect(hasPermission('dispatcher', 'missions', 'delete')).toBe(true);
    });

    it('should allow manager to approve work orders', () => {
      expect(hasPermission('manager', 'workOrders', 'approve')).toBe(true);
      expect(hasPermission('manager', 'inspections', 'approve')).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions object for admin', () => {
      const perms = getRolePermissions('admin');
      expect(perms).toBeDefined();
      expect(perms.vehicles).toBeDefined();
      expect(perms.users).toBeDefined();
    });

    it('should return empty permissions for driver on billing', () => {
      const perms = getRolePermissions('driver');
      expect(perms.billing).toEqual([]);
    });

    it('should return missions permissions for dispatcher', () => {
      const perms = getRolePermissions('dispatcher');
      expect(perms.missions).toContain('create');
      expect(perms.missions).toContain('read');
    });

    it('should not include users permissions for technician', () => {
      const perms = getRolePermissions('technician');
      expect(perms.users).toEqual([]);
    });
  });

  describe('Role hierarchy', () => {
    it('admin should have more permissions than manager', () => {
      const adminPerms = Object.values(ROLE_CONFIGS.admin.permissions).flat().length;
      const managerPerms = Object.values(ROLE_CONFIGS.manager.permissions).flat().length;
      expect(adminPerms).toBeGreaterThanOrEqual(managerPerms);
    });

    it('manager should have more permissions than dispatcher', () => {
      const managerPerms = Object.values(ROLE_CONFIGS.manager.permissions).flat().length;
      const dispatcherPerms = Object.values(ROLE_CONFIGS.dispatcher.permissions).flat().length;
      expect(managerPerms).toBeGreaterThanOrEqual(dispatcherPerms);
    });

    it('technician should have more permissions than driver', () => {
      const techPerms = Object.values(ROLE_CONFIGS.technician.permissions).flat().length;
      const driverPerms = Object.values(ROLE_CONFIGS.driver.permissions).flat().length;
      expect(techPerms).toBeGreaterThanOrEqual(driverPerms);
    });
  });
});
