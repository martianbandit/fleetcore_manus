import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  inspectionCompleted: boolean;
  inspectionReminders: boolean;
  majorDefects: boolean;
  blockingDefects: boolean;
  maintenanceDue: boolean;
  paymentReminders: boolean;
  teamUpdates: boolean;
  syncAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  inspectionCompleted: true,
  inspectionReminders: true,
  majorDefects: true,
  blockingDefects: true,
  maintenanceDue: true,
  paymentReminders: true,
  teamUpdates: true,
  syncAlerts: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

/**
 * Vérifier si on est dans les heures calmes
 */
function isQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    return currentTime >= startTime || currentTime < endTime;
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }

  // Get push token for remote notifications
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '6c0f7c3d-6f5d-4e5a-9e3a-2f8b1c4d5e6f', // Replace with your Expo project ID
    });
    console.log('Push token stored');
    await AsyncStorage.setItem('pushToken', token.data);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return true;
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem('notificationSettings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * Send local notification for inspection completed
 */
export async function notifyInspectionCompleted(vehicleName: string, inspectionId: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.inspectionCompleted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Inspection terminée',
      body: `L'inspection du véhicule ${vehicleName} est terminée`,
      data: { type: 'inspection_completed', inspectionId },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send local notification for major defect detected
 */
export async function notifyMajorDefect(vehicleName: string, defectDescription: string, inspectionId: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.majorDefects) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Défaut majeur détecté',
      body: `${vehicleName}: ${defectDescription}`,
      data: { type: 'major_defect', inspectionId },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Send local notification for work order created
 */
export async function notifyWorkOrderCreated(
  vehicleName: string,
  workOrderNumber: string,
  defectCount: number
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Bon de travail créé',
      body: `${workOrderNumber}: ${defectCount} défaut(s) à corriger sur ${vehicleName}`,
      data: { type: 'work_order_created', workOrderNumber },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Send local notification for maintenance due
 */
export async function notifyMaintenanceDue(vehicleName: string, vehicleId: string, daysRemaining: number): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.maintenanceDue) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔧 Maintenance requise',
      body: `${vehicleName}: Maintenance dans ${daysRemaining} jours`,
      data: { type: 'maintenance_due', vehicleId },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Send local notification for payment reminder
 */
export async function notifyPaymentReminder(amount: number, dueDate: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.paymentReminders) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💳 Rappel de paiement',
      body: `Paiement de ${amount}$ dû le ${dueDate}`,
      data: { type: 'payment_reminder' },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Schedule recurring maintenance reminders
 */
export async function scheduleMaintenanceReminders(vehicleName: string, vehicleId: string, maintenanceDate: Date): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.maintenanceDue) return;

  const now = new Date();
  const daysUntilMaintenance = Math.floor((maintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Reminder 7 days before
  if (daysUntilMaintenance > 7) {
    const reminderDate = new Date(maintenanceDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔧 Maintenance dans 7 jours',
        body: `${vehicleName}: Planifiez la maintenance`,
        data: { type: 'maintenance_reminder', vehicleId },
        sound: true,
      },
      trigger: null, // TODO: Schedule for specific date
    });
  }

  // Reminder 1 day before
  if (daysUntilMaintenance > 1) {
    const reminderDate = new Date(maintenanceDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔧 Maintenance demain',
        body: `${vehicleName}: Maintenance prévue demain`,
        data: { type: 'maintenance_reminder', vehicleId },
        sound: true,
      },
      trigger: null, // TODO: Schedule for specific date
    });
  }
}

/**
 * Cancel all scheduled notifications for a vehicle
 */
export async function cancelVehicleNotifications(vehicleId: string): Promise<void> {
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of allNotifications) {
    if (notification.content.data?.vehicleId === vehicleId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Get notification response listener
 */
export function addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get notification received listener (foreground)
 */
export function addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Notifier un défaut bloquant (véhicule immobilisé)
 */
export async function notifyBlockingDefect(
  vehicleName: string,
  defectDescription: string,
  vehicleId: string
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.blockingDefects) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 DÉFAUT BLOQUANT - Véhicule immobilisé',
      body: `${vehicleName}: ${defectDescription}`,
      data: { type: 'blocking_defect', vehicleId },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier un rappel d'inspection
 */
export async function notifyInspectionReminder(
  vehicleName: string,
  vehicleId: string,
  inspectionType: string
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.inspectionReminders) return;
  if (isQuietHours(settings)) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Rappel d\'inspection',
      body: `${inspectionType} à effectuer pour ${vehicleName}`,
      data: { type: 'inspection_reminder', vehicleId },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier une assignation d'équipe
 */
export async function notifyTeamAssignment(
  technicianName: string,
  taskDescription: string,
  taskId: string
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.teamUpdates) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👤 Nouvelle assignation',
      body: `${technicianName} assigné à: ${taskDescription}`,
      data: { type: 'team_assignment', taskId },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier la synchronisation terminée
 */
export async function notifySyncCompleted(itemsSynced: number): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.syncAlerts || itemsSynced === 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☁️ Synchronisation terminée',
      body: `${itemsSynced} élément${itemsSynced > 1 ? 's' : ''} synchronisé${itemsSynced > 1 ? 's' : ''}`,
      data: { type: 'sync_completed', itemsSynced },
      sound: false,
    },
    trigger: null,
  });
}

/**
 * Notifier un échec de synchronisation
 */
export async function notifySyncFailed(error: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.syncAlerts) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Échec de synchronisation',
      body: `Les données n'ont pas pu être synchronisées: ${error}`,
      data: { type: 'sync_failed', error },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier l'approche de la limite du plan
 */
export async function notifyPlanLimitApproaching(
  resourceType: 'vehicles' | 'inspections' | 'users',
  current: number,
  limit: number
): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled) return;

  const resourceNames: Record<string, string> = {
    vehicles: 'véhicules',
    inspections: 'inspections',
    users: 'utilisateurs',
  };
  const percentage = Math.round((current / limit) * 100);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Limite de plan approchée',
      body: `Vous utilisez ${percentage}% de vos ${resourceNames[resourceType]} (${current}/${limit})`,
      data: { type: 'plan_limit', resourceType, current, limit },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier un paiement réussi
 */
export async function notifyPaymentSuccess(amount: number, planName: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.paymentReminders) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Paiement confirmé',
      body: `Votre paiement de ${amount.toFixed(2)}$ pour ${planName} a été accepté.`,
      data: { type: 'payment_success', amount, planName },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Notifier un échec de paiement
 */
export async function notifyPaymentFailed(amount: number, reason: string): Promise<void> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.paymentReminders) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '❌ Échec de paiement',
      body: `Le paiement de ${amount.toFixed(2)}$ a échoué: ${reason}`,
      data: { type: 'payment_failed', amount, reason },
      sound: true,
    },
    trigger: null,
  });
}

/**
 * Planifier une notification pour plus tard
 */
export async function scheduleNotification(
  title: string,
  body: string,
  scheduledFor: Date,
  data?: Record<string, any>
): Promise<string> {
  const seconds = Math.max(1, Math.floor((scheduledFor.getTime() - Date.now()) / 1000));
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
  return identifier;
}

/**
 * Planifier un rappel d'inspection quotidien
 */
export async function scheduleInspectionReminder(
  vehicleName: string,
  vehicleId: string,
  hour: number,
  minute: number
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Inspection quotidienne',
      body: `N'oubliez pas l'inspection du véhicule ${vehicleName}`,
      data: { type: 'inspection_reminder', vehicleId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return identifier;
}

/**
 * Annuler une notification planifiée
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Annuler toutes les notifications planifiées
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
