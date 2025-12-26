import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInspections, getVehicles, getChecklistItems } from './data-service';
import type { Vehicle, Inspection } from './types';

const METRICS_KEY = '@fleetcore/metrics';
const WORK_TIME_KEY = '@fleetcore/work_time';

// ============================================================================
// Types
// ============================================================================

export interface ComponentWorkTime {
  id: string;
  inspectionId: string;
  vehicleId: string;
  componentId: string;
  componentName: string;
  startTime: string;
  endTime: string | null;
  duration: number; // seconds
  technicianId: string;
  technicianName: string;
  notes?: string;
}

export interface MaintenanceCost {
  id: string;
  vehicleId: string;
  inspectionId?: string;
  date: string;
  type: 'repair' | 'parts' | 'labor' | 'inspection' | 'other';
  amount: number;
  currency: string;
  description: string;
  componentId?: string;
}

export interface VehicleMetrics {
  vehicleId: string;
  totalInspections: number;
  totalDefects: number;
  minorDefects: number;
  majorDefects: number;
  totalMaintenanceCost: number;
  averageInspectionTime: number; // minutes
  lastInspectionDate: string | null;
  complianceRate: number; // percentage
  componentWorkTimes: Record<string, number>; // componentId -> total seconds
  defectsByComponent: Record<string, number>; // componentId -> defect count
}

export interface TechnicianMetrics {
  technicianId: string;
  technicianName: string;
  totalInspections: number;
  completedInspections: number;
  averageInspectionTime: number; // minutes
  defectsFound: number;
  vehiclesInspected: number;
  totalWorkTime: number; // hours
}

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalInspections: number;
  totalDefects: number;
  totalMaintenanceCost: number;
  averageVehicleAge: number;
  complianceRate: number;
  mostCommonDefects: Array<{ component: string; count: number }>;
  costByVehicle: Array<{ vehicleId: string; plate: string; cost: number }>;
  inspectionsByMonth: Array<{ month: string; count: number }>;
}

// ============================================================================
// Work Time Tracking
// ============================================================================

export async function startComponentWork(
  inspectionId: string,
  vehicleId: string,
  componentId: string,
  componentName: string,
  technicianId: string,
  technicianName: string
): Promise<ComponentWorkTime> {
  const workTime: ComponentWorkTime = {
    id: `wt-${Date.now()}`,
    inspectionId,
    vehicleId,
    componentId,
    componentName,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    technicianId,
    technicianName,
  };

  const data = await AsyncStorage.getItem(WORK_TIME_KEY);
  const workTimes: ComponentWorkTime[] = data ? JSON.parse(data) : [];
  workTimes.push(workTime);
  await AsyncStorage.setItem(WORK_TIME_KEY, JSON.stringify(workTimes));

  return workTime;
}

export async function endComponentWork(
  workTimeId: string,
  notes?: string
): Promise<ComponentWorkTime | null> {
  const data = await AsyncStorage.getItem(WORK_TIME_KEY);
  const workTimes: ComponentWorkTime[] = data ? JSON.parse(data) : [];
  
  const index = workTimes.findIndex(wt => wt.id === workTimeId);
  if (index === -1) return null;

  const endTime = new Date();
  const startTime = new Date(workTimes[index].startTime);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  workTimes[index] = {
    ...workTimes[index],
    endTime: endTime.toISOString(),
    duration,
    notes,
  };

  await AsyncStorage.setItem(WORK_TIME_KEY, JSON.stringify(workTimes));
  return workTimes[index];
}

export async function getWorkTimes(vehicleId?: string): Promise<ComponentWorkTime[]> {
  const data = await AsyncStorage.getItem(WORK_TIME_KEY);
  const workTimes: ComponentWorkTime[] = data ? JSON.parse(data) : [];
  return vehicleId ? workTimes.filter(wt => wt.vehicleId === vehicleId) : workTimes;
}

// ============================================================================
// Maintenance Costs
// ============================================================================

const COSTS_KEY = '@fleetcore/maintenance_costs';

