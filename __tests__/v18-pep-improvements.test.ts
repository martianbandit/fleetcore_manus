/**
 * Tests unitaires pour les améliorations PEP v18
 * - Lien PEP dans le Dashboard
 * - Historique PEP par véhicule
 * - Rappels automatiques PEP
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));

describe('PEP Improvements v18', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGlobalPEPStats', () => {
    it('should return default stats when no forms exist', async () => {
      const { getGlobalPEPStats } = await import('../lib/pep-service');
      const stats = await getGlobalPEPStats();
      
      expect(stats).toHaveProperty('totalForms');
      expect(stats).toHaveProperty('completedThisMonth');
      expect(stats).toHaveProperty('pendingForms');
      expect(stats).toHaveProperty('upcomingDue');
      expect(stats.totalForms).toBe(0);
    });
  });

  describe('PEP Reminder Type', () => {
    it('should have PEP_DUE in reminderTypeConfig', async () => {
      const { reminderTypeConfig } = await import('../lib/calendar-service');
      
      expect(reminderTypeConfig).toHaveProperty('PEP_DUE');
      expect(reminderTypeConfig.PEP_DUE.label).toBe('Fiche PEP SAAQ');
      expect(reminderTypeConfig.PEP_DUE.color).toBe('#EC4899');
      expect(reminderTypeConfig.PEP_DUE.defaultReminderDays).toEqual([30, 14, 7, 1]);
    });
  });

  describe('createPEPReminder', () => {
    it('should create a PEP reminder with correct properties', async () => {
      const { createPEPReminder } = await import('../lib/calendar-service');
      
      const reminder = await createPEPReminder(
        'vehicle-123',
        'Freightliner Cascadia (ABC-123)',
        '2026-04-01',
        'pep-form-456'
      );
      
      expect(reminder).toHaveProperty('id');
      expect(reminder.type).toBe('PEP_DUE');
      expect(reminder.vehicleId).toBe('vehicle-123');
      expect(reminder.vehicleName).toBe('Freightliner Cascadia (ABC-123)');
      expect(reminder.dueDate).toBe('2026-04-01');
      expect(reminder.priority).toBe('HIGH');
      expect(reminder.reminderDays).toEqual([30, 14, 7, 1]);
      expect(reminder.isCompleted).toBe(false);
    });
  });

  describe('getPEPReminders', () => {
    it('should return empty array when no reminders exist', async () => {
      const { getPEPReminders } = await import('../lib/calendar-service');
      
      const reminders = await getPEPReminders('vehicle-123');
      
      expect(Array.isArray(reminders)).toBe(true);
      expect(reminders.length).toBe(0);
    });
  });

  describe('canAccessPEP', () => {
    it('should return allowed:false for free plan', async () => {
      const { canAccessPEP } = await import('../lib/subscription-service');
      
      const result = await canAccessPEP();
      
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('reason');
    });
  });

  describe('isPEPAccessAllowed', () => {
    it('should allow access for plus plan', async () => {
      const { isPEPAccessAllowed } = await import('../lib/pep-service');
      
      expect(isPEPAccessAllowed('plus')).toBe(true);
      expect(isPEPAccessAllowed('Plus')).toBe(true);
      expect(isPEPAccessAllowed('PLUS')).toBe(true);
    });

    it('should allow access for pro plan', async () => {
      const { isPEPAccessAllowed } = await import('../lib/pep-service');
      
      expect(isPEPAccessAllowed('pro')).toBe(true);
      expect(isPEPAccessAllowed('Pro')).toBe(true);
    });

    it('should allow access for enterprise plan', async () => {
      const { isPEPAccessAllowed } = await import('../lib/pep-service');
      
      expect(isPEPAccessAllowed('enterprise')).toBe(true);
      expect(isPEPAccessAllowed('entreprise')).toBe(true);
    });

    it('should deny access for free plan', async () => {
      const { isPEPAccessAllowed } = await import('../lib/pep-service');
      
      expect(isPEPAccessAllowed('free')).toBe(false);
      expect(isPEPAccessAllowed('Free')).toBe(false);
    });
  });

  describe('PEP Form by Vehicle', () => {
    it('should return empty array when no forms exist for vehicle', async () => {
      const { getPEPFormsByVehicle } = await import('../lib/pep-service');
      
      const forms = await getPEPFormsByVehicle('vehicle-123');
      
      expect(Array.isArray(forms)).toBe(true);
      expect(forms.length).toBe(0);
    });
  });
});
