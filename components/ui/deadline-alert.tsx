/**
 * DeadlineAlert - Alerte pour dates critiques et en retard
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { 
  type UpcomingEvent,
  reminderTypeConfig,
  formatReminderDate,
} from '@/lib/calendar-service';

interface DeadlineAlertProps {
  reminder: UpcomingEvent;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function DeadlineAlert({ reminder, onPress, onDismiss }: DeadlineAlertProps) {
  const colors = useColors();
  const typeConfig = reminderTypeConfig[reminder.type];
  
  // Animation pour l'icône d'alerte
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (reminder.isOverdue || reminder.daysUntilDue <= 1) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [reminder.isOverdue, reminder.daysUntilDue]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  const handleDismiss = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss?.();
  };

  const isUrgent = reminder.isOverdue || reminder.daysUntilDue <= 1;
  const bgColor = isUrgent ? `${colors.error}15` : `${colors.warning}15`;
  const borderColor = isUrgent ? colors.error : colors.warning;
  const textColor = isUrgent ? colors.error : colors.warning;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View className="flex-row items-start gap-3">
        {/* Icon */}
        <Animated.View style={animatedIconStyle}>
          <View 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: `${borderColor}30` }}
          >
            <IconSymbol 
              name={isUrgent ? "exclamationmark.triangle.fill" : "clock.fill"} 
              size={20} 
              color={borderColor} 
            />
          </View>
        </Animated.View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text 
              className="font-bold text-sm uppercase"
              style={{ color: textColor }}
            >
              {isUrgent ? '⚠️ URGENT' : '⏰ RAPPEL'}
            </Text>
            <View 
              className="px-2 py-0.5 rounded"
              style={{ backgroundColor: `${typeConfig.color}20` }}
            >
              <Text className="text-xs font-medium" style={{ color: typeConfig.color }}>
                {typeConfig.label}
              </Text>
            </View>
          </View>
          
          <Text 
            className="font-semibold text-base mb-1"
            style={{ color: colors.foreground }}
            numberOfLines={2}
          >
            {reminder.title}
          </Text>

          <View className="flex-row items-center gap-3">
            {reminder.vehicleName && (
              <View className="flex-row items-center gap-1">
                <IconSymbol name="car.fill" size={12} color={colors.muted} />
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {reminder.vehicleName}
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <IconSymbol name="calendar" size={12} color={textColor} />
              <Text className="text-xs font-semibold" style={{ color: textColor }}>
                {formatReminderDate(reminder.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            onPress={handleDismiss}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={({ pressed }) => [
              { backgroundColor: `${colors.foreground}10` },
              pressed && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="xmark" size={14} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Action hint */}
      <View className="flex-row items-center justify-end mt-2 pt-2 border-t" style={{ borderColor: `${borderColor}30` }}>
        <Text className="text-xs" style={{ color: colors.muted }}>
          Appuyez pour voir les détails
        </Text>
        <IconSymbol name="chevron.right" size={12} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