export async function addMaintenanceCost(cost: Omit<MaintenanceCost, 'id'>): Promise<MaintenanceCost> {
  const newCost: MaintenanceCost = {
    ...cost,
    id: `cost-${Date.now()}`,
  };

  const data = await AsyncStorage.getItem(COSTS_KEY);
  const costs: MaintenanceCost[] = data ? JSON.parse(data) : [];
  costs.push(newCost);
  await AsyncStorage.setItem(COSTS_KEY, JSON.stringify(costs));

  return newCost;
}

export async function getMaintenanceCosts(vehicleId?: string): Promise<MaintenanceCost[]> {
  const data = await AsyncStorage.getItem(COSTS_KEY);
  const costs: MaintenanceCost[] = data ? JSON.parse(data) : [];
  return vehicleId ? costs.filter(c => c.vehicleId === vehicleId) : costs;
}

// ============================================================================
// Vehicle Metrics
// ============================================================================

export async function getVehicleMetrics(vehicleId: string): Promise<VehicleMetrics> {
  const inspections = await getInspections();
  const vehicleInspections = inspections.filter(i => i.vehicleId === vehicleId);
  const workTimes = await getWorkTimes(vehicleId);
  const costs = await getMaintenanceCosts(vehicleId);

  // Calculate component work times
  const componentWorkTimes: Record<string, number> = {};
  workTimes.forEach(wt => {
    if (!componentWorkTimes[wt.componentId]) {
      componentWorkTimes[wt.componentId] = 0;
    }
    componentWorkTimes[wt.componentId] += wt.duration;
  });

  // Calculate defects by component
  const defectsByComponent: Record<string, number> = {};
  for (const inspection of vehicleInspections) {
    const items = await getChecklistItems(inspection.id);
    items.forEach(item => {
      if (item.status === 'minor_defect' || item.status === 'major_defect') {
        const key = item.sectionId;
        if (!defectsByComponent[key]) {
          defectsByComponent[key] = 0;
        }
        defectsByComponent[key]++;
      }
    });
  }

  const totalDefects = vehicleInspections.reduce(
    (sum, i) => sum + i.minorDefectCount + i.majorDefectCount,
    0
  );
  const minorDefects = vehicleInspections.reduce((sum, i) => sum + i.minorDefectCount, 0);
  const majorDefects = vehicleInspections.reduce((sum, i) => sum + i.majorDefectCount, 0);

  const completedInspections = vehicleInspections.filter(i => i.status === 'COMPLETED').length;
  const complianceRate = vehicleInspections.length > 0
    ? Math.round((completedInspections / vehicleInspections.length) * 100)
    : 100;

  const totalInspectionTime = workTimes.reduce((sum, wt) => sum + wt.duration, 0);
  const averageInspectionTime = vehicleInspections.length > 0
    ? Math.round(totalInspectionTime / vehicleInspections.length / 60)
    : 0;

  const totalMaintenanceCost = costs.reduce((sum, c) => sum + c.amount, 0);

  const lastInspection = vehicleInspections.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )[0];

  return {
    vehicleId,
    totalInspections: vehicleInspections.length,
    totalDefects,
    minorDefects,
    majorDefects,
    totalMaintenanceCost,
    averageInspectionTime,
    lastInspectionDate: lastInspection?.startedAt || null,
    complianceRate,
    componentWorkTimes,
    defectsByComponent,
  };
}

// ============================================================================
// Technician Metrics
// ============================================================================

