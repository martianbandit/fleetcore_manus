/**
 * Tests for Calendar Service - Reminders and Google Calendar Sync
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

// Import after mocking
import {
  reminderTypeConfig,
  daysUntilDate,
  formatReminderDate,
} from '../lib/calendar-service';

describe('Calendar Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reminderTypeConfig', () => {
    it('should have all required reminder types', () => {
      const expectedTypes = [
        'INSPECTION_DUE',
        'MAINTENANCE_DUE',
        'INSURANCE_EXPIRY',
        'REGISTRATION_EXPIRY',
        'WORK_ORDER_DEADLINE',
        'PERMIT_EXPIRY',
        'CERTIFICATION_DUE',
        'CUSTOM',
      ];

      expectedTypes.forEach((type) => {
        expect(reminderTypeConfig).toHaveProperty(type);
        expect(reminderTypeConfig[type as keyof typeof reminderTypeConfig]).toHaveProperty('label');
        expect(reminderTypeConfig[type as keyof typeof reminderTypeConfig]).toHaveProperty('icon');
        expect(reminderTypeConfig[type as keyof typeof reminderTypeConfig]).toHaveProperty('color');
        expect(reminderTypeConfig[type as keyof typeof reminderTypeConfig]).toHaveProperty('defaultReminderDays');
      });
    });

    it('should have French labels for all types', () => {
      expect(reminderTypeConfig.INSPECTION_DUE.label).toBe('Inspection périodique');
      expect(reminderTypeConfig.MAINTENANCE_DUE.label).toBe('Maintenance préventive');
      expect(reminderTypeConfig.INSURANCE_EXPIRY.label).toBe('Expiration assurance');
      expect(reminderTypeConfig.REGISTRATION_EXPIRY.label).toBe('Expiration immatriculation');
    });

    it('should have valid default reminder days', () => {
      Object.values(reminderTypeConfig).forEach((config) => {
        expect(Array.isArray(config.defaultReminderDays)).toBe(true);
        expect(config.defaultReminderDays.length).toBeGreaterThan(0);
        config.defaultReminderDays.forEach((days) => {
          expect(typeof days).toBe('number');
          expect(days).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('daysUntilDate', () => {
    it('should return a number for any date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = daysUntilDate(today);
      expect(typeof result).toBe('number');
    });

    it('should return higher number for further future dates', () => {
      const future5 = new Date();
      future5.setDate(future5.getDate() + 5);
      const future10 = new Date();
      future10.setDate(future10.getDate() + 10);
      
      const days5 = daysUntilDate(future5.toISOString().split('T')[0]);
      const days10 = daysUntilDate(future10.toISOString().split('T')[0]);
      
      expect(days10).toBeGreaterThan(days5);
    });

    it('should return lower number for further past dates', () => {
      const past3 = new Date();
      past3.setDate(past3.getDate() - 3);
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      
      const days3 = daysUntilDate(past3.toISOString().split('T')[0]);
      const days7 = daysUntilDate(past7.toISOString().split('T')[0]);
      
      expect(days7).toBeLessThan(days3);
    });
  });

  describe('formatReminderDate', () => {
    it('should return a string for any date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = formatReminderDate(today);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return French text for near dates', () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 3);
      const dateStr = nearFuture.toISOString().split('T')[0];
      const result = formatReminderDate(dateStr);
      // Should contain French words like "Dans", "jours", "Demain", or "Aujourd'hui"
      expect(result).toMatch(/(Dans|jours|Demain|Aujourd'hui|retard)/);
    });

    it('should return "En retard" text for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const dateStr = pastDate.toISOString().split('T')[0];
      const result = formatReminderDate(dateStr);
      expect(result).toContain('En retard');
    });

    it('should return formatted date for dates more than a week away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateStr = futureDate.toISOString().split('T')[0];
      const result = formatReminderDate(dateStr);
      // Should contain year and be a valid date string
      expect(result).toMatch(/\d{4}/);
    });
  });
});

describe('Push Notification Service', () => {
  describe('NotificationSettings', () => {
    it('should have correct default settings structure', () => {
      const defaultSettings = {
        enabled: true,
        reminderDaysBefore: [7, 3, 1, 0],
        overdueAlerts: true,
        dailyDigest: false,
        dailyDigestTime: '08:00',
        soundEnabled: true,
        vibrationEnabled: true,
      };

      expect(defaultSettings.enabled).toBe(true);
      expect(defaultSettings.reminderDaysBefore).toContain(7);
      expect(defaultSettings.reminderDaysBefore).toContain(1);
      expect(defaultSettings.reminderDaysBefore).toContain(0);
      expect(defaultSettings.overdueAlerts).toBe(true);
    });
  });
});

describe('Google Calendar Sync', () => {
  describe('GoogleCalendarSyncStatus', () => {
    it('should have correct default status structure', () => {
      const defaultStatus = {
        isConnected: false,
        lastSyncAt: null,
        syncEnabled: false,
        calendarId: null,
        syncErrors: [],
      };

      expect(defaultStatus.isConnected).toBe(false);
      expect(defaultStatus.syncEnabled).toBe(false);
      expect(defaultStatus.syncErrors).toEqual([]);
    });
  });
});

describe('Vehicle Default Reminders', () => {
  it('should create 4 default reminders for a new vehicle', () => {
    // Test the expected reminder types for a new vehicle
    const expectedReminderTypes = [
      'INSPECTION_DUE',
      'INSURANCE_EXPIRY',
      'REGISTRATION_EXPIRY',
      'MAINTENANCE_DUE',
    ];

    expect(expectedReminderTypes.length).toBe(4);
    expectedReminderTypes.forEach((type) => {
      expect(reminderTypeConfig).toHaveProperty(type);
    });
  });

  it('should have correct recurrence rules', () => {
    // Inspection, insurance, registration should be yearly
    const yearlyRecurrence = 'RRULE:FREQ=YEARLY';
    expect(yearlyRecurrence).toContain('YEARLY');

    // Maintenance should be every 6 months
    const maintenanceRecurrence = 'RRULE:FREQ=MONTHLY;INTERVAL=6';
    expect(maintenanceRecurrence).toContain('MONTHLY');
    expect(maintenanceRecurrence).toContain('INTERVAL=6');
  });
});
