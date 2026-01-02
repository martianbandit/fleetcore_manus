import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';

export type TechnicianSpecialty = 
  | 'general'
  | 'engine'
  | 'brakes'
  | 'electrical'
  | 'transmission'
  | 'suspension'
  | 'tires'
  | 'bodywork'
  | 'hvac';

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  specialties: TechnicianSpecialty[];
  teamId?: string;
  avatarUrl?: string;
  hireDate: string;
  isActive: boolean;
  certifications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  technicianId: string;
  teamId?: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: {
    vehicles: { create: boolean; read: boolean; update: boolean; delete: boolean };
    inspections: { create: boolean; read: boolean; update: boolean; delete: boolean };
    workOrders: { create: boolean; read: boolean; update: boolean; delete: boolean };
    inventory: { create: boolean; read: boolean; update: boolean; delete: boolean };
    technicians: { create: boolean; read: boolean; update: boolean; delete: boolean };
    teams: { create: boolean; read: boolean; update: boolean; delete: boolean };
    reports: { create: boolean; read: boolean; update: boolean; delete: boolean };
    settings: { create: boolean; read: boolean; update: boolean; delete: boolean };
  };
}

export interface TechnicianStats {
  totalInspections: number;
  completedInspections: number;
  averageInspectionTime: number; // minutes
  defectsFound: number;
  vehiclesAssigned: number;
  workOrdersCompleted: number;
  totalWorkHours: number;
}

export interface TeamStats {
  memberCount: number;
  totalInspections: number;
  vehiclesAssigned: number;
  workOrdersCompleted: number;
  averagePerformance: number; // percentage
}

// ============================================================================
// Storage Keys
// ============================================================================

const TECHNICIANS_KEY = '@fleetcore/technicians';
const TEAMS_KEY = '@fleetcore/teams';
const ASSIGNMENTS_KEY = '@fleetcore/vehicle_assignments';
const PERMISSIONS_KEY = '@fleetcore/role_permissions';

// ============================================================================
// Default Permissions
// ============================================================================

