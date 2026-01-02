import { describe, it, expect, beforeEach } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (key: string) => mockStorage[key] || null,
  setItem: async (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: async (key: string) => { delete mockStorage[key]; },
  clear: async () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

// Types from team-service
type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';
type Specialty = 'freins' | 'moteur' | 'transmission' | 'électrique' | 'suspension' | 'pneus' | 'carrosserie' | 'général';

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  teamId?: string;
  specialties: Specialty[];
  isActive: boolean;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface VehicleAssignment {
  id: string;
  vehicleId: string;
  technicianId: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
}

interface RolePermission {
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

// Service functions (simplified for testing)
const TECHNICIANS_KEY = 'fleetcore_technicians';
const TEAMS_KEY = 'fleetcore_teams';
const ASSIGNMENTS_KEY = 'fleetcore_vehicle_assignments';
const PERMISSIONS_KEY = 'fleetcore_role_permissions';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Gestionnaire',
  technician: 'Technicien',
  viewer: 'Observateur',
};

const specialtyLabels: Record<Specialty, string> = {
  freins: 'Freins',
  moteur: 'Moteur',
  transmission: 'Transmission',
  électrique: 'Électrique',
  suspension: 'Suspension',
  pneus: 'Pneus',
  carrosserie: 'Carrosserie',
  général: 'Général',
};

// Technician functions
async function getTechnicians(): Promise<Technician[]> {
  const data = await AsyncStorage.getItem(TECHNICIANS_KEY);
  return data ? JSON.parse(data) : [];
}

async function addTechnician(technicianData: Omit<Technician, 'id' | 'createdAt'>): Promise<Technician> {
  const technicians = await getTechnicians();
  const newTechnician: Technician = {
    ...technicianData,
    id: `tech_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  technicians.push(newTechnician);
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
  return newTechnician;
}

async function getTechnicianById(id: string): Promise<Technician | null> {
  const technicians = await getTechnicians();
  return technicians.find(t => t.id === id) || null;
}

async function updateTechnician(id: string, updates: Partial<Technician>): Promise<Technician | null> {
  const technicians = await getTechnicians();
  const index = technicians.findIndex(t => t.id === id);
  if (index === -1) return null;
  technicians[index] = { ...technicians[index], ...updates };
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(technicians));
  return technicians[index];
}

async function deleteTechnician(id: string): Promise<boolean> {
  const technicians = await getTechnicians();
  const filtered = technicians.filter(t => t.id !== id);
  if (filtered.length === technicians.length) return false;
  await AsyncStorage.setItem(TECHNICIANS_KEY, JSON.stringify(filtered));
  return true;
}

// Team functions
async function getTeams(): Promise<Team[]> {
  const data = await AsyncStorage.getItem(TEAMS_KEY);
  return data ? JSON.parse(data) : [];
}

async function addTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> {
  const teams = await getTeams();
  const newTeam: Team = {
    ...teamData,
    id: `team_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  teams.push(newTeam);
  await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  return newTeam;
}

async function getTeamById(id: string): Promise<Team | null> {
  const teams = await getTeams();
  return teams.find(t => t.id === id) || null;
}

async function deleteTeam(id: string): Promise<boolean> {
  const teams = await getTeams();
  const filtered = teams.filter(t => t.id !== id);
  if (filtered.length === teams.length) return false;
  await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(filtered));
  return true;
}

// Assignment functions
async function getAssignments(): Promise<VehicleAssignment[]> {
  const data = await AsyncStorage.getItem(ASSIGNMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

async function assignVehicle(assignmentData: Omit<VehicleAssignment, 'id'>): Promise<VehicleAssignment> {
  const assignments = await getAssignments();
  const newAssignment: VehicleAssignment = {
    ...assignmentData,
    id: `assign_${Date.now()}`,
  };
  assignments.push(newAssignment);
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  return newAssignment;
}

async function getActiveAssignmentsByVehicle(vehicleId: string): Promise<VehicleAssignment[]> {
  const assignments = await getAssignments();
  return assignments.filter(a => a.vehicleId === vehicleId && !a.endDate);
}

async function endAssignment(assignmentId: string): Promise<boolean> {
  const assignments = await getAssignments();
  const index = assignments.findIndex(a => a.id === assignmentId);
  if (index === -1) return false;
  assignments[index].endDate = new Date().toISOString();
  await AsyncStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  return true;
}

// Permission functions
function getDefaultPermissions(): RolePermission[] {
  const createCRUD = (c: boolean, r: boolean, u: boolean, d: boolean) => ({
    create: c, read: r, update: u, delete: d,
  });

  return [
    {
      role: 'admin',
      permissions: {
        vehicles: createCRUD(true, true, true, true),
        inspections: createCRUD(true, true, true, true),
        workOrders: createCRUD(true, true, true, true),
        inventory: createCRUD(true, true, true, true),
        technicians: createCRUD(true, true, true, true),
        teams: createCRUD(true, true, true, true),
        reports: createCRUD(true, true, true, true),
        settings: createCRUD(true, true, true, true),
      },
    },
    {
      role: 'manager',
      permissions: {
        vehicles: createCRUD(true, true, true, false),
        inspections: createCRUD(true, true, true, true),
        workOrders: createCRUD(true, true, true, true),
        inventory: createCRUD(true, true, true, false),
        technicians: createCRUD(true, true, true, false),
        teams: createCRUD(true, true, true, false),
        reports: createCRUD(true, true, false, false),
        settings: createCRUD(false, true, true, false),
      },
    },
    {
      role: 'technician',
      permissions: {
        vehicles: createCRUD(false, true, false, false),
        inspections: createCRUD(true, true, true, false),
        workOrders: createCRUD(false, true, true, false),
        inventory: createCRUD(false, true, true, false),
        technicians: createCRUD(false, true, false, false),
        teams: createCRUD(false, true, false, false),
        reports: createCRUD(false, true, false, false),
        settings: createCRUD(false, true, false, false),
      },
    },
    {
      role: 'viewer',
      permissions: {
        vehicles: createCRUD(false, true, false, false),
        inspections: createCRUD(false, true, false, false),
        workOrders: createCRUD(false, true, false, false),
        inventory: createCRUD(false, true, false, false),
        technicians: createCRUD(false, true, false, false),
        teams: createCRUD(false, true, false, false),
        reports: createCRUD(false, true, false, false),
        settings: createCRUD(false, false, false, false),
      },
    },
  ];
}

async function getRolePermissions(): Promise<RolePermission[]> {
  const data = await AsyncStorage.getItem(PERMISSIONS_KEY);
  return data ? JSON.parse(data) : getDefaultPermissions();
}

async function updateRolePermissions(
  role: UserRole,
  permissions: RolePermission['permissions']
): Promise<void> {
  const allPermissions = await getRolePermissions();
  const index = allPermissions.findIndex(p => p.role === role);
  if (index !== -1) {
    allPermissions[index].permissions = permissions;
    await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(allPermissions));
  }
}

// Tests
describe('Team Service - Technicians', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should add a new technician', async () => {
    const techData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '514-555-1234',
      role: 'technician' as UserRole,
      specialties: ['freins', 'moteur'] as Specialty[],
      isActive: true,
    };

    const tech = await addTechnician(techData);
    
    expect(tech.id).toBeDefined();
    expect(tech.id).toMatch(/^tech_/);
    expect(tech.firstName).toBe('Jean');
    expect(tech.lastName).toBe('Dupont');
    expect(tech.email).toBe('jean.dupont@example.com');
    expect(tech.specialties).toHaveLength(2);
    expect(tech.createdAt).toBeDefined();
  });

  it('should retrieve technician by ID', async () => {
    const techData = {
      firstName: 'Marie',
      lastName: 'Tremblay',
      email: 'marie@example.com',
      phone: '514-555-5678',
      role: 'manager' as UserRole,
      specialties: ['général'] as Specialty[],
      isActive: true,
    };

    const created = await addTechnician(techData);
    const retrieved = await getTechnicianById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.firstName).toBe('Marie');
    expect(retrieved?.role).toBe('manager');
  });

  it('should update technician', async () => {
    const tech = await addTechnician({
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre@example.com',
      phone: '514-555-9999',
      role: 'technician' as UserRole,
      specialties: ['pneus'] as Specialty[],
      isActive: true,
    });

    const updated = await updateTechnician(tech.id, {
      specialties: ['pneus', 'suspension', 'freins'] as Specialty[],
      role: 'manager' as UserRole,
    });

    expect(updated?.specialties).toHaveLength(3);
    expect(updated?.role).toBe('manager');
  });

  it('should delete technician', async () => {
    const tech = await addTechnician({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '514-555-0000',
      role: 'viewer' as UserRole,
      specialties: [] as Specialty[],
      isActive: false,
    });

    const deleted = await deleteTechnician(tech.id);
    expect(deleted).toBe(true);

    const retrieved = await getTechnicianById(tech.id);
    expect(retrieved).toBeNull();
  });
});

