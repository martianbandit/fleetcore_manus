import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol, type IconSymbolName } from './icon-symbol';
import { cn } from '@/lib/utils';
import type { Alert } from '@/lib/types';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
  className?: string;
}

const alertConfig: Record<string, { icon: IconSymbolName; color: string; bgColor: string }> = {
  major_defect: { icon: 'xmark.circle.fill', color: '#EF4444', bgColor: '#FEE2E2' },
  blocked_inspection: { icon: 'exclamationmark.triangle.fill', color: '#EF4444', bgColor: '#FEE2E2' },
  overdue_inspection: { icon: 'clock.fill', color: '#F59E0B', bgColor: '#FEF3C7' },
  maintenance_due: { icon: 'wrench.fill', color: '#F59E0B', bgColor: '#FEF3C7' },
};

export function AlertCard({ alert, onPress, className }: AlertCardProps) {
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
        className={cn('rounded-xl p-4 border', className)}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.color + '30',
        }}
      >
        <View className="flex-row items-start">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: config.color + '20' }}
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
              <Text className="text-xs text-muted ml-2">
                {new Date(alert.createdAt).toLocaleDateString('fr-CA')}
              </Text>
            </View>
            <Text className="text-sm text-foreground mt-1" numberOfLines={2}>
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
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
