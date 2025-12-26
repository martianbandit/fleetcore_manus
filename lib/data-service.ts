// FleetCore - Service de données avec AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Vehicle,
  Inspection,
  ChecklistItem,
  DashboardStats,
  Alert,
  RecentActivity,
  InspectionStatus,
  ItemStatus,
} from './types';
import {
  mockVehicles,
  mockInspections,
  mockDashboardStats,
  mockAlerts,
  mockRecentActivity,
  mockChecklistItems,
  mockChecklistTemplate,
} from './mock-data';

const STORAGE_KEYS = {
  VEHICLES: '@fleetcore/vehicles',
  INSPECTIONS: '@fleetcore/inspections',
  CHECKLIST_ITEMS: '@fleetcore/checklist_items',
  INITIALIZED: '@fleetcore/initialized',
};

// Initialiser les données mock si nécessaire
async function initializeData(): Promise<void> {
  const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(mockVehicles));
    await AsyncStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(mockInspections));
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(mockChecklistItems));
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Véhicules
export async function getVehicles(): Promise<Vehicle[]> {
  await initializeData();
  const data = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLES);
  return data ? JSON.parse(data) : [];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const vehicles = await getVehicles();
  return vehicles.find(v => v.id === id) || null;
}

export async function searchVehicles(query: string): Promise<Vehicle[]> {
  const vehicles = await getVehicles();
  const lowerQuery = query.toLowerCase();
  return vehicles.filter(v =>
    v.plate.toLowerCase().includes(lowerQuery) ||
    v.vin.toLowerCase().includes(lowerQuery) ||
    v.unit.toLowerCase().includes(lowerQuery) ||
    v.make.toLowerCase().includes(lowerQuery) ||
    v.model.toLowerCase().includes(lowerQuery)
  );
}