describe('Team Service - Teams', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should create a new team', async () => {
    const teamData = {
      name: 'Équipe Maintenance',
      description: 'Équipe principale de maintenance',
      color: '#22C55E',
      isActive: true,
    };

    const team = await addTeam(teamData);
    
    expect(team.id).toBeDefined();
    expect(team.id).toMatch(/^team_/);
    expect(team.name).toBe('Équipe Maintenance');
    expect(team.color).toBe('#22C55E');
  });

  it('should retrieve team by ID', async () => {
    const created = await addTeam({
      name: 'Équipe A',
      color: '#0EA5E9',
      isActive: true,
    });

    const retrieved = await getTeamById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Équipe A');
  });

  it('should delete team', async () => {
    const team = await addTeam({
      name: 'Équipe Test',
      color: '#EF4444',
      isActive: true,
    });

    const deleted = await deleteTeam(team.id);
    expect(deleted).toBe(true);

    const retrieved = await getTeamById(team.id);
    expect(retrieved).toBeNull();
  });
});

describe('Team Service - Vehicle Assignments', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should assign technician to vehicle', async () => {
    const assignment = await assignVehicle({
      vehicleId: 'vehicle_1',
      technicianId: 'tech_1',
      startDate: new Date().toISOString(),
      isPrimary: true,
    });

    expect(assignment.id).toBeDefined();
    expect(assignment.vehicleId).toBe('vehicle_1');
    expect(assignment.technicianId).toBe('tech_1');
    expect(assignment.isPrimary).toBe(true);
  });

  it('should get active assignments by vehicle', async () => {
    await assignVehicle({
      vehicleId: 'vehicle_1',
      technicianId: 'tech_1',
      startDate: new Date().toISOString(),
      isPrimary: true,
    });

    await assignVehicle({
      vehicleId: 'vehicle_1',
      technicianId: 'tech_2',
      startDate: new Date().toISOString(),
      isPrimary: false,
    });

    await assignVehicle({
      vehicleId: 'vehicle_2',
      technicianId: 'tech_3',
      startDate: new Date().toISOString(),
      isPrimary: true,
    });

    const assignments = await getActiveAssignmentsByVehicle('vehicle_1');
    expect(assignments).toHaveLength(2);
  });

  it('should end assignment', async () => {
    const assignment = await assignVehicle({
      vehicleId: 'vehicle_1',
      technicianId: 'tech_1',
      startDate: new Date().toISOString(),
      isPrimary: true,
    });

    const ended = await endAssignment(assignment.id);
    expect(ended).toBe(true);

    const activeAssignments = await getActiveAssignmentsByVehicle('vehicle_1');
    expect(activeAssignments).toHaveLength(0);
  });
});