const defaultPermissions: RolePermission[] = [
  {
    role: 'admin',
    permissions: {
      vehicles: { create: true, read: true, update: true, delete: true },
      inspections: { create: true, read: true, update: true, delete: true },
      workOrders: { create: true, read: true, update: true, delete: true },
      inventory: { create: true, read: true, update: true, delete: true },
      technicians: { create: true, read: true, update: true, delete: true },
      teams: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
    },
  },
  {
    role: 'manager',
    permissions: {
      vehicles: { create: true, read: true, update: true, delete: false },
      inspections: { create: true, read: true, update: true, delete: true },
      workOrders: { create: true, read: true, update: true, delete: true },
      inventory: { create: true, read: true, update: true, delete: false },
      technicians: { create: true, read: true, update: true, delete: false },
      teams: { create: true, read: true, update: true, delete: false },
      reports: { create: true, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    role: 'technician',
    permissions: {
      vehicles: { create: false, read: true, update: false, delete: false },
      inspections: { create: true, read: true, update: true, delete: false },
      workOrders: { create: true, read: true, update: true, delete: false },
      inventory: { create: false, read: true, update: true, delete: false },
      technicians: { create: false, read: true, update: false, delete: false },
      teams: { create: false, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    role: 'viewer',
    permissions: {
      vehicles: { create: false, read: true, update: false, delete: false },
      inspections: { create: false, read: true, update: false, delete: false },
      workOrders: { create: false, read: true, update: false, delete: false },
      inventory: { create: false, read: true, update: false, delete: false },
      technicians: { create: false, read: true, update: false, delete: false },
      teams: { create: false, read: true, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
    },
  },
];

// ============================================================================
// Specialty Labels
// ============================================================================

export const specialtyLabels: Record<TechnicianSpecialty, string> = {
  general: 'Général',
  engine: 'Moteur',
  brakes: 'Freins',
  electrical: 'Électrique',
  transmission: 'Transmission',
  suspension: 'Suspension',
  tires: 'Pneus',
  bodywork: 'Carrosserie',
  hvac: 'Climatisation',
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  technician: 'Technicien',
  viewer: 'Observateur',
};

// ============================================================================
// Technician Functions
// ============================================================================

export async function getTechnicians(): Promise<Technician[]> {
  const data = await AsyncStorage.getItem(TECHNICIANS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getTechnicianById(id: string): Promise<Technician | null> {
  const technicians = await getTechnicians();
  return technicians.find(t => t.id === id) || null;
}

export async function addTechnician(technician: Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>): Promise<Technician> {
  const technicians = await getTechnicians();
  const now = new Date().toISOString();
  
  const newTechnician: Technician = {
    ...technician,
    id: `tech-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  technicians.push(newTechnician);
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
  
  return newTechnician;
}

export async function updateTechnician(id: string, updates: Partial<Technician>): Promise<Technician | null> {
  const technicians = await getTechnicians();
  const index = technicians.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  technicians[index] = {
    ...technicians[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
  return technicians[index];
}

export async function deleteTechnician(id: string): Promise<boolean> {
  const technicians = await getTechnicians();
  const filtered = technicians.filter(t => t.id !== id);
  
  if (filtered.length === technicians.length) return false;
  
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(filtered));
  
  // Also remove assignments
  const assignments = await getAssignments();
  const filteredAssignments = assignments.filter(a => a.technicianId !== id);
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(filteredAssignments));
  
  return true;
}

export async function getTechniciansByTeam(teamId: string): Promise<Technician[]> {
  const technicians = await getTechnicians();
  return technicians.filter(t => t.teamId === teamId);
}

export async function getTechnicianStats(technicianId: string): Promise<TechnicianStats> {
  const assignments = await getAssignmentsByTechnician(technicianId);
  
  // In a real app, these would be calculated from actual data
  return {
    totalInspections: Math.floor(Math.random() * 100) + 10,
    completedInspections: Math.floor(Math.random() * 80) + 10,
    averageInspectionTime: Math.floor(Math.random() * 30) + 15,
    defectsFound: Math.floor(Math.random() * 50) + 5,
    vehiclesAssigned: assignments.filter(a => !a.endDate).length,
    workOrdersCompleted: Math.floor(Math.random() * 40) + 5,
    totalWorkHours: Math.floor(Math.random() * 500) + 100,
  };
}

// ============================================================================
// Team Functions
// ============================================================================

export async function getTeams(): Promise<Team[]> {
  const data = await AsyncStorage.getItem(TEAMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getTeamById(id: string): Promise<Team | null> {
  const teams = await getTeams();
  return teams.find(t => t.id === id) || null;
}

export async function addTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
  const teams = await getTeams();
  const now = new Date().toISOString();
  
  const newTeam: Team = {
    ...team,
    id: `team-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  
  teams.push(newTeam);
  await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  
  return newTeam;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
  const teams = await getTeams();
  const index = teams.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  teams[index] = {
    ...teams[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  return teams[index];
}

export async function deleteTeam(id: string): Promise<boolean> {
  const teams = await getTeams();
  const filtered = teams.filter(t => t.id !== id);
  
  if (filtered.length === teams.length) return false;
  
  await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(filtered));
  
  // Remove team from technicians
  const technicians = await getTechnicians();
  const updatedTechnicians = technicians.map(t => 
    t.teamId === id ? { ...t, teamId: undefined, updatedAt: new Date().toISOString() } : t
  );
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(updatedTechnicians));
  
  return true;
}

export async function getTeamStats(teamId: string): Promise<TeamStats> {
  const technicians = await getTechniciansByTeam(teamId);
  const assignments = await getAssignments();
  const teamAssignments = assignments.filter(a => a.teamId === teamId && !a.endDate);
  
  return {
    memberCount: technicians.length,
    totalInspections: technicians.length * Math.floor(Math.random() * 20) + 10,
    vehiclesAssigned: teamAssignments.length,
    workOrdersCompleted: technicians.length * Math.floor(Math.random() * 10) + 5,
    averagePerformance: Math.floor(Math.random() * 30) + 70,
  };
}

// ============================================================================
// Assignment Functions
// ============================================================================

export async function getAssignments(): Promise<VehicleAssignment[]> {
  const data = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getAssignmentsByVehicle(vehicleId: string): Promise<VehicleAssignment[]> {
  const assignments = await getAssignments();
  return assignments.filter(a => a.vehicleId === vehicleId);
}

export async function getAssignmentsByTechnician(technicianId: string): Promise<VehicleAssignment[]> {
  const assignments = await getAssignments();
  return assignments.filter(a => a.technicianId === technicianId);
}

export async function getActiveAssignmentsByVehicle(vehicleId: string): Promise<VehicleAssignment[]> {
  const assignments = await getAssignmentsByVehicle(vehicleId);
  return assignments.filter(a => !a.endDate);
}

export async function assignVehicle(assignment: Omit<VehicleAssignment, 'id' | 'createdAt'>): Promise<VehicleAssignment> {
  const assignments = await getAssignments();
  
  const newAssignment: VehicleAssignment = {
    ...assignment,
    id: `assign-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  // If this is a primary assignment, remove primary from others
  if (assignment.isPrimary) {
    assignments.forEach(a => {
      if (a.vehicleId === assignment.vehicleId && a.isPrimary && !a.endDate) {
        a.isPrimary = false;
      }
    });
  }
  
  assignments.push(newAssignment);
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  
  return newAssignment;
}

export async function endAssignment(assignmentId: string): Promise<VehicleAssignment | null> {
  const assignments = await getAssignments();
  const index = assignments.findIndex(a => a.id === assignmentId);
  
  if (index === -1) return null;
  
  assignments[index] = {
    ...assignments[index],
    endDate: new Date().toISOString(),
  };
  
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  return assignments[index];
}

export async function deleteAssignment(assignmentId: string): Promise<boolean> {
  const assignments = await getAssignments();
  const filtered = assignments.filter(a => a.id !== assignmentId);
  
  if (filtered.length === assignments.length) return false;
  
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(filtered));
  return true;
}

export async function assignTeamToVehicle(vehicleId: string, teamId: string): Promise<VehicleAssignment[]> {
  const technicians = await getTechniciansByTeam(teamId);
  const newAssignments: VehicleAssignment[] = [];
  
  for (const tech of technicians) {
    const assignment = await assignVehicle({
      vehicleId,
      technicianId: tech.id,
      teamId,
      startDate: new Date().toISOString(),
      isPrimary: false,
    });
    newAssignments.push(assignment);
  }
  
  return newAssignments;
}

// ============================================================================
// Permission Functions
// ============================================================================

export async function getRolePermissions(): Promise<RolePermission[]> {
  const data = await AsyncStorage.getItem(PERMISSIONS_KEY);
  if (!data) {
    // Initialize with defaults
    await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(defaultPermissions));
    return defaultPermissions;
  }
  return JSON.parse(data);
}

export async function getPermissionsForRole(role: UserRole): Promise<RolePermission['permissions'] | null> {
  const permissions = await getRolePermissions();
  const rolePermission = permissions.find(p => p.role === role);
  return rolePermission?.permissions || null;
}

export async function updateRolePermissions(role: UserRole, permissions: RolePermission['permissions']): Promise<boolean> {
  const allPermissions = await getRolePermissions();
  const index = allPermissions.findIndex(p => p.role === role);
  
  if (index === -1) return false;
  
  allPermissions[index] = { role, permissions };
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(allPermissions));
  
  return true;
}

export function hasPermission(
  permissions: RolePermission['permissions'],
  resource: keyof RolePermission['permissions'],
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  return permissions[resource]?.[action] || false;
}

// ============================================================================
// Demo Data
// ============================================================================

export async function generateDemoTeamData(): Promise<void> {
  const existingTechnicians = await getTechnicians();
  const existingTeams = await getTeams();
  
  if (existingTechnicians.length > 0 || existingTeams.length > 0) {
    return; // Already has data
  }
  
  // Create demo teams
  const team1 = await addTeam({
    name: 'Équipe Maintenance',
    description: 'Équipe principale de maintenance préventive',
    color: '#22C55E',
    isActive: true,
  });
  
  const team2 = await addTeam({
    name: 'Équipe Réparation',
    description: 'Équipe spécialisée en réparations majeures',
    color: '#EF4444',
    isActive: true,
  });
  
  // Create demo technicians
  await addTechnician({
    firstName: 'Jean',
    lastName: 'Tremblay',
    email: 'jean.tremblay@fleetcore.ca',
    phone: '514-555-0101',
    role: 'technician',
    specialties: ['general', 'brakes', 'suspension'],
    teamId: team1.id,
    hireDate: '2020-03-15',
    isActive: true,
    certifications: ['ASE Certified', 'SAAQ Inspector'],
  });
  
  await addTechnician({
    firstName: 'Marie',
    lastName: 'Gagnon',
    email: 'marie.gagnon@fleetcore.ca',
    phone: '514-555-0102',
    role: 'technician',
    specialties: ['engine', 'transmission', 'electrical'],
    teamId: team1.id,
    hireDate: '2019-06-01',
    isActive: true,
    certifications: ['ASE Master Technician', 'Diesel Specialist'],
  });
  
  await addTechnician({
    firstName: 'Pierre',
    lastName: 'Roy',
    email: 'pierre.roy@fleetcore.ca',
    phone: '514-555-0103',
    role: 'manager',
    specialties: ['general'],
    teamId: team2.id,
    hireDate: '2018-01-10',
    isActive: true,
    certifications: ['Fleet Management Certified'],
  });
  
  await addTechnician({
    firstName: 'Sophie',
    lastName: 'Lavoie',
    email: 'sophie.lavoie@fleetcore.ca',
    phone: '514-555-0104',
    role: 'technician',
    specialties: ['tires', 'bodywork', 'hvac'],
    teamId: team2.id,
    hireDate: '2021-09-20',
    isActive: true,
    certifications: ['Tire Technician Certified'],
  });
}
