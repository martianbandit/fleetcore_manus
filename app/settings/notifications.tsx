import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  clearAllNotifications,
  cancelAllScheduledNotifications,
  type NotificationSettings,
} from '@/lib/notification-service';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState<NotificationSettings>({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const saved = await getNotificationSettings();
      if (saved) setSettings(saved);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = async (key: keyof NotificationSettings) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Si on active les notifications, vérifier les permissions
    if (key === 'enabled' && !settings.enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('Permissions requises', 'Veuillez autoriser les notifications dans les paramètres de votre appareil.');
        return;
      }
    }
    
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    setSaving(true);
    try {
      await saveNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Effacer les notifications',
      'Voulez-vous effacer toutes les notifications?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            try {
              await clearAllNotifications();
              await cancelAllScheduledNotifications();
              Alert.alert('Succès', 'Toutes les notifications ont été effacées');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effacer les notifications');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const SettingRow = ({ 
    title, 
    description, 
    settingKey, 
    disabled = false 
  }: { 
    title: string; 
    description: string; 
    settingKey: keyof NotificationSettings;
    disabled?: boolean;
  }) => (
    <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
            {title}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {description}
          </Text>
        </View>
        <Switch
          value={settings[settingKey] as boolean}
          onValueChange={() => handleToggle(settingKey)}
          trackColor={{ false: colors.border, true: colors.primary }}
          disabled={disabled || saving}
        />
      </View>
    </View>
  );

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

        {/* Activation globale */}
        <View className="mb-6">
          <View 
            className="rounded-xl p-4" 
            style={{ 
              backgroundColor: settings.enabled ? `${colors.success}15` : colors.surface,
              borderWidth: 1,
              borderColor: settings.enabled ? colors.success : colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-bold mb-1" style={{ color: colors.foreground }}>
                  Notifications activées
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {settings.enabled ? 'Vous recevrez des alertes' : 'Aucune notification ne sera envoyée'}
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={() => handleToggle('enabled')}
                trackColor={{ false: colors.border, true: colors.success }}
                disabled={saving}
              />
            </View>
          </View>
        </View>

        {/* Notifications d'inspection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            INSPECTIONS
          </Text>
          
          <SettingRow
            title="Inspection complétée"
            description="Notification lorsqu'une inspection est terminée"
            settingKey="inspectionCompleted"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="Rappels d'inspection"
            description="Rappels pour les inspections à venir"
            settingKey="inspectionReminders"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="Défauts majeurs"
            description="Alerte immédiate en cas de défaut majeur"
            settingKey="majorDefects"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="Défauts bloquants"
            description="Alerte critique pour défauts bloquants"
            settingKey="blockingDefects"
            disabled={!settings.enabled}
          />
        </View>

        {/* Notifications de maintenance */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            MAINTENANCE
          </Text>
          
          <SettingRow
            title="Échéance de maintenance"
            description="Rappel 7 jours avant l'échéance"
            settingKey="maintenanceDue"
            disabled={!settings.enabled}
          />
        </View>

        {/* Notifications équipe */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            ÉQUIPE
          </Text>
          
          <SettingRow
            title="Mises à jour d'équipe"
            description="Notifications des assignations et changements"
            settingKey="teamUpdates"
            disabled={!settings.enabled}
          />
        </View>

        {/* Notifications de paiement */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            PAIEMENTS
          </Text>
          
          <SettingRow
            title="Rappels de paiement"
            description="Notifications pour les paiements et factures"
            settingKey="paymentReminders"
            disabled={!settings.enabled}
          />
        </View>

        {/* Synchronisation */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            SYNCHRONISATION
          </Text>
          
          <SettingRow
            title="Alertes de synchronisation"
            description="Notifications de succès/échec de sync"
            settingKey="syncAlerts"
            disabled={!settings.enabled}
          />
        </View>

        {/* Actions */}
        <View className="mb-6">
          <Pressable
            onPress={handleClearAll}
            className="py-4 rounded-xl items-center"
            style={({ pressed }) => [
              { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.error },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text className="font-semibold" style={{ color: colors.error }}>
              Effacer toutes les notifications
            </Text>
          </Pressable>
        </View>

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
