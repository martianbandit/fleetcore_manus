import { useState } from 'react';
import { ScrollView, Text, View, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { resetData } from '@/lib/data-service';

interface SettingItemProps {
  icon: IconSymbolName;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, iconColor, title, subtitle, onPress, rightElement }: SettingItemProps) {
  const colors = useColors();
  
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <IconSymbol name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        {subtitle && <Text className="text-sm text-muted mt-0.5">{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <IconSymbol name="chevron.right" size={18} color={colors.muted} />
      ))}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleToggleNotifications = (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setNotificationsEnabled(value);
  };

  const handleToggleDarkMode = (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDarkModeEnabled(value);
  };

  const handleResetData = () => {
    Alert.alert(
      'Réinitialiser les données',
      'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('Succès', 'Les données ont été réinitialisées.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-3xl font-bold text-foreground">Paramètres</Text>
          <Text className="text-base text-muted mt-1">
            Configuration de l'application
          </Text>
        </View>

        {/* Profile Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Profil</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <View className="p-4 flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mr-4">
                <Text className="text-2xl font-bold text-background">JT</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">Jean Tremblay</Text>
                <Text className="text-sm text-muted">Technicien d'inspection</Text>
              </View>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Préférences</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <SettingItem
              icon="bell.fill"
              iconColor="#0066CC"
              title="Notifications"
              subtitle="Recevoir des alertes"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              }
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="gearshape.fill"
              iconColor="#64748B"
              title="Mode sombre"
              subtitle="Thème de l'application"
              rightElement={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              }
            />
          </View>
        </View>

        {/* Data Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">Données</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <SettingItem
              icon="doc.text.fill"
              iconColor="#22C55E"
              title="Exporter les données"
              subtitle="Télécharger un rapport"
              onPress={() => Alert.alert('Export', 'Fonctionnalité à venir')}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="arrow.clockwise"
              iconColor="#F59E0B"
              title="Synchroniser"
              subtitle="Dernière sync: maintenant"
              onPress={() => Alert.alert('Sync', 'Données synchronisées')}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="trash.fill"
              iconColor="#EF4444"
              title="Réinitialiser les données"
              subtitle="Supprimer toutes les données locales"
              onPress={handleResetData}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted uppercase mb-3">À propos</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <SettingItem
              icon="info.circle.fill"
              iconColor="#0066CC"
              title="Version"
              subtitle="1.0.0"
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="doc.text.fill"
              iconColor="#64748B"
              title="Conditions d'utilisation"
              onPress={() => Alert.alert('Info', 'Conditions d\'utilisation')}
            />
            <View className="h-px bg-border mx-4" />
            <SettingItem
              icon="person.fill"
              iconColor="#64748B"
              title="Politique de confidentialité"
              onPress={() => Alert.alert('Info', 'Politique de confidentialité')}
            />
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <Text className="text-sm text-muted">FleetCore v1.0.0</Text>
          <Text className="text-xs text-muted mt-1">© 2024 FleetCore. Tous droits réservés.</Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});
