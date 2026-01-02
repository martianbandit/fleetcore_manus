/**
 * Service de données de démonstration
 * Génère des données réalistes pour tester l'application
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  Vehicle, 
  Inspection, 
  VehicleStatus,
  InspectionStatus,
  InspectionType,
} from './types';

// Clé pour savoir si les données démo ont été chargées
const DEMO_DATA_LOADED_KEY = '@fleetcore_demo_loaded';

// Données de véhicules de démonstration
const DEMO_VEHICLES: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    unit: 'CAM-001',
    plate: 'ABC 123',
    vin: '1HGBH41JXMN109186',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    vehicleClass: 'A',
    companyId: 'demo_company',
    status: 'active' as VehicleStatus,
    mileage: 125000,
    lastInspectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastInspectionStatus: 'COMPLETED',
    nextInspectionDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    fuelType: 'diesel',
    notes: 'Véhicule principal pour les longues distances. Entretien régulier effectué.',
  },
  {
    unit: 'CAM-002',
    plate: 'DEF 456',
    vin: '2FMDK3GC8ABA12345',
    make: 'Kenworth',
    model: 'T680',
    year: 2021,
    vehicleClass: 'A',
    companyId: 'demo_company',
    status: 'active' as VehicleStatus,
    mileage: 98000,
    lastInspectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastInspectionStatus: 'BLOCKED',
    nextInspectionDue: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    fuelType: 'diesel',
    notes: 'Équipé du système de navigation avancé.',
  },
  {
    unit: 'REM-001',
    plate: 'GHI 789',
    vin: '3C6TRVDG5HE123456',
    make: 'Wabash',
    model: 'DuraPlate',
    year: 2020,
    vehicleClass: 'C',
    companyId: 'demo_company',
    status: 'active' as VehicleStatus,
    mileage: 180000,
    lastInspectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastInspectionStatus: 'COMPLETED',
    nextInspectionDue: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    fuelType: 'diesel',
    notes: 'Remorque frigorifique pour transport de denrées.',
  },
  {
    unit: 'CAM-003',
    plate: 'JKL 012',
    vin: '5YJSA1E26HF123789',
    make: 'Peterbilt',
    model: '579',
    year: 2023,
    vehicleClass: 'A',
    companyId: 'demo_company',
    status: 'maintenance' as VehicleStatus,
    mileage: 45000,
    lastInspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastInspectionStatus: 'DRAFT',
    nextInspectionDue: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    fuelType: 'diesel',
    notes: 'En maintenance préventive - changement de freins prévu.',
  },
  {
    unit: 'BUS-001',
    plate: 'MNO 345',
    vin: '1GDY7RFL9H1234567',
    make: 'Blue Bird',
    model: 'Vision',
    year: 2019,
    vehicleClass: 'D',
    companyId: 'demo_company',
    status: 'active' as VehicleStatus,
    mileage: 210000,
    lastInspectionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastInspectionStatus: 'COMPLETED',
    nextInspectionDue: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    fuelType: 'diesel',
    notes: 'Autobus scolaire - capacité 72 passagers.',
  },
];

// Générer un ID unique
function generateId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Générer des inspections de démonstration
function generateDemoInspections(vehicles: Vehicle[]): Inspection[] {
  const inspections: Inspection[] = [];
  const technicianNames = ['Jean Tremblay', 'Marie Dubois', 'Pierre Martin'];

  vehicles.forEach((vehicle, vIndex) => {
    // Inspection complétée sans défauts
    if (vIndex === 0) {
      inspections.push({
        id: generateId(),
        vehicleId: vehicle.id,
        type: 'periodic' as InspectionType,
        status: 'COMPLETED' as InspectionStatus,
        technicianId: 'tech_001',
        technicianName: technicianNames[0],
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        totalItems: 15,
        completedItems: 15,
        okCount: 15,
        minorDefectCount: 0,
        majorDefectCount: 0,
        notes: 'Inspection périodique complète. Véhicule en excellent état.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Inspection avec défaut majeur
    if (vIndex === 1) {
      inspections.push({
        id: generateId(),
        vehicleId: vehicle.id,
        type: 'pre_trip' as InspectionType,
        status: 'BLOCKED' as InspectionStatus,
        technicianId: 'tech_002',
        technicianName: technicianNames[1],
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        totalItems: 15,
        completedItems: 15,
        okCount: 14,
        minorDefectCount: 0,
        majorDefectCount: 1,
        notes: 'Défaut majeur détecté sur les freins. Véhicule immobilisé.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Inspection en cours
    if (vIndex === 2) {
      inspections.push({
        id: generateId(),
        vehicleId: vehicle.id,
        type: 'post_trip' as InspectionType,
        status: 'IN_PROGRESS' as InspectionStatus,
        technicianId: 'tech_003',
        technicianName: technicianNames[2],
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        totalItems: 15,
        completedItems: 8,
        okCount: 8,
        minorDefectCount: 0,
        majorDefectCount: 0,
        notes: null,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Inspection planifiée (brouillon)
    if (vIndex === 3) {
      inspections.push({
        id: generateId(),
        vehicleId: vehicle.id,
        type: 'periodic' as InspectionType,
        status: 'DRAFT' as InspectionStatus,
        technicianId: 'tech_001',
        technicianName: technicianNames[0],
        startedAt: new Date().toISOString(),
        completedAt: null,
        totalItems: 15,
        completedItems: 0,
        okCount: 0,
        minorDefectCount: 0,
        majorDefectCount: 0,
        notes: 'Inspection planifiée suite à la maintenance.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  return inspections;
}

/**
 * Charge les données de démonstration dans l'application
 */
