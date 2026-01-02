/**
 * FleetCore - Service de Notifications Métier Intelligentes
 * 
 * Notifications déclenchées par règles métier:
 * - Inspection en retard
 * - Défaut bloquant non réparé
 * - Véhicule utilisé malgré blocage
 * - Paiement échoué
 * - Limite de plan atteinte
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BusinessNotification,
  NotificationType,
  NotificationPriority,
  Vehicle,
  Inspection,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  NOTIFICATIONS: '@fleetcore_business_notifications',
  NOTIFICATION_RULES: '@fleetcore_notification_rules',
  NOTIFICATION_SETTINGS: '@fleetcore_notification_settings',
};

// Seuils par défaut
const DEFAULT_THRESHOLDS = {
  inspectionOverdueDays: 7,           // Jours avant alerte inspection en retard
  blockingDefectHours: 24,            // Heures avant rappel défaut bloquant
  planLimitWarningPercent: 80,        // % d'utilisation avant alerte
  documentExpiryDays: 30,             // Jours avant expiration document
};

// ============================================================================
// GESTION DES NOTIFICATIONS
// ============================================================================

/**
 * Récupère toutes les notifications
 */
export async function getNotifications(): Promise<BusinessNotification[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Récupère les notifications non lues
 */
export async function getUnreadNotifications(): Promise<BusinessNotification[]> {
  const notifications = await getNotifications();
  return notifications.filter(n => !n.isRead && !n.isDismissed);
}

/**
 * Récupère les notifications par priorité
 */
export async function getNotificationsByPriority(
  priority: NotificationPriority
): Promise<BusinessNotification[]> {
  const notifications = await getNotifications();
  return notifications.filter(n => n.priority === priority && !n.isDismissed);
}

/**
 * Crée une nouvelle notification
 */
export async function createNotification(params: {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  userId?: string;
  roleTargets?: string[];
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}): Promise<BusinessNotification> {
  const notifications = await getNotifications();
  
  const notification: BusinessNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: params.type,
    priority: params.priority,
    title: params.title,
    message: params.message,
    userId: params.userId,
    roleTargets: params.roleTargets,
    entityType: params.entityType as any,
    entityId: params.entityId,
    isRead: false,
    isDismissed: false,
    actionUrl: params.actionUrl,
    actionLabel: params.actionLabel,
    createdAt: new Date().toISOString(),
    expiresAt: params.expiresAt,
  };
  
  notifications.unshift(notification);
  
  // Limiter à 500 notifications
  const trimmed = notifications.slice(0, 500);
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed));
  
  return notification;
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationRead(id: string): Promise<void> {
  const notifications = await getNotifications();
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllNotificationsRead(): Promise<number> {
  const notifications = await getNotifications();
  let count = 0;
  
  notifications.forEach(n => {
    if (!n.isRead) {
      n.isRead = true;
      n.readAt = new Date().toISOString();
      count++;
    }
  });
  
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  return count;
}

/**
 * Rejette une notification
 */
export async function dismissNotification(id: string): Promise<void> {
  const notifications = await getNotifications();
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.isDismissed = true;
    notification.dismissedAt = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
}

/**
 * Supprime les notifications expirées
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const notifications = await getNotifications();
  const now = new Date().toISOString();
  
  const active = notifications.filter(n => {
    if (n.expiresAt && n.expiresAt < now) {
      return false;
    }
    return true;
  });
  
  const removed = notifications.length - active.length;
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(active));
  
  return removed;
}

// ============================================================================
// RÈGLES DE NOTIFICATION
// ============================================================================

/**
 * Vérifie les inspections en retard et crée des notifications
 */
export async function checkOverdueInspections(
  vehicles: Vehicle[],
  thresholdDays: number = DEFAULT_THRESHOLDS.inspectionOverdueDays
): Promise<BusinessNotification[]> {
  const created: BusinessNotification[] = [];
  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  
  for (const vehicle of vehicles) {
    if (vehicle.status !== 'active') continue;
    
    const lastInspection = vehicle.lastInspectionDate 
      ? new Date(vehicle.lastInspectionDate).getTime()
      : 0;
    
    if (now - lastInspection > thresholdMs) {
      // Vérifier si une notification existe déjà
      const existing = await findExistingNotification(
        'inspection_overdue',
        'vehicle',
        vehicle.id
      );
      
      if (!existing) {
        const notification = await createNotification({
          type: 'inspection_overdue',
          priority: 'high',
          title: 'Inspection en retard',
          message: `Le véhicule ${vehicle.unit} (${vehicle.plate}) n'a pas été inspecté depuis plus de ${thresholdDays} jours.`,
          roleTargets: ['manager', 'dispatcher', 'technician'],
          entityType: 'vehicle',
          entityId: vehicle.id,
          actionUrl: `/vehicle/${vehicle.id}`,
          actionLabel: 'Voir le véhicule',
        });
        created.push(notification);
      }
    }
  }
  
  return created;
}

/**
 * Vérifie les défauts bloquants non résolus
 */
export async function checkUnresolvedBlockingDefects(
  inspections: Inspection[],
  thresholdHours: number = DEFAULT_THRESHOLDS.blockingDefectHours
): Promise<BusinessNotification[]> {
  const created: BusinessNotification[] = [];
  const now = Date.now();
  const thresholdMs = thresholdHours * 60 * 60 * 1000;
  
  const blockedInspections = inspections.filter(i => i.status === 'BLOCKED');
  
  for (const inspection of blockedInspections) {
    const blockedAt = new Date(inspection.updatedAt).getTime();
    
    if (now - blockedAt > thresholdMs) {
      const existing = await findExistingNotification(
        'blocking_defect_unresolved',
        'inspection',
        inspection.id
      );
      
      if (!existing) {
        const notification = await createNotification({
          type: 'blocking_defect_unresolved',
          priority: 'critical',
          title: 'Défaut bloquant non résolu',
          message: `L'inspection ${inspection.id} a un défaut bloquant non résolu depuis plus de ${thresholdHours} heures.`,
          roleTargets: ['manager', 'technician', 'admin'],
          entityType: 'inspection',
          entityId: inspection.id,
          actionUrl: `/inspection/${inspection.id}`,
          actionLabel: 'Voir l\'inspection',
        });
        created.push(notification);
      }
    }
  }
  
  return created;
}

/**
 * Alerte si un véhicule bloqué est utilisé
 */
export async function alertVehicleUsedWhileBlocked(
  vehicle: Vehicle,
  userId: string,
  userName: string
): Promise<BusinessNotification> {
  return createNotification({
    type: 'vehicle_used_while_blocked',
    priority: 'critical',
    title: 'ALERTE: Véhicule bloqué utilisé',
    message: `Le véhicule ${vehicle.unit} (${vehicle.plate}) a été utilisé par ${userName} alors qu'il est interdit de circuler.`,
    roleTargets: ['admin', 'manager'],
    entityType: 'vehicle',
    entityId: vehicle.id,
    actionUrl: `/vehicle/${vehicle.id}`,
    actionLabel: 'Voir le véhicule',
  });
}

/**
 * Notification de paiement échoué
 */
export async function notifyPaymentFailed(
  companyId: string,
  companyName: string,
  amount: number,
  currency: string = 'CAD'
): Promise<BusinessNotification> {
  return createNotification({
    type: 'payment_failed',
    priority: 'high',
    title: 'Paiement échoué',
    message: `Le paiement de ${amount} ${currency} pour ${companyName} a échoué. Veuillez mettre à jour vos informations de paiement.`,
    roleTargets: ['admin'],
    entityType: 'user',
    entityId: companyId,
    actionUrl: '/settings/billing',
    actionLabel: 'Gérer la facturation',
  });
}

/**
 * Notification de limite de plan approchant
 */
export async function notifyPlanLimitApproaching(
  resourceType: 'vehicles' | 'inspections' | 'users',
  currentUsage: number,
  limit: number,
  percentUsed: number
): Promise<BusinessNotification> {
  const resourceNames: Record<string, string> = {
    vehicles: 'véhicules',
    inspections: 'inspections',
    users: 'utilisateurs',
  };
  
  return createNotification({
    type: 'plan_limit_approaching',
    priority: percentUsed >= 95 ? 'critical' : 'high',
    title: 'Limite de plan approchant',
    message: `Vous avez utilisé ${currentUsage}/${limit} ${resourceNames[resourceType]} (${percentUsed}%). Envisagez de passer à un plan supérieur.`,
    roleTargets: ['admin'],
    actionUrl: '/settings/subscription',
    actionLabel: 'Gérer l\'abonnement',
  });
}

/**
 * Notification de document expirant
 */
export async function notifyDocumentExpiring(
  vehicle: Vehicle,
  documentType: string,
  expiryDate: string,
  daysUntilExpiry: number
): Promise<BusinessNotification> {
  const priority: NotificationPriority = 
    daysUntilExpiry <= 7 ? 'critical' :
    daysUntilExpiry <= 14 ? 'high' : 'medium';
  
  return createNotification({
    type: 'document_expiring',
    priority,
    title: `Document expire bientôt`,
    message: `Le ${documentType} du véhicule ${vehicle.unit} (${vehicle.plate}) expire le ${expiryDate} (dans ${daysUntilExpiry} jours).`,
    roleTargets: ['manager', 'admin'],
    entityType: 'vehicle',
    entityId: vehicle.id,
    actionUrl: `/vehicle/${vehicle.id}/documents`,
    actionLabel: 'Voir les documents',
  });
}

/**
 * Notification de maintenance due
 */
export async function notifyMaintenanceDue(
  vehicle: Vehicle,
  maintenanceType: string,
  dueDate: string
): Promise<BusinessNotification> {
  return createNotification({
    type: 'maintenance_due',
    priority: 'medium',
    title: 'Maintenance requise',
    message: `Le véhicule ${vehicle.unit} (${vehicle.plate}) nécessite une ${maintenanceType} prévue pour le ${dueDate}.`,
    roleTargets: ['manager', 'technician'],
    entityType: 'vehicle',
    entityId: vehicle.id,
    actionUrl: `/vehicle/${vehicle.id}`,
    actionLabel: 'Planifier la maintenance',
  });
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Recherche une notification existante non rejetée
 */
async function findExistingNotification(
  type: NotificationType,
  entityType: string,
  entityId: string
): Promise<BusinessNotification | null> {
  const notifications = await getNotifications();
  return notifications.find(n => 
    n.type === type && 
    n.entityType === entityType && 
    n.entityId === entityId && 
    !n.isDismissed
  ) || null;
}

/**
 * Compte les notifications par type
 */
export async function getNotificationCounts(): Promise<{
  total: number;
  unread: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}> {
  const notifications = await getNotifications();
  const active = notifications.filter(n => !n.isDismissed);
  
  return {
    total: active.length,
    unread: active.filter(n => !n.isRead).length,
    critical: active.filter(n => n.priority === 'critical').length,
    high: active.filter(n => n.priority === 'high').length,
    medium: active.filter(n => n.priority === 'medium').length,
    low: active.filter(n => n.priority === 'low').length,
  };
}

/**
 * Récupère la couleur associée à une priorité
 */
export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    critical: '#DC2626',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#10B981',
  };
  return colors[priority];
}

/**
 * Récupère le libellé d'une priorité
 */
export function getPriorityLabel(priority: NotificationPriority): string {
  const labels: Record<NotificationPriority, string> = {
    critical: 'Critique',
    high: 'Élevée',
    medium: 'Moyenne',
    low: 'Faible',
  };
  return labels[priority];
}

/**
 * Récupère l'icône d'un type de notification
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    inspection_overdue: 'clock.fill',
    blocking_defect_unresolved: 'exclamationmark.triangle.fill',
    vehicle_used_while_blocked: 'xmark.octagon.fill',
    payment_failed: 'creditcard.fill',
    plan_limit_approaching: 'chart.bar.fill',
    document_expiring: 'doc.fill',
    maintenance_due: 'wrench.fill',
    work_order_assigned: 'clipboard.fill',
    inspection_completed: 'checkmark.circle.fill',
  };
  return icons[type] || 'bell.fill';
}
