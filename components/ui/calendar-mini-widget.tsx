/**
 * CalendarMiniWidget - Mini calendrier avec indicateurs d'événements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { 
  getUpcomingReminders,
  type UpcomingEvent,
} from '@/lib/calendar-service';

interface CalendarMiniWidgetProps {
  onDayPress?: (date: Date, events: UpcomingEvent[]) => void;
  onViewAll?: () => void;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function CalendarMiniWidget({ onDayPress, onViewAll }: CalendarMiniWidgetProps) {
  const colors = useColors();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const upcomingEvents = await getUpcomingReminders(60);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Calculer les jours du mois
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    // Padding pour le début
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentDate]);

  // Vérifier si une date a des événements
  const getEventsForDate = useCallback((date: Date): UpcomingEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.dueDate.split('T')[0] === dateStr);
  }, [events]);

  const handlePrevMonth = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayPress = (date: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    onDayPress?.(date, dayEvents);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <View 
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <IconSymbol name="calendar" size={20} color={colors.primary} />
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            Calendrier
          </Text>
        </View>
        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary }}>
              Voir tout
            </Text>
          </Pressable>
        )}
      </View>

      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={handlePrevMonth}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={({ pressed }) => [
            { backgroundColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
        </Pressable>
        <Text className="font-semibold text-base" style={{ color: colors.foreground }}>
          {MONTHS_FR[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <Pressable
          onPress={handleNextMonth}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={({ pressed }) => [
            { backgroundColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <IconSymbol name="chevron.right" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Days header */}
      <View className="flex-row mb-2">
        {DAYS_FR.map((day) => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-xs font-medium" style={{ color: colors.muted }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          const hasOverdue = dayEvents.some(e => e.isOverdue);
          const hasUrgent = dayEvents.some(e => e.daysUntilDue <= 1 && !e.isOverdue);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => handleDayPress(date)}
              style={[
                styles.dayCell,
                today && { backgroundColor: `${colors.primary}15` },
                selected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selected 
                    ? '#FFFFFF' 
                    : today 
                      ? colors.primary 
                      : colors.foreground,
                }}
              >
                {date.getDate()}
              </Text>
              {hasEvents && (
                <View className="flex-row gap-0.5 mt-0.5">
                  <View 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ 
                      backgroundColor: hasOverdue 
                        ? colors.error 
                        : hasUrgent 
                          ? colors.warning 
                          : colors.primary 
                    }}
                  />
                  {dayEvents.length > 1 && (
                    <View 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: colors.muted }}
                    />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row items-center justify-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.error }} />
          <Text className="text-xs" style={{ color: colors.muted }}>En retard</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.warning }} />
          <Text className="text-xs" style={{ color: colors.muted }}>Urgent</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
          <Text className="text-xs" style={{ color: colors.muted }}>Planifié</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});
