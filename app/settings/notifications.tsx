import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { getNotificationSettings, saveNotificationSettings } from '@/lib/notification-service';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getNotificationSettings as getPushSettings,
  saveNotificationSettings as savePushSettings,
  requestNotificationPermissions,
  sendTestNotification,
  getScheduledNotifications,
  scheduleAllReminderNotifications,
  type NotificationSettings as PushSettings,
} from '@/lib/push-notification-service';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState({
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
  });
  const [pushSettings, setPushSettings] = useState<PushSettings | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAllSettings = useCallback(async () => {
    try {
      const [saved, push, scheduled] = await Promise.all([
        getNotificationSettings(),
        getPushSettings(),
        getScheduledNotifications(),
      ]);
      if (saved) setSettings(saved);
      setPushSettings(push);
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  const handleToggle = async (key: keyof typeof settings) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const handlePushToggle = async (key: keyof PushSettings, value: boolean) => {
    if (!pushSettings) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (key === 'enabled' && value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('Permissions requises', 'Veuillez autoriser les notifications dans les paramètres.');
        return;
      }
    }
    setSaving(true);
    try {
      const updated = { ...pushSettings, [key]: value };
      await savePushSettings(updated);
      setPushSettings(updated);
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      await sendTestNotification();
      Alert.alert('Succès', 'Notification de test envoyée!');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification');
    }
  };

  const handleRefreshSchedule = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSaving(true);
    try {
      await scheduleAllReminderNotifications();
      const scheduled = await getScheduledNotifications();
      setScheduledCount(scheduled.length);
      Alert.alert('Succès', `${scheduled.length} notifications planifiées`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de rafraîchir');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 0.7 }]}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Notifications
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Notifications d'inspection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            INSPECTIONS
          </Text>
          
          <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                  Inspection complétée
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Recevoir une notification lorsqu'une inspection est terminée
                </Text>
              </View>
              <Switch
                value={settings.inspectionCompleted}
                onValueChange={() => handleToggle('inspectionCompleted')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                  Défaut majeur détecté
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Alerte immédiate en cas de défaut majeur
                </Text>
              </View>
              <Switch
                value={settings.majorDefects}
                onValueChange={() => handleToggle('majorDefects')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Notifications de maintenance */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            MAINTENANCE
          </Text>
          
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                  Échéance de maintenance
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Rappel 7 jours avant l'échéance de maintenance
                </Text>
              </View>
              <Switch
                value={settings.maintenanceDue}
                onValueChange={() => handleToggle('maintenanceDue')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Notifications de paiement */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            PAIEMENTS
          </Text>
          
          <View className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                  Rappels de paiement
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Notifications pour les paiements et factures
                </Text>
              </View>
              <Switch
                value={settings.paymentReminders}
                onValueChange={() => handleToggle('paymentReminders')}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </View>



        {/* Push Notifications Section */}
        {pushSettings && (
          <View className="mb-6">
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
              RAPPELS AUTOMATIQUES
            </Text>
            
            <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: pushSettings.enabled ? `${colors.success}10` : colors.surface, borderWidth: 1, borderColor: pushSettings.enabled ? colors.success : colors.border }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                    Notifications push
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {scheduledCount} notification(s) planifiée(s)
                  </Text>
                </View>
                <Switch
                  value={pushSettings.enabled}
                  onValueChange={(v) => handlePushToggle('enabled', v)}
                  trackColor={{ false: colors.border, true: colors.success }}
                  disabled={saving}
                />
              </View>
            </View>

            <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                    Alertes en retard
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Notification pour les rappels en retard
                  </Text>
                </View>
                <Switch
                  value={pushSettings.overdueAlerts}
                  onValueChange={(v) => handlePushToggle('overdueAlerts', v)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  disabled={saving || !pushSettings.enabled}
                />
              </View>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={handleTestNotification}
                disabled={saving || !pushSettings.enabled}
                className="flex-1 py-3 rounded-xl items-center"
                style={({ pressed }) => [{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, pressed && { opacity: 0.8 }, !pushSettings.enabled && { opacity: 0.5 }]}
              >
                <Text className="font-medium" style={{ color: colors.primary }}>Test</Text>
              </Pressable>
              <Pressable
                onPress={handleRefreshSchedule}
                disabled={saving || !pushSettings.enabled}
                className="flex-1 py-3 rounded-xl items-center"
                style={({ pressed }) => [{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, pressed && { opacity: 0.8 }, !pushSettings.enabled && { opacity: 0.5 }]}
              >
                <Text className="font-medium" style={{ color: colors.foreground }}>Rafraîchir</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Note */}
        <View className="rounded-xl p-4 mb-6" style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-sm" style={{ color: colors.muted }}>
            💡 Les notifications nécessitent l'autorisation de votre appareil. Vous pouvez modifier les permissions dans les paramètres de votre téléphone.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