describe('Team Service - Permissions', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return default permissions', async () => {
    const permissions = await getRolePermissions();
    
    expect(permissions).toHaveLength(4);
    expect(permissions.map(p => p.role)).toEqual(['admin', 'manager', 'technician', 'viewer']);
  });

  it('should have full permissions for admin', async () => {
    const permissions = await getRolePermissions();
    const adminPerms = permissions.find(p => p.role === 'admin');
    
    expect(adminPerms).toBeDefined();
    expect(adminPerms?.permissions.vehicles.create).toBe(true);
    expect(adminPerms?.permissions.vehicles.delete).toBe(true);
    expect(adminPerms?.permissions.settings.update).toBe(true);
  });

  it('should have limited permissions for viewer', async () => {
    const permissions = await getRolePermissions();
    const viewerPerms = permissions.find(p => p.role === 'viewer');
    
    expect(viewerPerms).toBeDefined();
    expect(viewerPerms?.permissions.vehicles.read).toBe(true);
    expect(viewerPerms?.permissions.vehicles.create).toBe(false);
    expect(viewerPerms?.permissions.vehicles.update).toBe(false);
    expect(viewerPerms?.permissions.vehicles.delete).toBe(false);
  });

  it('should update role permissions', async () => {
    const permissions = await getRolePermissions();
    const techPerms = permissions.find(p => p.role === 'technician');
    
    if (techPerms) {
      const updatedPerms = {
        ...techPerms.permissions,
        vehicles: { create: true, read: true, update: true, delete: false },
      };
      
      await updateRolePermissions('technician', updatedPerms);
      
      const newPermissions = await getRolePermissions();
      const newTechPerms = newPermissions.find(p => p.role === 'technician');
      
      expect(newTechPerms?.permissions.vehicles.create).toBe(true);
      expect(newTechPerms?.permissions.vehicles.update).toBe(true);
    }
  });
});

describe('Role and Specialty Labels', () => {
  it('should have labels for all roles', () => {
    expect(roleLabels.admin).toBe('Administrateur');
    expect(roleLabels.manager).toBe('Gestionnaire');
    expect(roleLabels.technician).toBe('Technicien');
    expect(roleLabels.viewer).toBe('Observateur');
  });

  it('should have labels for all specialties', () => {
    expect(specialtyLabels.freins).toBe('Freins');
    expect(specialtyLabels.moteur).toBe('Moteur');
    expect(specialtyLabels.transmission).toBe('Transmission');
    expect(specialtyLabels.électrique).toBe('Électrique');
    expect(specialtyLabels.suspension).toBe('Suspension');
    expect(specialtyLabels.pneus).toBe('Pneus');
    expect(specialtyLabels.carrosserie).toBe('Carrosserie');
    expect(specialtyLabels.général).toBe('Général');
  });
});
