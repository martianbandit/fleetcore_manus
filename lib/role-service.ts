/**
 * FleetCore - Service de gestion des rôles et permissions
 * 
 * Gère les 5 rôles utilisateurs avec leurs permissions spécifiques:
 * - admin: Administrateur système (accès complet)
 * - manager: Gestionnaire de flotte (gestion opérationnelle)
 * - dispatcher: Répartiteur (assignation des missions)
 * - technician: Technicien (maintenance et inspections)
 * - driver: Chauffeur (conduite et rondes de sécurité)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'technician' | 'driver';

export type Feature = 
  | 'vehicles'
  | 'inspections'
  | 'workOrders'
  | 'inventory'
  | 'technicians'
  | 'teams'
  | 'reports'
  | 'settings'
  | 'pep'
  | 'missions'
  | 'drivers'
  | 'analytics'
  | 'billing'
  | 'users'
  | 'audit';

export type Permission = 'create' | 'read' | 'update' | 'delete' | 'approve';

export interface RolePermissions {
  [feature: string]: Permission[];
}

export interface RoleConfig {
  id: UserRole;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  color: string;
  permissions: RolePermissions;
  dashboardRoute: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  assignedVehicleId?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  vehicleId: string;
  driverId: string;
  dispatcherId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startLocation: string;
  endLocation: string;
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DefectReport {
  id: string;
  vehicleId: string;
  driverId: string;
  technicianId?: string;
  workOrderId?: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  location: string;
  photos: string[];
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// ============================================================================
// CONFIGURATION DES RÔLES
// ============================================================================

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    nameFr: 'Administrateur',
    description: 'Full system access and configuration',
    descriptionFr: 'Accès complet au système et configuration',
    icon: 'shield.fill',
    color: '#8B5CF6',
    dashboardRoute: '/dashboard/admin',
    permissions: {
      vehicles: ['create', 'read', 'update', 'delete'],
      inspections: ['create', 'read', 'update', 'delete', 'approve'],
      workOrders: ['create', 'read', 'update', 'delete', 'approve'],
      inventory: ['create', 'read', 'update', 'delete'],
      technicians: ['create', 'read', 'update', 'delete'],
      teams: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      pep: ['create', 'read', 'update', 'delete', 'approve'],
      missions: ['create', 'read', 'update', 'delete'],
      drivers: ['create', 'read', 'update', 'delete'],
      analytics: ['read'],
      billing: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      audit: ['read'],
    },
  },
  manager: {
    id: 'manager',
    name: 'Fleet Manager',
    nameFr: 'Gestionnaire de flotte',
    description: 'Fleet operations and team management',
    descriptionFr: 'Gestion des opérations de flotte et des équipes',
    icon: 'person.badge.key.fill',
    color: '#0EA5E9',
    dashboardRoute: '/dashboard/manager',
    permissions: {
      vehicles: ['create', 'read', 'update'],
      inspections: ['create', 'read', 'update', 'approve'],
      workOrders: ['create', 'read', 'update', 'approve'],
      inventory: ['read', 'update'],
      technicians: ['read', 'update'],
      teams: ['create', 'read', 'update'],
      reports: ['create', 'read'],
      settings: ['read'],
      pep: ['create', 'read', 'update', 'approve'],
      missions: ['read'],
      drivers: ['read'],
      analytics: ['read'],
      billing: ['read'],
      users: ['read'],
      audit: ['read'],
    },
  },
  dispatcher: {
    id: 'dispatcher',
    name: 'Dispatcher',
    nameFr: 'Répartiteur',
    description: 'Mission assignment and driver coordination',
    descriptionFr: 'Assignation des missions et coordination des chauffeurs',
    icon: 'map.fill',
    color: '#F59E0B',
    dashboardRoute: '/dashboard/dispatcher',
    permissions: {
      vehicles: ['read'],
      inspections: ['read'],
      workOrders: ['read'],
      inventory: ['read'],
      technicians: ['read'],
      teams: ['read'],
      reports: ['read'],
      settings: [],
      pep: ['read'],
      missions: ['create', 'read', 'update', 'delete'],
      drivers: ['read', 'update'],
      analytics: ['read'],
      billing: [],
      users: [],
      audit: [],
    },
  },
  technician: {
    id: 'technician',
    name: 'Technician',
    nameFr: 'Technicien',
    description: 'Vehicle maintenance and inspections',
    descriptionFr: 'Maintenance des véhicules et inspections',
    icon: 'wrench.and.screwdriver.fill',
    color: '#10B981',
    dashboardRoute: '/dashboard/technician',
    permissions: {
      vehicles: ['read'],
      inspections: ['create', 'read', 'update'],
      workOrders: ['read', 'update'],
      inventory: ['read', 'update'],
      technicians: ['read'],
      teams: ['read'],
      reports: ['read'],
      settings: [],
      pep: ['create', 'read', 'update'],
      missions: [],
      drivers: [],
      analytics: [],
      billing: [],
      users: [],
      audit: [],
    },
  },
  driver: {
    id: 'driver',
    name: 'Driver',
    nameFr: 'Chauffeur',
    description: 'Vehicle operation and safety rounds',
    descriptionFr: 'Conduite et rondes de sécurité',
    icon: 'car.fill',
    color: '#EF4444',
    dashboardRoute: '/dashboard/driver',
    permissions: {
      vehicles: ['read'],
      inspections: ['create', 'read'],
      workOrders: ['read'],
      inventory: [],
      technicians: [],
      teams: [],
      reports: [],
      settings: [],
      pep: [],
      missions: ['read', 'update'],
      drivers: [],
      analytics: [],
      billing: [],
      users: [],
      audit: [],
    },
  },
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  CURRENT_USER: 'fleetcore_current_user',
  USERS: 'fleetcore_users',
  MISSIONS: 'fleetcore_missions',
  DEFECT_REPORTS: 'fleetcore_defect_reports',
  ACTIVITY_LOGS: 'fleetcore_activity_logs',
};

// ============================================================================
// FONCTIONS DE GESTION DES UTILISATEURS
// ============================================================================

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Définit l'utilisateur actuellement connecté
 */
