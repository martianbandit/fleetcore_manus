// FleetCore - Types et modèles de données

export type VehicleClass = 'A' | 'B' | 'C' | 'D' | 'E';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

export interface Vehicle {
  id: string;
  vin: string;
  plate: string;
  unit: string;
  vehicleClass: VehicleClass;
  make: string;
  model: string;
  year: number;
  companyId: string;
  status: VehicleStatus;
  lastInspectionDate: string | null;
  lastInspectionStatus: InspectionStatus | null;
  createdAt: string;
  updatedAt: string;
}

export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type InspectionType = 'periodic' | 'pre_trip' | 'post_trip' | 'incident';

export interface Inspection {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  technicianId: string;
  technicianName: string;
  type: InspectionType;
  status: InspectionStatus;
  startedAt: string;
  completedAt: string | null;
  totalItems: number;
  completedItems: number;
  okCount: number;
  minorDefectCount: number;
  majorDefectCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ItemStatus = 'pending' | 'ok' | 'minor_defect' | 'major_defect';

export interface ChecklistItem {
  id: string;
  inspectionId: string;
  sectionId: string;
  sectionName: string;
  itemNumber: number;
  title: string;
  description: string;
  status: ItemStatus;
  notes: string | null;
  mediaUrls: string[];
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistSection {
  id: string;
  name: string;
  order: number;
  items: ChecklistItem[];
}

export interface Action {
  id: string;
  inspectionId: string;
  checklistItemId: string;
  vehicleId: string;
  type: 'corrective' | 'preventive';
  severity: 'minor' | 'major';
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  todayInspections: number;
  pendingInspections: number;
  activeDefects: number;
  minorDefects: number;
  majorDefects: number;
  complianceScore: number;
  inspectionsThisWeek: number;
  inspectionsLastWeek: number;
}

export interface Alert {
  id: string;
  type: 'major_defect' | 'overdue_inspection' | 'blocked_inspection' | 'maintenance_due';
  severity: 'warning' | 'critical';
  title: string;
  message: string;
  vehicleId?: string;
  inspectionId?: string;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'inspection_started' | 'inspection_completed' | 'defect_found' | 'vehicle_added';
  title: string;
  description: string;
  timestamp: string;
  vehicleId?: string;
  inspectionId?: string;
}

// Checklist template pour générer les items d'inspection
export interface ChecklistTemplate {
  id: string;
  name: string;
  vehicleClasses: VehicleClass[];
  sections: {
    id: string;
    name: string;
    order: number;
    items: {
      id: string;
      title: string;
      description: string;
      isRequired: boolean;
    }[];
  }[];
}