export async function loadDemoData(): Promise<{ vehicles: number; inspections: number }> {
  try {
    // Générer les véhicules avec IDs
    const vehicles: Vehicle[] = DEMO_VEHICLES.map((v, index) => ({
      ...v,
      id: generateId(),
      createdAt: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Générer les inspections
    const inspections = generateDemoInspections(vehicles);

    // Sauvegarder les véhicules
    const existingVehiclesJson = await AsyncStorage.getItem('@fleetcore_vehicles');
    const existingVehicles: Vehicle[] = existingVehiclesJson ? JSON.parse(existingVehiclesJson) : [];
    const allVehicles = [...existingVehicles, ...vehicles];
    await AsyncStorage.setItem('@fleetcore_vehicles', JSON.stringify(allVehicles));

    // Sauvegarder les inspections
    const existingInspectionsJson = await AsyncStorage.getItem('@fleetcore_inspections');
    const existingInspections: Inspection[] = existingInspectionsJson ? JSON.parse(existingInspectionsJson) : [];
    const allInspections = [...existingInspections, ...inspections];
    await AsyncStorage.setItem('@fleetcore_inspections', JSON.stringify(allInspections));

    // Marquer les données démo comme chargées
    await AsyncStorage.setItem(DEMO_DATA_LOADED_KEY, 'true');

    return {
      vehicles: vehicles.length,
      inspections: inspections.length,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données démo:', error);
    throw error;
  }
}

/**
 * Vérifie si les données de démonstration ont déjà été chargées
 */
export async function isDemoDataLoaded(): Promise<boolean> {
  try {
    const loaded = await AsyncStorage.getItem(DEMO_DATA_LOADED_KEY);
    return loaded === 'true';
  } catch {
    return false;
  }
}

/**
 * Réinitialise toutes les données de l'application
 */
export async function resetAllData(): Promise<void> {
  try {
    const keysToRemove = [
      '@fleetcore_vehicles',
      '@fleetcore_inspections',
      '@fleetcore_settings',
      '@fleetcore_company',
      '@fleetcore_metrics',
      '@fleetcore_documents',
      '@fleetcore_work_orders',
      '@fleetcore_technicians',
      '@fleetcore_teams',
      '@fleetcore_audit_log',
      '@fleetcore_notifications',
      '@fleetcore_sync_queue',
      DEMO_DATA_LOADED_KEY,
    ];

    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des données:', error);
    throw error;
  }
}

/**
 * Supprime uniquement les données de démonstration
 */
export async function removeDemoData(): Promise<void> {
  try {
    // Récupérer les véhicules et filtrer ceux qui ne sont pas des démos
    const vehiclesJson = await AsyncStorage.getItem('@fleetcore_vehicles');
    if (vehiclesJson) {
      const vehicles: Vehicle[] = JSON.parse(vehiclesJson);
      const nonDemoVehicles = vehicles.filter(v => !v.id.startsWith('demo_'));
      await AsyncStorage.setItem('@fleetcore_vehicles', JSON.stringify(nonDemoVehicles));
    }

    // Récupérer les inspections et filtrer celles qui ne sont pas des démos
    const inspectionsJson = await AsyncStorage.getItem('@fleetcore_inspections');
    if (inspectionsJson) {
      const inspections: Inspection[] = JSON.parse(inspectionsJson);
      const nonDemoInspections = inspections.filter(i => !i.id.startsWith('demo_'));
      await AsyncStorage.setItem('@fleetcore_inspections', JSON.stringify(nonDemoInspections));
    }

    // Réinitialiser le flag
    await AsyncStorage.removeItem(DEMO_DATA_LOADED_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression des données démo:', error);
    throw error;
  }
}

/**
 * Obtenir des statistiques sur les données actuelles
 */
export async function getDataStats(): Promise<{
  vehiclesCount: number;
  inspectionsCount: number;
  demoVehiclesCount: number;
  demoInspectionsCount: number;
}> {
  try {
    const vehiclesJson = await AsyncStorage.getItem('@fleetcore_vehicles');
    const inspectionsJson = await AsyncStorage.getItem('@fleetcore_inspections');

    const vehicles: Vehicle[] = vehiclesJson ? JSON.parse(vehiclesJson) : [];
    const inspections: Inspection[] = inspectionsJson ? JSON.parse(inspectionsJson) : [];

    return {
      vehiclesCount: vehicles.length,
      inspectionsCount: inspections.length,
      demoVehiclesCount: vehicles.filter(v => v.id.startsWith('demo_')).length,
      demoInspectionsCount: inspections.filter(i => i.id.startsWith('demo_')).length,
    };
  } catch {
    return {
      vehiclesCount: 0,
      inspectionsCount: 0,
      demoVehiclesCount: 0,
      demoInspectionsCount: 0,
    };
  }
}