export async function getTechnicianMetrics(technicianId: string): Promise<TechnicianMetrics> {
  const inspections = await getInspections();
  const techInspections = inspections.filter(i => i.technicianId === technicianId);
  const workTimes = await getWorkTimes();
  const techWorkTimes = workTimes.filter(wt => wt.technicianId === technicianId);

  const completedInspections = techInspections.filter(i => i.status === 'COMPLETED').length;
  const defectsFound = techInspections.reduce(
    (sum, i) => sum + i.minorDefectCount + i.majorDefectCount,
    0
  );

  const uniqueVehicles = new Set(techInspections.map(i => i.vehicleId));
  const totalWorkTime = techWorkTimes.reduce((sum, wt) => sum + wt.duration, 0) / 3600; // hours

  const averageInspectionTime = techInspections.length > 0
    ? Math.round(techWorkTimes.reduce((sum, wt) => sum + wt.duration, 0) / techInspections.length / 60)
    : 0;

  const technicianName = techInspections[0]?.technicianName || 'Unknown';

  return {
    technicianId,
    technicianName,
    totalInspections: techInspections.length,
    completedInspections,
    averageInspectionTime,
    defectsFound,
    vehiclesInspected: uniqueVehicles.size,
    totalWorkTime,
  };
}

// ============================================================================
// Fleet Metrics
// ============================================================================

export async function getFleetMetrics(): Promise<FleetMetrics> {
  const vehicles = await getVehicles();
  const inspections = await getInspections();
  const costs = await getMaintenanceCosts();

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const totalDefects = inspections.reduce(
    (sum, i) => sum + i.minorDefectCount + i.majorDefectCount,
    0
  );
  const totalMaintenanceCost = costs.reduce((sum, c) => sum + c.amount, 0);

  const currentYear = new Date().getFullYear();
  const averageVehicleAge = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (currentYear - v.year), 0) / vehicles.length)
    : 0;

  const completedInspections = inspections.filter(i => i.status === 'COMPLETED').length;
  const complianceRate = inspections.length > 0
    ? Math.round((completedInspections / inspections.length) * 100)
    : 100;

  // Most common defects
  const defectCounts: Record<string, number> = {};
  for (const inspection of inspections) {
    const items = await getChecklistItems(inspection.id);
    items.forEach(item => {
      if (item.status === 'minor_defect' || item.status === 'major_defect') {
        const key = item.sectionName;
        if (!defectCounts[key]) {
          defectCounts[key] = 0;
        }
        defectCounts[key]++;
      }
    });
  }

  const mostCommonDefects = Object.entries(defectCounts)
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Cost by vehicle
  const costByVehicleMap: Record<string, number> = {};
  costs.forEach(cost => {
    if (!costByVehicleMap[cost.vehicleId]) {
      costByVehicleMap[cost.vehicleId] = 0;
    }
    costByVehicleMap[cost.vehicleId] += cost.amount;
  });

  const costByVehicle = Object.entries(costByVehicleMap)
    .map(([vehicleId, cost]) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      return { vehicleId, plate: vehicle?.plate || 'Unknown', cost };
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  // Inspections by month (last 12 months)
  const inspectionsByMonth: Array<{ month: string; count: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
    const count = inspections.filter(insp => insp.startedAt.startsWith(monthKey)).length;
    inspectionsByMonth.push({
      month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      count,
    });
  }

  return {
    totalVehicles: vehicles.length,
    activeVehicles,
    totalInspections: inspections.length,
    totalDefects,
    totalMaintenanceCost,
    averageVehicleAge,
    complianceRate,
    mostCommonDefects,
    costByVehicle,
    inspectionsByMonth,
  };
}

// ============================================================================
// Export Metrics
// ============================================================================

export async function exportMetricsCSV(): Promise<string> {
  const fleetMetrics = await getFleetMetrics();
  const vehicles = await getVehicles();
  
  let csv = 'Type,Vehicle,Metric,Value\n';
  
  for (const vehicle of vehicles) {
    const metrics = await getVehicleMetrics(vehicle.id);
    csv += `Vehicle,${vehicle.plate},Total Inspections,${metrics.totalInspections}\n`;
    csv += `Vehicle,${vehicle.plate},Total Defects,${metrics.totalDefects}\n`;
    csv += `Vehicle,${vehicle.plate},Maintenance Cost,${metrics.totalMaintenanceCost}\n`;
    csv += `Vehicle,${vehicle.plate},Compliance Rate,${metrics.complianceRate}%\n`;
  }
  
  return csv;
}
