/**
 * Calendar Service - Intégration Google Calendar via MCP
 * Gère les rappels, alertes et dates critiques pour FleetCore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour les événements calendrier
export type ReminderType = 
  | 'INSPECTION_DUE'      // Inspection périodique à faire
  | 'MAINTENANCE_DUE'     // Maintenance préventive
  | 'INSURANCE_EXPIRY'    // Expiration assurance
  | 'REGISTRATION_EXPIRY' // Expiration immatriculation
  | 'WORK_ORDER_DEADLINE' // Date limite bon de travail
  | 'PERMIT_EXPIRY'       // Expiration permis
  | 'CERTIFICATION_DUE'   // Certification à renouveler
  | 'CUSTOM';             // Rappel personnalisé

export type ReminderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FleetCoreReminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  vehicleId?: string;
  vehicleName?: string;
  workOrderId?: string;
  inspectionId?: string;
  dueDate: string; // ISO date
  reminderDays: number[]; // Jours avant la date pour rappeler (ex: [30, 7, 1])
  priority: ReminderPriority;
  isRecurring: boolean;
  recurrenceRule?: string; // RFC5545 format
  googleEventId?: string; // ID de l'événement Google Calendar
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  reminders?: number[]; // Minutes avant l'événement
  recurrence?: string[];
  fleetCoreReminderId?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  daysUntilDue: number;
  priority: ReminderPriority;
  vehicleName?: string;
  isOverdue: boolean;
}

// Storage keys
const REMINDERS_KEY = '@fleetcore_reminders';
const CALENDAR_SYNC_KEY = '@fleetcore_calendar_sync';

// Configuration des types de rappels
export const reminderTypeConfig: Record<ReminderType, {
  label: string;
  icon: string;
  color: string;
  defaultReminderDays: number[];
}> = {
  INSPECTION_DUE: {
    label: 'Inspection périodique',
    icon: 'clipboard.fill',
    color: '#0066CC',
    defaultReminderDays: [30, 7, 1],
  },
  MAINTENANCE_DUE: {
    label: 'Maintenance préventive',
    icon: 'wrench.fill',
    color: '#F59E0B',
    defaultReminderDays: [14, 7, 1],
  },
  INSURANCE_EXPIRY: {
    label: 'Expiration assurance',
    icon: 'shield.fill',
    color: '#EF4444',
    defaultReminderDays: [60, 30, 7],
  },
  REGISTRATION_EXPIRY: {
    label: 'Expiration immatriculation',
    icon: 'car.fill',
    color: '#8B5CF6',
    defaultReminderDays: [60, 30, 7],
  },
  WORK_ORDER_DEADLINE: {
    label: 'Date limite bon de travail',
    icon: 'clock.fill',
    color: '#F59E0B',
    defaultReminderDays: [3, 1],
  },
  PERMIT_EXPIRY: {
    label: 'Expiration permis',
    icon: 'doc.text.fill',
    color: '#EF4444',
    defaultReminderDays: [90, 30, 7],
  },
  CERTIFICATION_DUE: {
    label: 'Certification à renouveler',
    icon: 'checkmark.seal.fill',
    color: '#22C55E',
    defaultReminderDays: [60, 30, 7],
  },
  CUSTOM: {
    label: 'Rappel personnalisé',
    icon: 'bell.fill',
    color: '#64748B',
    defaultReminderDays: [7, 1],
  },
};

// Priorité config
export const priorityConfig: Record<ReminderPriority, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  LOW: { label: 'Basse', color: '#64748B', bgColor: '#64748B20' },
  MEDIUM: { label: 'Moyenne', color: '#F59E0B', bgColor: '#F59E0B20' },
  HIGH: { label: 'Haute', color: '#EF4444', bgColor: '#EF444420' },
  CRITICAL: { label: 'Critique', color: '#DC2626', bgColor: '#DC262620' },
};

/**
 * Génère un ID unique
 */
