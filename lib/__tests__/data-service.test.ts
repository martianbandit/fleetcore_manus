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
import {
  getVehicles,
  getVehicle,
  searchVehicles,
  getInspections,
  getDashboardStats,
} from '../data-service';
import { mockVehicles, mockInspections } from '../mock-data';

describe('Data Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock returns
    (AsyncStorage.getItem as any).mockImplementation((key: string) => {
      if (key === '@fleetcore/initialized') return Promise.resolve('true');
      if (key === '@fleetcore/vehicles') return Promise.resolve(JSON.stringify(mockVehicles));
      if (key === '@fleetcore/inspections') return Promise.resolve(JSON.stringify(mockInspections));
      return Promise.resolve(null);
    });
  });

  describe('getVehicles', () => {
    it('should return all vehicles', async () => {
      const vehicles = await getVehicles();
      expect(vehicles).toHaveLength(mockVehicles.length);
      expect(vehicles[0]).toHaveProperty('id');
      expect(vehicles[0]).toHaveProperty('plate');
      expect(vehicles[0]).toHaveProperty('vin');
    });

    it('should return vehicles with correct structure', async () => {
      const vehicles = await getVehicles();
      const vehicle = vehicles[0];
      expect(vehicle).toMatchObject({
        id: expect.any(String),
        vin: expect.any(String),
        plate: expect.any(String),
        unit: expect.any(String),
        vehicleClass: expect.any(String),
        make: expect.any(String),
        model: expect.any(String),
        year: expect.any(Number),
        status: expect.any(String),
      });
    });
  });

  describe('getVehicle', () => {
    it('should return a specific vehicle by id', async () => {
      const vehicle = await getVehicle('v1');
      expect(vehicle).not.toBeNull();
      expect(vehicle?.id).toBe('v1');
    });

    it('should return null for non-existent vehicle', async () => {
      const vehicle = await getVehicle('non-existent');
      expect(vehicle).toBeNull();
    });
  });

  describe('searchVehicles', () => {
    it('should search vehicles by plate', async () => {
      const results = await searchVehicles('ABC');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].plate).toContain('ABC');
    });

    it('should search vehicles by VIN', async () => {
      const results = await searchVehicles('1HGBH');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const results = await searchVehicles('ZZZZZ');
      expect(results).toHaveLength(0);
    });
  });

  describe('getInspections', () => {
    it('should return all inspections', async () => {
      const inspections = await getInspections();
      expect(inspections.length).toBeGreaterThan(0);
    });

    it('should return inspections with vehicle data', async () => {
      const inspections = await getInspections();
      const inspection = inspections.find(i => i.vehicleId === 'v1');
      expect(inspection?.vehicle).toBeDefined();
    });

    it('should return inspections with correct status types', async () => {
      const inspections = await getInspections();
      const validStatuses = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
      inspections.forEach(inspection => {
        expect(validStatuses).toContain(inspection.status);
      });
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const stats = await getDashboardStats();
      expect(stats).toHaveProperty('totalVehicles');
      expect(stats).toHaveProperty('activeVehicles');
      expect(stats).toHaveProperty('todayInspections');
      expect(stats).toHaveProperty('complianceScore');
    });

    it('should return valid numeric values', async () => {
      const stats = await getDashboardStats();
      expect(typeof stats.totalVehicles).toBe('number');
      expect(typeof stats.complianceScore).toBe('number');
      expect(stats.complianceScore).toBeGreaterThanOrEqual(0);
      expect(stats.complianceScore).toBeLessThanOrEqual(100);
    });
  });
});
