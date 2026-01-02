import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { getNotificationSettings, saveNotificationSettings } from '@/lib/notification-service';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState({
    enabled: true,
    inspectionCompleted: true,
    majorDefects: true,
    maintenanceDue: true,
    paymentReminders: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await getNotificationSettings();
    if (saved) {
      setSettings(saved);
    }
  };

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ opacity: 0.7 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
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
