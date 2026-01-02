/**
 * Reminder Detail Screen - Détail d'un rappel
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getReminderById,
  completeReminder,
  deleteReminder,
  formatReminderDate,
  daysUntilDate,
  type FleetCoreReminder,
  reminderTypeConfig,
  priorityConfig,
} from '@/lib/calendar-service';

export default function ReminderDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reminder, setReminder] = useState<FleetCoreReminder | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReminder = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getReminderById(id);
      setReminder(data);
    } catch (error) {
      console.error('Error loading reminder:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReminder();
  }, [loadReminder]);

  const handleComplete = () => {
    Alert.alert(
      'Marquer comme complété',
      'Voulez-vous marquer ce rappel comme complété ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await completeReminder(id!);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              router.back();
            } catch (error) {
              console.error('Error completing reminder:', error);
              Alert.alert('Erreur', 'Impossible de compléter le rappel');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le rappel',
      'Voulez-vous vraiment supprimer ce rappel ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder(id!);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              router.back();
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le rappel');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!reminder) {
    return (
      <ScreenContainer className="items-center justify-center px-4">
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.muted} />
        <Text className="text-lg font-medium mt-4" style={{ color: colors.foreground }}>
          Rappel introuvable
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
            Retour
          </Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const typeConfig = reminderTypeConfig[reminder.type];
  const daysUntil = daysUntilDate(reminder.dueDate);
  const isOverdue = daysUntil < 0;
  const effectivePriority = isOverdue ? 'CRITICAL' : reminder.priority;
  const prioConfig = priorityConfig[effectivePriority];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row items-center justify-between">
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
            <View className="flex-row gap-2">
              {!reminder.isCompleted && (
                <Pressable
                  onPress={handleComplete}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={({ pressed }) => [
                    { backgroundColor: colors.success },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
                </Pressable>
              )}
              <Pressable
                onPress={handleDelete}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={({ pressed }) => [
                  { backgroundColor: `${colors.error}20` },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol name="trash.fill" size={20} color={colors.error} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Status Banner */}
        {reminder.isCompleted ? (
          <View 
            className="mx-4 mb-4 p-4 rounded-xl flex-row items-center gap-3"
            style={{ backgroundColor: `${colors.success}15` }}
          >
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <View>
              <Text className="font-semibold" style={{ color: colors.success }}>
                Rappel complété
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {reminder.completedAt 
                  ? new Date(reminder.completedAt).toLocaleDateString('fr-CA')
                  : ''
                }
              </Text>
            </View>
          </View>
        ) : isOverdue ? (
          <View 
            className="mx-4 mb-4 p-4 rounded-xl flex-row items-center gap-3"
            style={{ backgroundColor: `${colors.error}15` }}
          >
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.error} />
            <View>
              <Text className="font-semibold" style={{ color: colors.error }}>
                En retard de {Math.abs(daysUntil)} jour(s)
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Action requise immédiatement
              </Text>
            </View>
          </View>
        ) : daysUntil <= 7 ? (
          <View 
            className="mx-4 mb-4 p-4 rounded-xl flex-row items-center gap-3"
            style={{ backgroundColor: `${colors.warning}15` }}
          >
            <IconSymbol name="clock.fill" size={24} color={colors.warning} />
            <View>
              <Text className="font-semibold" style={{ color: colors.warning }}>
                {daysUntil === 0 
                  ? "Échéance aujourd'hui"
                  : daysUntil === 1
                    ? 'Échéance demain'
                    : `Dans ${daysUntil} jours`
                }
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Planifiez cette action bientôt
              </Text>
            </View>
          </View>
        ) : null}

        {/* Main Card */}
        <View 
          className="mx-4 mb-4 rounded-2xl p-4 border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {/* Type & Priority */}
          <View className="flex-row items-center justify-between mb-4">
            <View 
              className="flex-row items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${typeConfig.color}20` }}
            >
              <IconSymbol name={typeConfig.icon as any} size={16} color={typeConfig.color} />
              <Text className="text-sm font-medium" style={{ color: typeConfig.color }}>
                {typeConfig.label}
              </Text>
            </View>
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: prioConfig.bgColor }}
            >
              <Text className="text-sm font-semibold" style={{ color: prioConfig.color }}>
                {prioConfig.label}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
            {reminder.title}
          </Text>

          {/* Description */}
          {reminder.description && (
            <Text className="text-base mb-4" style={{ color: colors.muted }}>
              {reminder.description}
            </Text>
          )}

          {/* Details */}
          <View className="gap-3">
            {/* Due Date */}
            <View className="flex-row items-center gap-3">
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <IconSymbol name="calendar" size={20} color={colors.primary} />
              </View>
              <View>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  Date d'échéance
                </Text>
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {new Date(reminder.dueDate).toLocaleDateString('fr-CA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {/* Vehicle */}
            {reminder.vehicleName && (
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <IconSymbol name="car.fill" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    Véhicule
                  </Text>
                  <Text className="font-semibold" style={{ color: colors.foreground }}>
                    {reminder.vehicleName}
                  </Text>
                </View>
              </View>
            )}

            {/* Recurring */}
            {reminder.isRecurring && (
              <View className="flex-row items-center gap-3">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    Récurrence
                  </Text>
                  <Text className="font-semibold" style={{ color: colors.foreground }}>
                    Rappel annuel
                  </Text>
                </View>
              </View>
            )}

            {/* Reminder Days */}
            <View className="flex-row items-center gap-3">
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <IconSymbol name="bell.fill" size={20} color={colors.primary} />
              </View>
              <View>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  Rappels avant échéance
                </Text>
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  {reminder.reminderDays.map(d => `${d}j`).join(', ')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View 
          className="mx-4 mb-4 rounded-xl p-4 border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            INFORMATIONS
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: colors.muted }}>Créé le</Text>
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                {new Date(reminder.createdAt).toLocaleDateString('fr-CA')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: colors.muted }}>Modifié le</Text>
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                {new Date(reminder.updatedAt).toLocaleDateString('fr-CA')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm" style={{ color: colors.muted }}>ID</Text>
              <Text className="text-sm font-mono" style={{ color: colors.muted }}>
                {reminder.id.slice(0, 16)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {!reminder.isCompleted && (
          <View className="px-4 mb-8">
            <Pressable
              onPress={handleComplete}
              className="py-4 rounded-xl items-center flex-row justify-center gap-2"
              style={({ pressed }) => [
                { backgroundColor: colors.success },
                pressed && { opacity: 0.8 },
              ]}
            >
              <IconSymbol name="checkmark" size={20} color="#FFFFFF" />
              <Text className="font-bold text-lg" style={{ color: '#FFFFFF' }}>
                Marquer comme complété
              </Text>
            </Pressable>
          </View>
        )}

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