export async function addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
  const vehicles = await getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: `v${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  return newVehicle;
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
  const vehicles = await getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  vehicles[index] = {
    ...vehicles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  return vehicles[index];
}

// Inspections
export async function getInspections(): Promise<Inspection[]> {
  await initializeData();
  const data = await AsyncStorage.getItem(STORAGE_KEYS.INSPECTIONS);
  const inspections: Inspection[] = data ? JSON.parse(data) : [];
  
  // Enrichir avec les données véhicule
  const vehicles = await getVehicles();
  return inspections.map(inspection => ({
    ...inspection,
    vehicle: vehicles.find(v => v.id === inspection.vehicleId),
  }));
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const inspections = await getInspections();
  return inspections.find(i => i.id === id) || null;
}

export async function getInspectionsByStatus(status: InspectionStatus): Promise<Inspection[]> {
  const inspections = await getInspections();
  return inspections.filter(i => i.status === status);
}

export async function getInspectionsByVehicle(vehicleId: string): Promise<Inspection[]> {
  const inspections = await getInspections();
  return inspections.filter(i => i.vehicleId === vehicleId);
}

export async function createInspection(
  vehicleId: string,
  type: Inspection['type'],
  technicianName: string
): Promise<Inspection> {
  const inspections = await getInspections();
  const totalItems = mockChecklistTemplate.sections.reduce((acc, s) => acc + s.items.length, 0);
  
  const newInspection: Inspection = {
    id: `i${Date.now()}`,
    vehicleId,
    technicianId: 't1',
    technicianName,
    type,
    status: 'DRAFT',
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalItems,
    completedItems: 0,
    okCount: 0,
    minorDefectCount: 0,
    majorDefectCount: 0,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  inspections.push(newInspection);
  await AsyncStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
  
  // Créer les items de checklist
  await createChecklistItems(newInspection.id);
  
  return newInspection;
}

export async function updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.INSPECTIONS);
  const inspections: Inspection[] = data ? JSON.parse(data) : [];
  const index = inspections.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  inspections[index] = {
    ...inspections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
  
  // Mettre à jour le véhicule si l'inspection est complétée
  if (updates.status === 'COMPLETED' || updates.status === 'BLOCKED') {
    await updateVehicle(inspections[index].vehicleId, {
      lastInspectionDate: new Date().toISOString().split('T')[0],
      lastInspectionStatus: updates.status,
    });
  }
  
  return inspections[index];
}

// Checklist Items
async function createChecklistItems(inspectionId: string): Promise<void> {
  const items: ChecklistItem[] = mockChecklistTemplate.sections.flatMap((section, sectionIndex) =>
    section.items.map((item, itemIndex) => ({
      id: `cli-${inspectionId}-${section.id}-${item.id}`,
      inspectionId,
      sectionId: section.id,
      sectionName: section.name,
      itemNumber: sectionIndex * 10 + itemIndex + 1,
      title: item.title,
      description: item.description,
      status: 'pending' as ItemStatus,
      notes: null,
      mediaUrls: [],
      isRequired: item.isRequired,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );
  
  const existingData = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
  const existingItems: ChecklistItem[] = existingData ? JSON.parse(existingData) : [];
  await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify([...existingItems, ...items]));
}

export async function getChecklistItems(inspectionId: string): Promise<ChecklistItem[]> {
  await initializeData();
  const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
  const items: ChecklistItem[] = data ? JSON.parse(data) : [];
  return items.filter(item => item.inspectionId === inspectionId);
}

export async function updateChecklistItem(
  id: string,
  updates: Partial<ChecklistItem>
): Promise<ChecklistItem | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
  const items: ChecklistItem[] = data ? JSON.parse(data) : [];
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(items));
  
  // Mettre à jour les compteurs de l'inspection
  const inspectionId = items[index].inspectionId;
  const inspectionItems = items.filter(i => i.inspectionId === inspectionId);
  const completedItems = inspectionItems.filter(i => i.status !== 'pending').length;
  const okCount = inspectionItems.filter(i => i.status === 'ok').length;
  const minorDefectCount = inspectionItems.filter(i => i.status === 'minor_defect').length;
  const majorDefectCount = inspectionItems.filter(i => i.status === 'major_defect').length;
  
  let status: InspectionStatus = 'IN_PROGRESS';
  if (completedItems === inspectionItems.length) {
    status = majorDefectCount > 0 ? 'BLOCKED' : 'COMPLETED';
  }
  
  await updateInspection(inspectionId, {
    completedItems,
    okCount,
    minorDefectCount,
    majorDefectCount,
    status,
    completedAt: status === 'COMPLETED' || status === 'BLOCKED' ? new Date().toISOString() : null,
  });
  
  return items[index];
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const vehicles = await getVehicles();
  const inspections = await getInspections();
  
  const today = new Date().toISOString().split('T')[0];
  const todayInspections = inspections.filter(i => i.startedAt.startsWith(today));
  
  const activeDefects = inspections.reduce((acc, i) => acc + i.minorDefectCount + i.majorDefectCount, 0);
  const minorDefects = inspections.reduce((acc, i) => acc + i.minorDefectCount, 0);
  const majorDefects = inspections.reduce((acc, i) => acc + i.majorDefectCount, 0);
  
  const completedInspections = inspections.filter(i => i.status === 'COMPLETED').length;
  const complianceScore = inspections.length > 0 
    ? Math.round((completedInspections / inspections.length) * 100)
    : 100;
  
  return {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    todayInspections: todayInspections.length,
    pendingInspections: inspections.filter(i => i.status === 'IN_PROGRESS' || i.status === 'DRAFT').length,
    activeDefects,
    minorDefects,
    majorDefects,
    complianceScore,
    inspectionsThisWeek: mockDashboardStats.inspectionsThisWeek,
    inspectionsLastWeek: mockDashboardStats.inspectionsLastWeek,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  return mockAlerts;
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  return mockRecentActivity;
}

// Reset data (pour le développement)
export async function resetData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  await AsyncStorage.removeItem(STORAGE_KEYS.VEHICLES);
  await AsyncStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
  await AsyncStorage.removeItem(STORAGE_KEYS.CHECKLIST_ITEMS);
  await initializeData();
}