export async function setCurrentUser(user: User | null): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Récupère le rôle de l'utilisateur actuel
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await getCurrentUser();
  return user?.role || 'driver'; // Par défaut: chauffeur
}

/**
 * Récupère tous les utilisateurs
 */
export async function getUsers(): Promise<User[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

/**
 * Récupère les utilisateurs par rôle
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const users = await getUsers();
  return users.filter(u => u.role === role && u.isActive);
}

/**
 * Ajoute un nouvel utilisateur
 */
export async function addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const users = await getUsers();
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  await logActivity(newUser.id, newUser.role, 'user_created', 'user', newUser.id, `Utilisateur ${newUser.name} créé`);
  return newUser;
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users[index];
}

/**
 * Supprime un utilisateur
 */
export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  
  await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  return true;
}

// ============================================================================
// FONCTIONS DE PERMISSIONS
// ============================================================================

/**
 * Vérifie si un rôle a une permission spécifique sur une fonctionnalité
 */
export function hasPermission(role: UserRole, feature: Feature, permission: Permission): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  
  const featurePermissions = config.permissions[feature];
  if (!featurePermissions) return false;
  
  return featurePermissions.includes(permission);
}

/**
 * Vérifie si l'utilisateur actuel peut accéder à une fonctionnalité
 */
export async function canAccess(feature: Feature, permission: Permission = 'read'): Promise<boolean> {
  const role = await getCurrentUserRole();
  return hasPermission(role, feature, permission);
}

/**
 * Récupère toutes les permissions d'un rôle
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_CONFIGS[role]?.permissions || {};
}

/**
 * Récupère la configuration d'un rôle
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIGS[role];
}

/**
 * Récupère le dashboard approprié pour un rôle
 */
export function getDashboardRoute(role: UserRole): string {
  return ROLE_CONFIGS[role]?.dashboardRoute || '/dashboard/driver';
}

// ============================================================================
// FONCTIONS DE GESTION DES MISSIONS
// ============================================================================

/**
 * Récupère toutes les missions
 */
export async function getMissions(): Promise<Mission[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting missions:', error);
    return [];
  }
}

/**
 * Récupère les missions d'un chauffeur
 */
export async function getMissionsByDriver(driverId: string): Promise<Mission[]> {
  const missions = await getMissions();
  return missions.filter(m => m.driverId === driverId);
}

/**
 * Récupère les missions d'un dispatcher
 */
export async function getMissionsByDispatcher(dispatcherId: string): Promise<Mission[]> {
  const missions = await getMissions();
  return missions.filter(m => m.dispatcherId === dispatcherId);
}

/**
 * Crée une nouvelle mission (Dispatcher → Chauffeur)
 */
