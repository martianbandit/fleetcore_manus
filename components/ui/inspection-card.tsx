import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import type { Inspection } from '@/lib/types';

interface InspectionCardProps {
  inspection: Inspection;
  onPress?: () => void;
  compact?: boolean;
  className?: string;
}

const typeLabels: Record<string, string> = {
  periodic: 'Périodique',
  pre_trip: 'Pré-trajet',
  post_trip: 'Post-trajet',
  incident: 'Incident',
};

export function InspectionCard({ inspection, onPress, compact = false, className }: InspectionCardProps) {
  const progress = inspection.totalItems > 0 
    ? Math.round((inspection.completedItems / inspection.totalItems) * 100)
    : 0;

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
      >
        <View className={cn('bg-surface rounded-lg p-3 border border-border', className)}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-2">
                <IconSymbol name="clipboard.fill" size={16} color="#0066CC" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {inspection.vehicle?.plate || 'Véhicule'} - {typeLabels[inspection.type]}
                </Text>
                <Text className="text-xs text-muted">
                  {new Date(inspection.startedAt).toLocaleDateString('fr-CA')}
                </Text>
              </View>
            </View>
            <StatusBadge status={inspection.status} size="sm" />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View className={cn('bg-surface rounded-xl p-4 border border-border', className)}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-lg bg-primary/10 items-center justify-center mr-3">
              <IconSymbol name="clipboard.fill" size={24} color="#0066CC" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">
                {inspection.vehicle?.plate || 'Véhicule'}
              </Text>
              <Text className="text-sm text-muted">{typeLabels[inspection.type]}</Text>
            </View>
          </View>
          <StatusBadge status={inspection.status} />
        </View>

        {/* Progress bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-muted">Progression</Text>
            <Text className="text-xs text-foreground font-medium">
              {inspection.completedItems}/{inspection.totalItems} ({progress}%)
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between pt-3 border-t border-border">
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
              <Text className="text-sm font-semibold text-success ml-1">{inspection.okCount}</Text>
            </View>
            <Text className="text-xs text-muted">OK</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F59E0B" />
              <Text className="text-sm font-semibold text-warning ml-1">{inspection.minorDefectCount}</Text>
            </View>
            <Text className="text-xs text-muted">Mineurs</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
              <Text className="text-sm font-semibold text-error ml-1">{inspection.majorDefectCount}</Text>
            </View>
            <Text className="text-xs text-muted">Majeurs</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
          <View className="flex-row items-center">
            <IconSymbol name="person.fill" size={14} color="#64748B" />
            <Text className="text-xs text-muted ml-1">{inspection.technicianName}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-xs text-primary font-medium mr-1">
              {inspection.status === 'IN_PROGRESS' ? 'Continuer' : 'Voir détails'}
            </Text>
            <IconSymbol name="chevron.right" size={14} color="#0066CC" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
