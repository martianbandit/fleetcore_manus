/**
 * Push Notification Service - Gestion des notifications push pour FleetCore
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getUpcomingReminders, 
  type UpcomingEvent,
  reminderTypeConfig,
} from './calendar-service';

// Storage keys
const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: 'fleetcore_notifications_enabled',
  NOTIFICATION_SETTINGS: 'fleetcore_notification_settings',
  SCHEDULED_NOTIFICATIONS: 'fleetcore_scheduled_notifications',
  PUSH_TOKEN: 'fleetcore_push_token',
};

// Types
export interface NotificationSettings {
  enabled: boolean;
  reminderDaysBefore: number[];
  overdueAlerts: boolean;
  dailyDigest: boolean;
  dailyDigestTime: string; // HH:mm format
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface ScheduledNotification {
  id: string;
  reminderId: string;
  scheduledFor: string;
  type: 'reminder' | 'overdue' | 'digest';
  notificationId: string;
}

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderDaysBefore: [7, 3, 1, 0],
  overdueAlerts: true,
  dailyDigest: false,
  dailyDigestTime: '08:00',
  soundEnabled: true,
  vibrationEnabled: true,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('fleetcore-reminders', {
      name: 'Rappels FleetCore',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('fleetcore-alerts', {
      name: 'Alertes FleetCore',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(updated));
    
    // Reschedule notifications if settings changed
    if (updated.enabled) {
      await scheduleAllReminderNotifications();
    } else {
      await cancelAllScheduledNotifications();
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
}

/**
 * Schedule a single notification
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data: Record<string, any>,
  triggerDate: Date,
  channelId: string = 'fleetcore-reminders'
): Promise<string> {
  const settings = await getNotificationSettings();
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: settings.soundEnabled ? 'default' : undefined,
      vibrate: settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? channelId : undefined,
    },
  });

  return notificationId;
}

/**
 * Schedule notifications for a single reminder
 */
export async function scheduleReminderNotifications(reminder: UpcomingEvent): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return;

  const typeConfig = reminderTypeConfig[reminder.type];
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();

  // Schedule notifications for each reminder day
  for (const daysBefore of settings.reminderDaysBefore) {
    const notifyDate = new Date(dueDate);
    notifyDate.setDate(notifyDate.getDate() - daysBefore);
    notifyDate.setHours(9, 0, 0, 0); // 9:00 AM

    // Only schedule future notifications
    if (notifyDate > now) {
      const title = daysBefore === 0 
        ? `⚠️ ${typeConfig.label} - Aujourd'hui!`
        : daysBefore === 1
          ? `⏰ ${typeConfig.label} - Demain`
          : `📅 ${typeConfig.label} - Dans ${daysBefore} jours`;

      const body = reminder.vehicleName 
        ? `${reminder.title} pour ${reminder.vehicleName}`
        : reminder.title;

      await scheduleNotification(
        title,
        body,
        { 
          reminderId: reminder.id, 
          type: 'reminder',
          screen: `/reminder/${reminder.id}`,
        },
        notifyDate,
        daysBefore <= 1 ? 'fleetcore-alerts' : 'fleetcore-reminders'
      );
    }
  }

  // Schedule overdue alert if enabled
  if (settings.overdueAlerts && reminder.isOverdue) {
    const overdueDate = new Date();
    overdueDate.setHours(overdueDate.getHours() + 1); // 1 hour from now

    await scheduleNotification(
      `🚨 URGENT: ${typeConfig.label} en retard!`,
      reminder.vehicleName 
        ? `${reminder.title} pour ${reminder.vehicleName} est en retard de ${Math.abs(reminder.daysUntilDue)} jour(s)`
        : `${reminder.title} est en retard de ${Math.abs(reminder.daysUntilDue)} jour(s)`,
      { 
        reminderId: reminder.id, 
        type: 'overdue',
        screen: `/reminder/${reminder.id}`,
      },
      overdueDate,
      'fleetcore-alerts'
    );
  }
}

/**
 * Schedule notifications for all upcoming reminders
 */
export async function scheduleAllReminderNotifications(): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return;

  try {
    // Cancel existing notifications first
    await cancelAllScheduledNotifications();

    // Get all upcoming reminders
    const reminders = await getUpcomingReminders(90); // Next 90 days

    // Schedule notifications for each reminder
    for (const reminder of reminders) {
      await scheduleReminderNotifications(reminder);
    }

    console.log(`Scheduled notifications for ${reminders.length} reminders`);
  } catch (error) {
    console.error('Error scheduling reminder notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Cancel notifications for a specific reminder
 */
export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduled) {
      if (notification.content.data?.reminderId === reminderId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling reminder notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send immediate notification (for testing)
 */
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Test FleetCore',
      body: 'Les notifications fonctionnent correctement!',
      data: { type: 'test' },
    },
    trigger: null, // Immediate
  });
}

/**
 * Get badge count (overdue reminders)
 */
export async function updateBadgeCount(): Promise<void> {
  try {
    const reminders = await getUpcomingReminders(365);
    const overdueCount = reminders.filter(r => r.isOverdue).length;
    await Notifications.setBadgeCountAsync(overdueCount);
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Initialize notification service
 */
export async function initializeNotifications(): Promise<boolean> {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    await scheduleAllReminderNotifications();
    await updateBadgeCount();
  }

  return hasPermission;
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}
