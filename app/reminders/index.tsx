/**
 * Reminders Screen - Gestion des rappels et dates critiques
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ReminderCard } from '@/components/ui/reminder-card';
import { CalendarMiniWidget } from '@/components/ui/calendar-mini-widget';
import { useColors } from '@/hooks/use-colors';
import {
  getUpcomingReminders,
  getReminderStats,
  completeReminder,
  deleteReminder,
  type UpcomingEvent,
  type ReminderType,
  reminderTypeConfig,
} from '@/lib/calendar-service';

type FilterType = 'all' | 'overdue' | 'week' | 'month';

const filterConfig: Record<FilterType, { label: string; icon: string }> = {
  all: { label: 'Tous', icon: 'clipboard.fill' },
  overdue: { label: 'En retard', icon: 'exclamationmark.triangle.fill' },
  week: { label: 'Cette semaine', icon: 'clock.fill' },
  month: { label: 'Ce mois', icon: 'calendar' },
};

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const [reminders, setReminders] = useState<UpcomingEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedType, setSelectedType] = useState<ReminderType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [remindersData, statsData] = await Promise.all([
        getUpcomingReminders(365),
        getReminderStats(),
      ]);
      setReminders(remindersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleComplete = async (id: string) => {
    Alert.alert(
      'Marquer comme complété',
      'Voulez-vous marquer ce rappel comme complété ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await completeReminder(id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              loadData();
            } catch (error) {
              console.error('Error completing reminder:', error);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Supprimer le rappel',
      'Voulez-vous vraiment supprimer ce rappel ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReminder(id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              loadData();
            } catch (error) {
              console.error('Error deleting reminder:', error);
            }
          },
        },
      ]
    );
  };

  // Filtrer les rappels
  const filteredReminders = reminders.filter(r => {
    // Filtre par type
    if (selectedType && r.type !== selectedType) return false;
    
    // Filtre par période
    switch (filter) {
      case 'overdue':
        return r.isOverdue;
      case 'week':
        return r.daysUntilDue <= 7;
      case 'month':
        return r.daysUntilDue <= 30;
      default:
        return true;
    }
  });

  const handleFilterChange = (newFilter: FilterType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter(newFilter);
  };

  const handleTypeFilter = (type: ReminderType | null) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedType(type === selectedType ? null : type);
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <View className="flex-row items-center justify-between">
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
                  Rappels
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Dates critiques et échéances
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowCalendar(!showCalendar)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={({ pressed }) => [
                  { backgroundColor: showCalendar ? colors.primary : colors.surface },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol 
                  name="calendar" 
                  size={20} 
                  color={showCalendar ? '#FFFFFF' : colors.foreground} 
                />
              </Pressable>
              <Pressable
                onPress={() => router.push('/reminders/create' as any)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={({ pressed }) => [
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol name="plus" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Stats */}
        {stats && (
          <View className="px-4 mb-4">
            <View className="flex-row gap-2">
              <View 
                className="flex-1 rounded-xl p-3 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.pending}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  En attente
                </Text>
              </View>
              <View 
                className="flex-1 rounded-xl p-3 border"
                style={{ 
                  backgroundColor: stats.overdue > 0 ? `${colors.error}15` : colors.surface, 
                  borderColor: stats.overdue > 0 ? colors.error : colors.border 
                }}
              >
                <Text 
                  className="text-2xl font-bold" 
                  style={{ color: stats.overdue > 0 ? colors.error : colors.foreground }}
                >
                  {stats.overdue}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  En retard
                </Text>
              </View>
              <View 
                className="flex-1 rounded-xl p-3 border"
                style={{ 
                  backgroundColor: stats.dueThisWeek > 0 ? `${colors.warning}15` : colors.surface, 
                  borderColor: stats.dueThisWeek > 0 ? colors.warning : colors.border 
                }}
              >
                <Text 
                  className="text-2xl font-bold" 
                  style={{ color: stats.dueThisWeek > 0 ? colors.warning : colors.foreground }}
                >
                  {stats.dueThisWeek}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  Cette semaine
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Calendar Widget */}
        {showCalendar && (
          <View className="px-4 mb-4">
            <CalendarMiniWidget
              onDayPress={(date, events) => {
                if (events.length > 0) {
                  // Scroll to first event or show modal
                  console.log('Events on', date, events);
                }
              }}
            />
          </View>
        )}

        {/* Filter Tabs */}
        <View className="px-4 mb-3">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(Object.keys(filterConfig) as FilterType[]).map((key) => {
              const config = filterConfig[key];
              const isActive = filter === key;
              const count = key === 'overdue' 
                ? stats?.overdue 
                : key === 'week' 
                  ? stats?.dueThisWeek 
                  : key === 'month'
                    ? stats?.dueThisMonth
                    : stats?.pending;

              return (
                <Pressable
                  key={key}
                  onPress={() => handleFilterChange(key)}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-full"
                  style={({ pressed }) => [
                    { 
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <IconSymbol 
                    name={config.icon as any} 
                    size={16} 
                    color={isActive ? '#FFFFFF' : colors.muted} 
                  />
                  <Text 
                    className="font-medium"
                    style={{ color: isActive ? '#FFFFFF' : colors.foreground }}
                  >
                    {config.label}
                  </Text>
                  {count !== undefined && count > 0 && (
                    <View 
                      className="px-1.5 py-0.5 rounded-full min-w-[20px] items-center"
                      style={{ 
                        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${colors.primary}20` 
                      }}
                    >
                      <Text 
                        className="text-xs font-bold"
                        style={{ color: isActive ? '#FFFFFF' : colors.primary }}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Type Filter */}
        <View className="px-4 mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {(Object.keys(reminderTypeConfig) as ReminderType[]).map((type) => {
              const config = reminderTypeConfig[type];
              const isActive = selectedType === type;
              const count = stats?.byType?.[type] || 0;

              if (count === 0 && !isActive) return null;

              return (
                <Pressable
                  key={type}
                  onPress={() => handleTypeFilter(type)}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={({ pressed }) => [
                    { 
                      backgroundColor: isActive ? `${config.color}20` : colors.surface,
                      borderWidth: 1,
                      borderColor: isActive ? config.color : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <IconSymbol 
                    name={config.icon as any} 
                    size={14} 
                    color={isActive ? config.color : colors.muted} 
                  />
                  <Text 
                    className="text-sm"
                    style={{ color: isActive ? config.color : colors.muted }}
                  >
                    {config.label}
                  </Text>
                  <Text 
                    className="text-xs font-bold"
                    style={{ color: isActive ? config.color : colors.muted }}
                  >
                    ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Reminders List */}
        <View className="px-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onPress={() => router.push(`/reminder/${reminder.id}` as any)}
                onComplete={() => handleComplete(reminder.id)}
              />
            ))
          ) : (
            <View 
              className="py-12 items-center rounded-xl border"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <IconSymbol name="calendar" size={48} color={colors.muted} />
              <Text className="text-lg font-medium mt-4" style={{ color: colors.foreground }}>
                Aucun rappel
              </Text>
              <Text className="text-sm mt-1 text-center px-8" style={{ color: colors.muted }}>
                {filter === 'overdue' 
                  ? 'Aucun rappel en retard'
                  : filter === 'week'
                    ? 'Aucun rappel cette semaine'
                    : filter === 'month'
                      ? 'Aucun rappel ce mois'
                      : 'Créez des rappels pour vos véhicules'
                }
              </Text>
              {filter === 'all' && (
                <Pressable
                  onPress={() => router.push('/reminders/create' as any)}
                  className="mt-4 px-6 py-3 rounded-xl"
                  style={({ pressed }) => [
                    { backgroundColor: colors.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                    Créer un rappel
                  </Text>
                </Pressable>
              )}
            </View>
          )}
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
});