function generateId(): string {
  return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcule le nombre de jours jusqu'à une date
 */
export function daysUntilDate(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Détermine la priorité automatique basée sur les jours restants
 */
export function getAutoPriority(daysUntil: number): ReminderPriority {
  if (daysUntil <= 0) return 'CRITICAL';
  if (daysUntil <= 3) return 'HIGH';
  if (daysUntil <= 14) return 'MEDIUM';
  return 'LOW';
}

/**
 * Récupère tous les rappels
 */
export async function getReminders(): Promise<FleetCoreReminder[]> {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
}

/**
 * Récupère un rappel par ID
 */
export async function getReminderById(id: string): Promise<FleetCoreReminder | null> {
  const reminders = await getReminders();
  return reminders.find(r => r.id === id) || null;
}

/**
 * Récupère les rappels pour un véhicule
 */
export async function getRemindersForVehicle(vehicleId: string): Promise<FleetCoreReminder[]> {
  const reminders = await getReminders();
  return reminders.filter(r => r.vehicleId === vehicleId && !r.isCompleted);
}

/**
 * Récupère les rappels à venir (non complétés)
 */
export async function getUpcomingReminders(days: number = 30): Promise<UpcomingEvent[]> {
  const reminders = await getReminders();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return reminders
    .filter(r => !r.isCompleted)
    .map(r => {
      const daysUntilDue = daysUntilDate(r.dueDate);
      return {
        id: r.id,
        title: r.title,
        type: r.type,
        dueDate: r.dueDate,
        daysUntilDue,
        priority: daysUntilDue <= 0 ? 'CRITICAL' : r.priority,
        vehicleName: r.vehicleName,
        isOverdue: daysUntilDue < 0,
      };
    })
    .filter(r => r.daysUntilDue <= days)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Récupère les rappels en retard
 */
export async function getOverdueReminders(): Promise<UpcomingEvent[]> {
  const upcoming = await getUpcomingReminders(365);
  return upcoming.filter(r => r.isOverdue);
}

/**
 * Crée un nouveau rappel
 */
export async function createReminder(
  reminder: Omit<FleetCoreReminder, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>
): Promise<FleetCoreReminder> {
  const reminders = await getReminders();
  
  const newReminder: FleetCoreReminder = {
    ...reminder,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCompleted: false,
  };

  reminders.push(newReminder);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));

  return newReminder;
}

/**
 * Met à jour un rappel
 */
export async function updateReminder(
  id: string,
  updates: Partial<FleetCoreReminder>
): Promise<FleetCoreReminder | null> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) return null;

  reminders[index] = {
    ...reminders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return reminders[index];
}

/**
 * Marque un rappel comme complété
 */
