import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol, type IconSymbolName } from './icon-symbol';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';
import type { Alert } from '@/lib/types';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
  className?: string;
}

export function AlertCard({ alert, onPress, className }: AlertCardProps) {
  const colors = useColors();
  
  const alertConfig: Record<string, { icon: IconSymbolName; color: string }> = {
    major_defect: { icon: 'xmark.circle.fill', color: colors.error },
    blocked_inspection: { icon: 'exclamationmark.triangle.fill', color: colors.error },
    overdue_inspection: { icon: 'clock.fill', color: colors.warning },
    maintenance_due: { icon: 'wrench.fill', color: colors.warning },
  };
  
  const config = alertConfig[alert.type] || alertConfig.maintenance_due;
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View
        className={cn('rounded-2xl p-4', className)}
        style={[
          styles.card,
          {
            backgroundColor: `${config.color}08`,
            borderColor: `${config.color}30`,
          },
        ]}
      >
        <View className="flex-row items-start">
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            style={{ 
              backgroundColor: `${config.color}15`,
              borderWidth: 1,
              borderColor: `${config.color}25`,
            }}
          >
            <IconSymbol name={config.icon} size={22} color={config.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-bold flex-1"
                style={{ color: config.color }}
                numberOfLines={1}
              >
                {alert.title}
              </Text>
              <Text 
                className="text-xs ml-2"
                style={{ color: colors.muted }}
              >
                {new Date(alert.createdAt).toLocaleDateString('fr-CA')}
              </Text>
            </View>
            <Text 
              className="text-sm mt-1" 
              style={{ color: colors.foreground }}
              numberOfLines={2}
            >
              {alert.message}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
