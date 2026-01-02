/**
 * Tests unitaires pour les services FleetCore v1.0
 * 
 * - audit-service.ts
 * - sync-service.ts
 * - business-notification-service.ts
 * - reports-service.ts
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

// Mock notification-service pour éviter les imports expo
vi.mock('../lib/notification-service', () => ({
  notifySyncCompleted: vi.fn(),
  notifySyncFailed: vi.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// AUDIT SERVICE TESTS
// ============================================================================

describe('Audit Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  describe('logAuditEntry', () => {
    it('should create an audit entry with correct structure', async () => {
      const { logAuditEntry } = await import('../lib/audit-service');
      
      const entry = await logAuditEntry({
        action: 'CREATE',
        entityType: 'vehicle',
        entityId: 'v123',
        userId: 'user1',
        userName: 'Jean Dupont',
        userRole: 'technician',
        description: 'Création du véhicule ABC-123',
      });
      
      expect(entry).toHaveProperty('id');
      expect(entry.action).toBe('CREATE');
      expect(entry.entityType).toBe('vehicle');
      expect(entry.entityId).toBe('v123');
      expect(entry.userId).toBe('user1');
      expect(entry.userName).toBe('Jean Dupont');
      expect(entry.timestamp).toBeDefined();
    });

    it('should save audit entry to storage', async () => {
      const { logAuditEntry } = await import('../lib/audit-service');
      
      await logAuditEntry({
        action: 'UPDATE',
        entityType: 'inspection',
        entityId: 'i456',
        userId: 'user2',
        userName: 'Marie Martin',
        userRole: 'manager',
        description: 'Mise à jour de l\'inspection',
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getAuditLog', () => {
    it('should return empty array when no events', async () => {
      const { getAuditLog } = await import('../lib/audit-service');
      
      const events = await getAuditLog();
      
      expect(events).toEqual([]);
    });

    it('should return stored events', async () => {
      const mockEvents = [
        { id: '1', action: 'CREATE', entityType: 'vehicle', timestamp: '2024-01-01' },
        { id: '2', action: 'UPDATE', entityType: 'inspection', timestamp: '2024-01-02' },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockEvents));
      
      const { getAuditLog } = await import('../lib/audit-service');
      const events = await getAuditLog();
      
      expect(events).toHaveLength(2);
    });
  });

  describe('getAuditLogForEntity', () => {
    it('should filter by entity', async () => {
      const mockEvents = [
        { id: '1', action: 'CREATE', entityType: 'vehicle', entityId: 'v1', timestamp: '2024-01-01' },
        { id: '2', action: 'UPDATE', entityType: 'inspection', entityId: 'i1', timestamp: '2024-01-02' },
        { id: '3', action: 'DELETE', entityType: 'vehicle', entityId: 'v1', timestamp: '2024-01-03' },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockEvents));
      
      const { getAuditLogForEntity } = await import('../lib/audit-service');
      const events = await getAuditLogForEntity('vehicle', 'v1');
      
      expect(events).toHaveLength(2);
      expect(events.every((e: any) => e.entityType === 'vehicle' && e.entityId === 'v1')).toBe(true);
    });
  });

  describe('getAuditLogForUser', () => {
    it('should filter by user', async () => {
      const mockEvents = [
        { id: '1', action: 'CREATE', userId: 'user1', timestamp: '2024-01-01' },
        { id: '2', action: 'UPDATE', userId: 'user2', timestamp: '2024-01-02' },
        { id: '3', action: 'DELETE', userId: 'user1', timestamp: '2024-01-03' },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockEvents));
      
      const { getAuditLogForUser } = await import('../lib/audit-service');
      const events = await getAuditLogForUser('user1');
      
      expect(events).toHaveLength(2);
      expect(events.every((e: any) => e.userId === 'user1')).toBe(true);
    });
  });
});

// ============================================================================
// SYNC SERVICE TESTS
// ============================================================================

describe('Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  describe('queueAction', () => {
    it('should create a pending action', async () => {
      const { queueAction } = await import('../lib/sync-service');
      
      const action = await queueAction(
        'create',
        'vehicle',
        'v123',
        { plate: 'ABC-123' }
      );
      
      expect(action).toHaveProperty('id');
      expect(action.type).toBe('create');
      expect(action.entityType).toBe('vehicle');
      expect(action.entityId).toBe('v123');
      expect(action.status).toBe('pending');
      expect(action.retryCount).toBe(0);
    });
  });

  describe('getPendingActions', () => {
    it('should return empty array when no actions', async () => {
      const { getPendingActions } = await import('../lib/sync-service');
      
      const actions = await getPendingActions();
      
      expect(actions).toEqual([]);
    });

    it('should return stored actions', async () => {
      const mockActions = [
        { id: '1', type: 'create', status: 'pending' },
        { id: '2', type: 'update', status: 'pending' },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockActions));
      
      const { getPendingActions } = await import('../lib/sync-service');
      const actions = await getPendingActions();
      
      expect(actions).toHaveLength(2);
    });
  });

  describe('autosave', () => {
    it('should save data for recovery', async () => {
      const { autosave, getAutosave } = await import('../lib/sync-service');
      
      await autosave('inspection', 'i123', { progress: 50 });
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('markInspectionInterrupted', () => {
    it('should mark inspection as interrupted', async () => {
      const { markInspectionInterrupted, getInterruptedInspections } = await import('../lib/sync-service');
      
      await markInspectionInterrupted('i123', 'v456', 'ABC-123', 50, 'Batterie faible');
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('isDeviceOnline', () => {
    it('should return online status', async () => {
      const { isDeviceOnline } = await import('../lib/sync-service');
      
      const online = isDeviceOnline();
      
      expect(typeof online).toBe('boolean');
    });
  });
});

// ============================================================================
// BUSINESS NOTIFICATION SERVICE TESTS
// ============================================================================

describe('Business Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  describe('createNotification', () => {
    it('should create a notification with correct structure', async () => {
      const { createNotification } = await import('../lib/business-notification-service');
      
      const notification = await createNotification({
        type: 'inspection_overdue',
        priority: 'high',
        title: 'Inspection en retard',
        message: 'Le véhicule U-001 nécessite une inspection',
        roleTargets: ['manager', 'technician'],
        entityType: 'vehicle',
        entityId: 'v123',
      });
      
      expect(notification).toHaveProperty('id');
      expect(notification.type).toBe('inspection_overdue');
      expect(notification.priority).toBe('high');
      expect(notification.isRead).toBe(false);
      expect(notification.isDismissed).toBe(false);
    });
  });

  describe('markNotificationRead', () => {
    it('should mark notification as read', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'inspection_overdue', isRead: false },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockNotifications));
      
      const { markNotificationRead } = await import('../lib/business-notification-service');
      await markNotificationRead('n1');
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getNotificationCounts', () => {
    it('should return correct counts', async () => {
      const mockNotifications = [
        { id: 'n1', priority: 'critical', isRead: false, isDismissed: false },
        { id: 'n2', priority: 'high', isRead: true, isDismissed: false },
        { id: 'n3', priority: 'medium', isRead: false, isDismissed: false },
        { id: 'n4', priority: 'low', isRead: false, isDismissed: true },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockNotifications));
      
      const { getNotificationCounts } = await import('../lib/business-notification-service');
      const counts = await getNotificationCounts();
      
      expect(counts.total).toBe(3); // Excluding dismissed
      expect(counts.unread).toBe(2);
      expect(counts.critical).toBe(1);
      expect(counts.high).toBe(1);
      expect(counts.medium).toBe(1);
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct colors for priorities', async () => {
      const { getPriorityColor } = await import('../lib/business-notification-service');
      
      expect(getPriorityColor('critical')).toBe('#DC2626');
      expect(getPriorityColor('high')).toBe('#F59E0B');
      expect(getPriorityColor('medium')).toBe('#3B82F6');
      expect(getPriorityColor('low')).toBe('#10B981');
    });
  });

  describe('getPriorityLabel', () => {
    it('should return correct labels for priorities', async () => {
      const { getPriorityLabel } = await import('../lib/business-notification-service');
      
      expect(getPriorityLabel('critical')).toBe('Critique');
      expect(getPriorityLabel('high')).toBe('Élevée');
      expect(getPriorityLabel('medium')).toBe('Moyenne');
      expect(getPriorityLabel('low')).toBe('Faible');
    });
  });
});

// ============================================================================
// REPORTS SERVICE TESTS
// ============================================================================

describe('Reports Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  describe('exportReportToCSV', () => {
    it('should generate valid CSV', async () => {
      const { exportReportToCSV } = await import('../lib/reports-service');
      
      const report = {
        id: 'r1',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        totalInspections: 50,
        completedInspections: 45,
        blockedInspections: 5,
        complianceRate: 90,
        totalDefects: 20,
        minorDefects: 15,
        majorDefects: 4,
        blockingDefects: 1,
        resolvedDefects: 18,
        totalDowntimeHours: 48,
        averageInspectionTime: 35,
        totalMaintenanceCost: 5000,
        currency: 'CAD',
        generatedAt: '2024-02-01',
        generatedBy: 'system',
      };
      
      const csv = exportReportToCSV(report as any);
      
      expect(csv).toContain('Période');
      expect(csv).toContain('Inspections totales');
      expect(csv).toContain('50');
      expect(csv).toContain('90');
      expect(csv).toContain('5000 CAD');
    });
  });

  describe('exportFleetMetricsToCSV', () => {
    it('should generate valid CSV with vehicle data', async () => {
      const { exportFleetMetricsToCSV } = await import('../lib/reports-service');
      
      const metrics = [
        {
          vehicleId: 'v1',
          period: '30d',
          inspectionCount: 10,
          defectCount: 3,
          complianceRate: 95,
          downtimeHours: 8,
          defectTrend: 'stable',
          riskLevel: 'low',
        },
      ];
      
      const vehicles = [
        { id: 'v1', unit: 'U-001', plate: 'ABC-123' },
      ];
      
      const csv = exportFleetMetricsToCSV(metrics as any, vehicles as any);
      
      expect(csv).toContain('Véhicule');
      expect(csv).toContain('Plaque');
      expect(csv).toContain('U-001');
      expect(csv).toContain('ABC-123');
      expect(csv).toContain('95');
    });
  });

  describe('getReports', () => {
    it('should return empty array when no reports', async () => {
      const { getReports } = await import('../lib/reports-service');
      
      const reports = await getReports();
      
      expect(reports).toEqual([]);
    });

    it('should return stored reports', async () => {
      const mockReports = [
        { id: 'r1', periodStart: '2024-01-01' },
        { id: 'r2', periodStart: '2024-02-01' },
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockReports));
      
      const { getReports } = await import('../lib/reports-service');
      const reports = await getReports();
      
      expect(reports).toHaveLength(2);
    });
  });
});

// ============================================================================
// JOTFORM SERVICE TESTS
// ============================================================================

describe('Jotform Service', () => {
  describe('getFormUrl', () => {
    it('should return correct form URLs', async () => {
      const { getFormUrl } = await import('../lib/jotform-service');
      
      const dailyCheckUrl = getFormUrl('DAILY_INSPECTION');
      const defectUrl = getFormUrl('DEFECT_REPORT');
      const incidentUrl = getFormUrl('INCIDENT_REPORT');
      
      expect(dailyCheckUrl).toContain('jotform.com');
      expect(defectUrl).toContain('jotform.com');
      expect(incidentUrl).toContain('jotform.com');
    });
  });

  describe('JOTFORM_CONFIG', () => {
    it('should have form configurations', async () => {
      const { JOTFORM_CONFIG } = await import('../lib/jotform-service');
      
      expect(JOTFORM_CONFIG.DAILY_INSPECTION).toBeDefined();
      expect(JOTFORM_CONFIG.DAILY_INSPECTION).toHaveProperty('id');
      expect(JOTFORM_CONFIG.DAILY_INSPECTION).toHaveProperty('name');
    });
  });

  describe('getFormConfig', () => {
    it('should return form config for valid type', async () => {
      const { getFormConfig } = await import('../lib/jotform-service');
      
      const config = getFormConfig('DAILY_INSPECTION');
      
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('description');
    });
  });
});

// ============================================================================
// PERPLEXITY SERVICE TESTS
// ============================================================================

describe('Perplexity Service', () => {
  describe('performDiagnostic', () => {
    it('should be a function', async () => {
      const { performDiagnostic } = await import('../lib/perplexity-service');
      
      expect(typeof performDiagnostic).toBe('function');
    });
  });

  describe('getDiagnostics', () => {
    it('should return array from storage', async () => {
      const { getDiagnostics } = await import('../lib/perplexity-service');
      
      const diagnostics = await getDiagnostics();
      
      // Peut retourner un tableau vide ou des données mockées
      expect(Array.isArray(diagnostics)).toBe(true);
    });
  });

  describe('DiagnosticRequest interface', () => {
    it('should accept valid diagnostic request', async () => {
      const request = {
        vehicleId: 'v123',
        vehiclePlate: 'ABC-123',
        vehicleType: 'Camion lourd',
        vehicleYear: 2022,
        defectDescription: 'Bruit de freinage',
        defectCategory: 'freinage',
        defectSeverity: 'major' as const,
        location: 'Essieu avant',
      };
      
      expect(request.vehicleId).toBe('v123');
      expect(request.defectSeverity).toBe('major');
    });
  });
});