export async function createMission(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mission> {
  const missions = await getMissions();
  const newMission: Mission = {
    ...mission,
    id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  missions.push(newMission);
  await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  
  // Log de l'activité
  await logActivity(
    mission.dispatcherId,
    'dispatcher',
    'mission_created',
    'mission',
    newMission.id,
    `Mission "${mission.title}" assignée au chauffeur`
  );
  
  return newMission;
}

/**
 * Met à jour une mission
 */
export async function updateMission(id: string, updates: Partial<Mission>): Promise<Mission | null> {
  const missions = await getMissions();
  const index = missions.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  missions[index] = {
    ...missions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  return missions[index];
}

/**
 * Accepte une mission (Chauffeur)
 */
export async function acceptMission(missionId: string, driverId: string): Promise<Mission | null> {
  const mission = await updateMission(missionId, { status: 'accepted' });
  if (mission) {
    await logActivity(driverId, 'driver', 'mission_accepted', 'mission', missionId, 'Mission acceptée');
  }
  return mission;
}

/**
 * Démarre une mission (Chauffeur)
 */
export async function startMission(missionId: string, driverId: string): Promise<Mission | null> {
  const mission = await updateMission(missionId, {
    status: 'in_progress',
    actualStart: new Date().toISOString(),
  });
  if (mission) {
    await logActivity(driverId, 'driver', 'mission_started', 'mission', missionId, 'Mission démarrée');
  }
  return mission;
}

/**
 * Termine une mission (Chauffeur)
 */
export async function completeMission(missionId: string, driverId: string): Promise<Mission | null> {
  const mission = await updateMission(missionId, {
    status: 'completed',
    actualEnd: new Date().toISOString(),
  });
  if (mission) {
    await logActivity(driverId, 'driver', 'mission_completed', 'mission', missionId, 'Mission terminée');
  }
  return mission;
}

// ============================================================================
// FONCTIONS DE SIGNALEMENT DE DÉFAUTS
// ============================================================================

/**
 * Récupère tous les signalements de défauts
 */
export async function getDefectReports(): Promise<DefectReport[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DEFECT_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting defect reports:', error);
    return [];
  }
}

/**
 * Récupère les signalements d'un chauffeur
 */
export async function getDefectReportsByDriver(driverId: string): Promise<DefectReport[]> {
  const reports = await getDefectReports();
  return reports.filter(r => r.driverId === driverId);
}

/**
 * Récupère les signalements assignés à un technicien
 */
export async function getDefectReportsByTechnician(technicianId: string): Promise<DefectReport[]> {
  const reports = await getDefectReports();
  return reports.filter(r => r.technicianId === technicianId);
}

/**
 * Crée un signalement de défaut (Chauffeur → Technicien)
 */
export async function createDefectReport(report: Omit<DefectReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<DefectReport> {
  const reports = await getDefectReports();
  const newReport: DefectReport = {
    ...report,
    id: `defect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'reported',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reports.push(newReport);
  await AsyncStorage.setItem(STORAGE_KEYS.DEFECT_REPORTS, JSON.stringify(reports));
  
  await logActivity(
    report.driverId,
    'driver',
    'defect_reported',
    'defect',
    newReport.id,
    `Défaut signalé: ${report.description}`
  );
  
  return newReport;
}

/**
 * Assigne un signalement à un technicien (Gestionnaire/Dispatcher)
 */
export async function assignDefectToTechnician(
  reportId: string,
  technicianId: string,
  assignedBy: string,
  assignerRole: UserRole
): Promise<DefectReport | null> {
  const reports = await getDefectReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) return null;
  
  reports[index] = {
    ...reports[index],
    technicianId,
    status: 'assigned',
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.DEFECT_REPORTS, JSON.stringify(reports));
  
  await logActivity(
    assignedBy,
    assignerRole,
    'defect_assigned',
    'defect',
    reportId,
    `Défaut assigné au technicien`
  );
  
  return reports[index];
}

/**
 * Résout un signalement (Technicien)
 */
export async function resolveDefectReport(
  reportId: string,
  technicianId: string,
  workOrderId?: string
): Promise<DefectReport | null> {
  const reports = await getDefectReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) return null;
  
  reports[index] = {
    ...reports[index],
    status: 'resolved',
    workOrderId,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.DEFECT_REPORTS, JSON.stringify(reports));
  
  await logActivity(
    technicianId,
    'technician',
    'defect_resolved',
    'defect',
    reportId,
    `Défaut résolu${workOrderId ? ` (Bon de travail: ${workOrderId})` : ''}`
  );
  
  return reports[index];
}

// ============================================================================
// FONCTIONS DE JOURNAL D'ACTIVITÉ
// ============================================================================

/**
 * Enregistre une activité dans le journal
 */
export async function logActivity(
  userId: string,
  userRole: UserRole,
  action: string,
  targetType: string,
  targetId: string,
  details: string
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = data ? JSON.parse(data) : [];
    
    logs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userRole,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
    
    // Garder seulement les 1000 derniers logs
    const trimmedLogs = logs.slice(-1000);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Récupère le journal d'activité
 */
export async function getActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = data ? JSON.parse(data) : [];
    return logs.slice(-limit).reverse();
  } catch (error) {
    console.error('Error getting activity logs:', error);
    return [];
  }
}

/**
 * Récupère le journal d'activité d'un utilisateur
 */
export async function getActivityLogsByUser(userId: string, limit: number = 50): Promise<ActivityLog[]> {
  const logs = await getActivityLogs(1000);
  return logs.filter(l => l.userId === userId).slice(0, limit);
}

// ============================================================================
// FONCTIONS DE STATISTIQUES PAR RÔLE
// ============================================================================

export interface RoleStats {
  totalUsers: number;
  activeUsers: number;
  byRole: Record<UserRole, number>;
  recentActivity: number;
}

/**
 * Récupère les statistiques des utilisateurs par rôle
 */
export async function getRoleStats(): Promise<RoleStats> {
  const users = await getUsers();
  const logs = await getActivityLogs(100);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  const byRole: Record<UserRole, number> = {
    admin: 0,
    manager: 0,
    dispatcher: 0,
    technician: 0,
    driver: 0,
  };
  
  users.forEach(user => {
    if (byRole[user.role] !== undefined) {
      byRole[user.role]++;
    }
  });
  
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    byRole,
    recentActivity: logs.filter(l => new Date(l.timestamp).getTime() > oneDayAgo).length,
  };
}

// ============================================================================
// DONNÉES DE DÉMONSTRATION
// ============================================================================

/**
 * Génère des utilisateurs de démonstration pour chaque rôle
 */
export async function generateDemoUsers(): Promise<void> {
  const existingUsers = await getUsers();
  if (existingUsers.length > 0) return; // Ne pas régénérer si des utilisateurs existent
  
  const demoUsers: Omit<User, 'id' | 'createdAt'>[] = [
    {
      email: 'admin@fleetcore.ca',
      name: 'Marie Tremblay',
      role: 'admin',
      phone: '514-555-0100',
      isActive: true,
    },
    {
      email: 'gestionnaire@fleetcore.ca',
      name: 'Pierre Gagnon',
      role: 'manager',
      phone: '514-555-0101',
      isActive: true,
    },
    {
      email: 'dispatcher@fleetcore.ca',
      name: 'Sophie Lavoie',
      role: 'dispatcher',
      phone: '514-555-0102',
      isActive: true,
    },
    {
      email: 'technicien1@fleetcore.ca',
      name: 'Jean-Marc Bouchard',
      role: 'technician',
      teamId: 'team_1',
      phone: '514-555-0103',
      isActive: true,
    },
    {
      email: 'technicien2@fleetcore.ca',
      name: 'Luc Pelletier',
      role: 'technician',
      teamId: 'team_1',
      phone: '514-555-0104',
      isActive: true,
    },
    {
      email: 'chauffeur1@fleetcore.ca',
      name: 'Michel Roy',
      role: 'driver',
      assignedVehicleId: 'vehicle_1',
      phone: '514-555-0105',
      isActive: true,
    },
    {
      email: 'chauffeur2@fleetcore.ca',
      name: 'André Côté',
      role: 'driver',
      assignedVehicleId: 'vehicle_2',
      phone: '514-555-0106',
      isActive: true,
    },
    {
      email: 'chauffeur3@fleetcore.ca',
      name: 'François Morin',
      role: 'driver',
      assignedVehicleId: 'vehicle_3',
      phone: '514-555-0107',
      isActive: true,
    },
  ];
  
  for (const user of demoUsers) {
    await addUser(user);
  }
}

/**
 * Génère des missions de démonstration
 */
export async function generateDemoMissions(): Promise<void> {
  const existingMissions = await getMissions();
  if (existingMissions.length > 0) return;
  
  const users = await getUsers();
  const dispatcher = users.find(u => u.role === 'dispatcher');
  const drivers = users.filter(u => u.role === 'driver');
  
  if (!dispatcher || drivers.length === 0) return;
  
  const demoMissions: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'Livraison Montréal → Québec',
      description: 'Livraison de marchandises au centre de distribution',
      vehicleId: 'vehicle_1',
      driverId: drivers[0]?.id || '',
      dispatcherId: dispatcher.id,
      status: 'in_progress',
      priority: 'normal',
      startLocation: 'Montréal, QC',
      endLocation: 'Québec, QC',
      scheduledStart: new Date().toISOString(),
      scheduledEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      actualStart: new Date().toISOString(),
    },
    {
      title: 'Collecte Sherbrooke',
      description: 'Collecte de matériaux au fournisseur',
      vehicleId: 'vehicle_2',
      driverId: drivers[1]?.id || '',
      dispatcherId: dispatcher.id,
      status: 'pending',
      priority: 'high',
      startLocation: 'Montréal, QC',
      endLocation: 'Sherbrooke, QC',
      scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Transport urgent Laval',
      description: 'Livraison express de pièces',
      vehicleId: 'vehicle_3',
      driverId: drivers[2]?.id || '',
      dispatcherId: dispatcher.id,
      status: 'pending',
      priority: 'urgent',
      startLocation: 'Montréal, QC',
      endLocation: 'Laval, QC',
      scheduledStart: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  ];
  
  for (const mission of demoMissions) {
    if (mission.driverId) {
      await createMission(mission);
    }
  }
}
