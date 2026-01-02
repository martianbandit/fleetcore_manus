/**
 * ReminderCard - Carte d'affichage d'un rappel
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { 
  type UpcomingEvent,
  type ReminderType,
  type ReminderPriority,
  reminderTypeConfig,
  priorityConfig,
  formatReminderDate,
} from '@/lib/calendar-service';

interface ReminderCardProps {
  reminder: UpcomingEvent;
  onPress?: () => void;
  onComplete?: () => void;
  compact?: boolean;
}

export function ReminderCard({ 
  reminder, 
  onPress, 
  onComplete,
  compact = false 
}: ReminderCardProps) {
  const colors = useColors();
  const typeConfig = reminderTypeConfig[reminder.type];
  const effectivePriority = reminder.isOverdue ? 'CRITICAL' : reminder.priority;
  const prioConfig = priorityConfig[effectivePriority];

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onComplete?.();
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactContainer,
          { 
            backgroundColor: colors.surface,
            borderColor: reminder.isOverdue ? colors.error : colors.border,
            borderLeftColor: typeConfig.color,
          },
          pressed && styles.pressed,
        ]}
      >
        <View className="flex-row items-center gap-3">
          <View 
            className="w-8 h-8 rounded-lg items-center justify-center"
            style={{ backgroundColor: `${typeConfig.color}20` }}
          >
            <IconSymbol name={typeConfig.icon as any} size={16} color={typeConfig.color} />
          </View>
          <View className="flex-1">
            <Text 
              className="font-medium text-sm" 
              style={{ color: colors.foreground }}
              numberOfLines={1}
            >
              {reminder.title}
            </Text>
            <Text className="text-xs" style={{ color: colors.muted }}>
              {formatReminderDate(reminder.dueDate)}
            </Text>
          </View>
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: prioConfig.bgColor }}
          >
            <Text className="text-xs font-medium" style={{ color: prioConfig.color }}>
              {reminder.isOverdue ? 'En retard' : prioConfig.label}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colors.surface,
          borderColor: reminder.isOverdue ? colors.error : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${typeConfig.color}20` }}
          >
            <IconSymbol name={typeConfig.icon as any} size={20} color={typeConfig.color} />
          </View>
          <View className="flex-1">
            <Text 
              className="font-semibold text-base" 
              style={{ color: colors.foreground }}
              numberOfLines={2}
            >
              {reminder.title}
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
              {typeConfig.label}
            </Text>
          </View>
        </View>
        <View 
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: prioConfig.bgColor }}
        >
          <Text className="text-xs font-semibold" style={{ color: prioConfig.color }}>
            {reminder.isOverdue ? 'EN RETARD' : prioConfig.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View className="flex-row items-center gap-4 mb-3">
        {reminder.vehicleName && (
          <View className="flex-row items-center gap-1.5">
            <IconSymbol name="car.fill" size={14} color={colors.muted} />
            <Text className="text-sm" style={{ color: colors.muted }}>
              {reminder.vehicleName}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-1.5">
          <IconSymbol name="calendar" size={14} color={colors.muted} />
          <Text 
            className="text-sm font-medium" 
            style={{ color: reminder.isOverdue ? colors.error : colors.foreground }}
          >
            {formatReminderDate(reminder.dueDate)}
          </Text>
        </View>
      </View>

      {/* Days indicator */}
      {!reminder.isOverdue && reminder.daysUntilDue <= 7 && (
        <View 
          className="rounded-lg p-2 mb-3"
          style={{ 
            backgroundColor: reminder.daysUntilDue <= 1 
              ? `${colors.error}15` 
              : reminder.daysUntilDue <= 3 
                ? `${colors.warning}15`
                : `${colors.primary}10`
          }}
        >
          <Text 
            className="text-center text-sm font-medium"
            style={{ 
              color: reminder.daysUntilDue <= 1 
                ? colors.error 
                : reminder.daysUntilDue <= 3 
                  ? colors.warning
                  : colors.primary
            }}
          >
            {reminder.daysUntilDue === 0 
              ? "⚠️ À faire aujourd'hui"
              : reminder.daysUntilDue === 1
                ? "⏰ À faire demain"
                : `📅 Dans ${reminder.daysUntilDue} jours`
            }
          </Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-2">
        {onComplete && (
          <Pressable
            onPress={handleComplete}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={({ pressed }) => [
              { backgroundColor: colors.success },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
              <Text className="font-semibold" style={{ color: '#FFFFFF' }}>
                Marquer complété
              </Text>
            </View>
          </Pressable>
        )}
        {onPress && (
          <Pressable
            onPress={handlePress}
            className="flex-1 py-2.5 rounded-lg items-center border"
            style={({ pressed }) => [
              { borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="chevron.right" size={16} color={colors.primary} />
              <Text className="font-semibold" style={{ color: colors.primary }}>
                Voir détails
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  compactContainer: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