export async function completeReminder(id: string): Promise<FleetCoreReminder | null> {
  return updateReminder(id, {
    isCompleted: true,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Supprime un rappel
 */
export async function deleteReminder(id: string): Promise<boolean> {
  const reminders = await getReminders();
  const filtered = reminders.filter(r => r.id !== id);
  
  if (filtered.length === reminders.length) return false;

  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Crée un rappel d'inspection périodique
 */
export async function createInspectionReminder(
  vehicleId: string,
  vehicleName: string,
  nextInspectionDate: string
): Promise<FleetCoreReminder> {
  return createReminder({
    type: 'INSPECTION_DUE',
    title: `Inspection périodique - ${vehicleName}`,
    description: `L'inspection périodique SAAQ du véhicule ${vehicleName} est prévue.`,
    vehicleId,
    vehicleName,
    dueDate: nextInspectionDate,
    reminderDays: [30, 7, 1],
    priority: 'HIGH',
    isRecurring: true,
    recurrenceRule: 'RRULE:FREQ=YEARLY',
  });
}

/**
 * Crée un rappel de maintenance
 */
export async function createMaintenanceReminder(
  vehicleId: string,
  vehicleName: string,
  maintenanceType: string,
  dueDate: string
): Promise<FleetCoreReminder> {
  return createReminder({
    type: 'MAINTENANCE_DUE',
    title: `${maintenanceType} - ${vehicleName}`,
    description: `Maintenance préventive requise pour ${vehicleName}.`,
    vehicleId,
    vehicleName,
    dueDate,
    reminderDays: [14, 7, 1],
    priority: 'MEDIUM',
    isRecurring: false,
  });
}

/**
 * Crée un rappel d'expiration d'assurance
 */
export async function createInsuranceExpiryReminder(
  vehicleId: string,
  vehicleName: string,
  expiryDate: string
): Promise<FleetCoreReminder> {
  return createReminder({
    type: 'INSURANCE_EXPIRY',
    title: `Assurance expire - ${vehicleName}`,
    description: `L'assurance du véhicule ${vehicleName} expire bientôt.`,
    vehicleId,
    vehicleName,
    dueDate: expiryDate,
    reminderDays: [60, 30, 7],
    priority: 'HIGH',
    isRecurring: true,
    recurrenceRule: 'RRULE:FREQ=YEARLY',
  });
}

/**
 * Crée un rappel de date limite pour bon de travail
 */
export async function createWorkOrderDeadlineReminder(
  workOrderId: string,
  workOrderTitle: string,
  vehicleName: string | undefined,
  deadline: string
): Promise<FleetCoreReminder> {
  return createReminder({
    type: 'WORK_ORDER_DEADLINE',
    title: `Date limite - ${workOrderTitle}`,
    description: vehicleName 
      ? `Le bon de travail pour ${vehicleName} doit être complété.`
      : `Le bon de travail doit être complété.`,
    workOrderId,
    vehicleName,
    dueDate: deadline,
    reminderDays: [3, 1],
    priority: 'HIGH',
    isRecurring: false,
  });
}

/**
 * Statistiques des rappels
 */
export async function getReminderStats(): Promise<{
  total: number;
  pending: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  byType: Record<ReminderType, number>;
  byPriority: Record<ReminderPriority, number>;
}> {
  const reminders = await getReminders();
  const pending = reminders.filter(r => !r.isCompleted);
  
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const monthFromNow = new Date();
  monthFromNow.setDate(monthFromNow.getDate() + 30);

  const byType: Record<ReminderType, number> = {
    INSPECTION_DUE: 0,
    MAINTENANCE_DUE: 0,
    INSURANCE_EXPIRY: 0,
    REGISTRATION_EXPIRY: 0,
    WORK_ORDER_DEADLINE: 0,
    PERMIT_EXPIRY: 0,
    CERTIFICATION_DUE: 0,
    CUSTOM: 0,
  };

  const byPriority: Record<ReminderPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  let overdue = 0;
  let dueThisWeek = 0;
  let dueThisMonth = 0;

  pending.forEach(r => {
    const dueDate = new Date(r.dueDate);
    byType[r.type]++;
    
    const daysUntil = daysUntilDate(r.dueDate);
    const effectivePriority = daysUntil <= 0 ? 'CRITICAL' : r.priority;
    byPriority[effectivePriority]++;

    if (dueDate < now) overdue++;
    if (dueDate <= weekFromNow) dueThisWeek++;
    if (dueDate <= monthFromNow) dueThisMonth++;
  });

  return {
    total: reminders.length,
    pending: pending.length,
    overdue,
    dueThisWeek,
    dueThisMonth,
    byType,
    byPriority,
  };
}

/**
 * Formate une date pour l'affichage
 */
export function formatReminderDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = daysUntilDate(dateStr);
  
  if (days < 0) {
    return `En retard de ${Math.abs(days)} jour(s)`;
  } else if (days === 0) {
    return "Aujourd'hui";
  } else if (days === 1) {
    return 'Demain';
  } else if (days <= 7) {
    return `Dans ${days} jours`;
  } else {
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Génère des rappels de démonstration
 */
export async function generateDemoReminders(): Promise<void> {
  const existingReminders = await getReminders();
  if (existingReminders.length > 0) return;

  const today = new Date();
  
  // Rappel en retard
  const overdue = new Date(today);
  overdue.setDate(overdue.getDate() - 5);
  
  // Rappel cette semaine
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() + 3);
  
  // Rappel ce mois
  const thisMonth = new Date(today);
  thisMonth.setDate(thisMonth.getDate() + 15);
  
  // Rappel futur
  const future = new Date(today);
  future.setDate(future.getDate() + 45);

  await createReminder({
    type: 'INSPECTION_DUE',
    title: 'Inspection périodique - Camion 001',
    description: 'Inspection SAAQ annuelle requise',
    vehicleId: 'demo_v1',
    vehicleName: 'Camion 001',
    dueDate: overdue.toISOString().split('T')[0],
    reminderDays: [30, 7, 1],
    priority: 'CRITICAL',
    isRecurring: true,
  });

  await createReminder({
    type: 'MAINTENANCE_DUE',
    title: 'Vidange huile - Semi-remorque 002',
    description: 'Maintenance préventive planifiée',
    vehicleId: 'demo_v2',
    vehicleName: 'Semi-remorque 002',
    dueDate: thisWeek.toISOString().split('T')[0],
    reminderDays: [14, 7, 1],
    priority: 'HIGH',
    isRecurring: false,
  });

  await createReminder({
    type: 'INSURANCE_EXPIRY',
    title: 'Assurance expire - Autobus 003',
    description: 'Renouvellement assurance requis',
    vehicleId: 'demo_v3',
    vehicleName: 'Autobus 003',
    dueDate: thisMonth.toISOString().split('T')[0],
    reminderDays: [60, 30, 7],
    priority: 'MEDIUM',
    isRecurring: true,
  });

  await createReminder({
    type: 'REGISTRATION_EXPIRY',
    title: 'Immatriculation expire - Camion 004',
    description: 'Renouvellement immatriculation SAAQ',
    vehicleId: 'demo_v4',
    vehicleName: 'Camion 004',
    dueDate: future.toISOString().split('T')[0],
    reminderDays: [60, 30, 7],
    priority: 'LOW',
    isRecurring: true,
  });
}
