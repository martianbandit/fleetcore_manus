/**
 * UpcomingEventsWidget - Widget des événements à venir pour le Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ReminderCard } from '@/components/ui/reminder-card';
import { useColors } from '@/hooks/use-colors';
import { 
  getUpcomingReminders,
  getReminderStats,
  completeReminder,
  type UpcomingEvent,
} from '@/lib/calendar-service';

interface UpcomingEventsWidgetProps {
  maxItems?: number;
  showHeader?: boolean;
  onRefresh?: () => void;
}

export function UpcomingEventsWidget({ 
  maxItems = 3,
  showHeader = true,
  onRefresh,
}: UpcomingEventsWidgetProps) {
  const colors = useColors();
  const router = useRouter();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [stats, setStats] = useState<{ overdue: number; dueThisWeek: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [upcomingEvents, reminderStats] = await Promise.all([
        getUpcomingReminders(30),
        getReminderStats(),
      ]);
      setEvents(upcomingEvents.slice(0, maxItems));
      setStats({
        overdue: reminderStats.overdue,
        dueThisWeek: reminderStats.dueThisWeek,
      });
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleComplete = async (id: string) => {
    try {
      await completeReminder(id);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      loadData();
      onRefresh?.();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleViewAll = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/reminders' as any);
  };

  if (loading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View>
      {showHeader && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="calendar" size={20} color={colors.primary} />
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              Rappels à venir
            </Text>
          </View>
          <Pressable
            onPress={handleViewAll}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary }}>
              Voir tout
            </Text>
          </Pressable>
        </View>
      )}

      {/* Stats badges */}
      {stats && (stats.overdue > 0 || stats.dueThisWeek > 0) && (
        <View className="flex-row gap-2 mb-3">
          {stats.overdue > 0 && (
            <View 
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${colors.error}20` }}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={colors.error} />
              <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                {stats.overdue} en retard
              </Text>
            </View>
          )}
          {stats.dueThisWeek > 0 && (
            <View 
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${colors.warning}20` }}
            >
              <IconSymbol name="clock.fill" size={14} color={colors.warning} />
              <Text className="text-sm font-semibold" style={{ color: colors.warning }}>
                {stats.dueThisWeek} cette semaine
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Events list */}
      {events.length > 0 ? (
        <View>
          {events.map((event) => (
            <ReminderCard
              key={event.id}
              reminder={event}
              compact
              onPress={() => router.push(`/reminder/${event.id}` as any)}
              onComplete={() => handleComplete(event.id)}
            />
          ))}
          
          {events.length >= maxItems && (
            <Pressable
              onPress={handleViewAll}
              className="py-3 items-center rounded-xl border mt-2"
              style={({ pressed }) => [
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View className="flex-row items-center gap-2">
                <Text className="font-medium" style={{ color: colors.primary }}>
                  Voir tous les rappels
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.primary} />
              </View>
            </Pressable>
          )}
        </View>
      ) : (
        <View 
          className="py-8 items-center rounded-xl border"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <IconSymbol name="calendar" size={40} color={colors.muted} />
          <Text className="text-base mt-3 font-medium" style={{ color: colors.foreground }}>
            Aucun rappel à venir
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.muted }}>
            Créez des rappels pour vos véhicules
          </Text>
          <Pressable
            onPress={() => router.push('/reminders/create' as any)}
            className="mt-4 px-4 py-2 rounded-lg"
            style={({ pressed }) => [
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
              Créer un rappel
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles additionnels si nécessaire
});
