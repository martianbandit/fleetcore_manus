/**
 * Calendar Sync Settings Screen - Synchronisation Google Calendar
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getGoogleCalendarSyncStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  toggleGoogleCalendarSync,
  syncAllRemindersToGoogleCalendar,
  type GoogleCalendarSyncStatus,
} from '@/lib/calendar-service';

export default function CalendarSyncScreen() {
  const colors = useColors();
  const router = useRouter();
  const [status, setStatus] = useState<GoogleCalendarSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const syncStatus = await getGoogleCalendarSyncStatus();
      setStatus(syncStatus);
    } catch (error) {
      console.error('Error loading sync status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConnect = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSyncing(true);
    try {
      const success = await connectGoogleCalendar();
      if (success) {
        Alert.alert('Succès', 'Compte Google Calendar connecté!');
        await loadStatus();
      } else {
        Alert.alert('Erreur', 'Impossible de connecter Google Calendar');
      }
    } catch (error) {
      console.error('Error connecting:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Déconnecter Google Calendar',
      'Voulez-vous vraiment déconnecter votre compte Google Calendar?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            await disconnectGoogleCalendar();
            await loadStatus();
          },
        },
      ]
    );
  };

  const handleToggleSync = async (enabled: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSyncing(true);
    try {
      await toggleGoogleCalendarSync(enabled);
      await loadStatus();
      
      if (enabled) {
        Alert.alert('Synchronisation activée', 'Vos rappels seront synchronisés avec Google Calendar');
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      Alert.alert('Erreur', 'Impossible de modifier la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setSyncing(true);
    try {
      const result = await syncAllRemindersToGoogleCalendar();
      await loadStatus();
      
      Alert.alert(
        'Synchronisation terminée',
        `${result.synced} rappel(s) synchronisé(s)\n${result.failed} échec(s)`
      );
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Erreur', 'Impossible de synchroniser');
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !status) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={({ pressed }) => [
                { backgroundColor: colors.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </Pressable>
            <View>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Google Calendar
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Synchronisation des rappels
              </Text>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        <View className="px-4 mb-4">
          <View 
            className="rounded-2xl p-5 border"
            style={{ 
              backgroundColor: status.isConnected ? `${colors.success}10` : colors.surface,
              borderColor: status.isConnected ? colors.success : colors.border,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View 
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ 
                  backgroundColor: status.isConnected 
                    ? `${colors.success}20` 
                    : `${colors.muted}20` 
                }}
              >
                <IconSymbol 
                  name="calendar" 
                  size={28} 
                  color={status.isConnected ? colors.success : colors.muted} 
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-lg" style={{ color: colors.foreground }}>
                  {status.isConnected ? 'Connecté' : 'Non connecté'}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {status.isConnected 
                    ? `Calendrier: ${status.calendarId || 'Principal'}`
                    : 'Connectez votre compte Google'
                  }
                </Text>
                {status.lastSyncAt && (
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    Dernière sync: {new Date(status.lastSyncAt).toLocaleString('fr-CA')}
                  </Text>
                )}
              </View>
            </View>

            {/* Connect/Disconnect Button */}
            <Pressable
              onPress={status.isConnected ? handleDisconnect : handleConnect}
              disabled={syncing}
              className="mt-4 py-3 rounded-xl items-center"
              style={({ pressed }) => [
                { 
                  backgroundColor: status.isConnected ? `${colors.error}15` : colors.primary,
                  borderWidth: status.isConnected ? 1 : 0,
                  borderColor: colors.error,
                },
                pressed && { opacity: 0.8 },
                syncing && { opacity: 0.5 },
              ]}
            >
              <Text 
                className="font-semibold"
                style={{ color: status.isConnected ? colors.error : '#FFFFFF' }}
              >
                {syncing 
                  ? 'Chargement...' 
                  : status.isConnected 
                    ? 'Déconnecter' 
                    : 'Connecter Google Calendar'
                }
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sync Options (only if connected) */}
        {status.isConnected && (
          <>
            {/* Auto Sync Toggle */}
            <View className="px-4 mb-4">
              <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
                SYNCHRONISATION
              </Text>
              <View 
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <Pressable
                  onPress={() => handleToggleSync(!status.syncEnabled)}
                  disabled={syncing}
                  className="flex-row items-center justify-between px-4 py-4"
                  style={({ pressed }) => [
                    { borderBottomWidth: 1, borderBottomColor: colors.border },
                    pressed && { backgroundColor: `${colors.primary}10` },
                  ]}
                >
                  <View className="flex-row items-center gap-3">
                    <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                    <View>
                      <Text className="font-medium" style={{ color: colors.foreground }}>
                        Synchronisation automatique
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        Synchroniser les rappels automatiquement
                      </Text>
                    </View>
                  </View>
                  <View 
                    className="w-12 h-7 rounded-full justify-center px-1"
                    style={{ backgroundColor: status.syncEnabled ? colors.success : colors.border }}
                  >
                    <View 
                      className="w-5 h-5 rounded-full"
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        alignSelf: status.syncEnabled ? 'flex-end' : 'flex-start',
                      }}
                    />
                  </View>
                </Pressable>

                {/* Manual Sync */}
                <Pressable
                  onPress={handleManualSync}
                  disabled={syncing || !status.syncEnabled}
                  className="flex-row items-center justify-between px-4 py-4"
                  style={({ pressed }) => [
                    pressed && { backgroundColor: `${colors.primary}10` },
                    !status.syncEnabled && { opacity: 0.5 },
                  ]}
                >
                  <View className="flex-row items-center gap-3">
                    <IconSymbol name="arrow.clockwise" size={20} color={colors.foreground} />
                    <View>
                      <Text className="font-medium" style={{ color: colors.foreground }}>
                        Synchroniser maintenant
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        Forcer la synchronisation de tous les rappels
                      </Text>
                    </View>
                  </View>
                  {syncing && <ActivityIndicator size="small" color={colors.primary} />}
                </Pressable>
              </View>
            </View>

            {/* What Gets Synced */}
            <View className="px-4 mb-4">
              <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
                ÉLÉMENTS SYNCHRONISÉS
              </Text>
              <View 
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View className="gap-3">
                  {[
                    { icon: 'clipboard.fill', label: 'Inspections périodiques', color: '#0066CC' },
                    { icon: 'wrench.fill', label: 'Maintenance préventive', color: '#F59E0B' },
                    { icon: 'shield.fill', label: 'Expiration assurance', color: '#10B981' },
                    { icon: 'doc.text.fill', label: 'Expiration immatriculation', color: '#8B5CF6' },
                    { icon: 'calendar', label: 'Rappels personnalisés', color: '#6B7280' },
                  ].map((item, index) => (
                    <View key={index} className="flex-row items-center gap-3">
                      <View 
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <IconSymbol name={item.icon as any} size={16} color={item.color} />
                      </View>
                      <Text className="font-medium" style={{ color: colors.foreground }}>
                        {item.label}
                      </Text>
                      <IconSymbol name="checkmark" size={16} color={colors.success} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Sync Errors */}
        {status.syncErrors.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold mb-3" style={{ color: colors.error }}>
              ERREURS DE SYNCHRONISATION
            </Text>
            <View 
              className="rounded-xl p-4 border"
              style={{ backgroundColor: `${colors.error}10`, borderColor: colors.error }}
            >
              {status.syncErrors.slice(-3).map((error, index) => (
                <Text 
                  key={index} 
                  className="text-sm mb-1" 
                  style={{ color: colors.error }}
                >
                  {error}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Info */}
        <View className="px-4 mb-8">
          <View 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: `${colors.primary}10`, borderColor: colors.primary }}
          >
            <View className="flex-row items-start gap-3">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View className="flex-1">
                <Text className="font-medium mb-1" style={{ color: colors.foreground }}>
                  À propos de la synchronisation
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Les rappels FleetCore seront créés comme événements dans votre Google Calendar. 
                  Les modifications dans FleetCore seront automatiquement reflétées dans votre calendrier.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
});
