import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';
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
  const colors = useColors();
  
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
        <View 
          className={cn('rounded-xl p-3', className)}
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                className="w-9 h-9 rounded-lg items-center justify-center mr-2"
                style={{ 
                  backgroundColor: `${colors.primary}15`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}25`,
                }}
              >
                <IconSymbol name="clipboard.fill" size={16} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text 
                  className="text-sm font-semibold" 
                  style={{ color: colors.foreground }}
                  numberOfLines={1}
                >
                  {inspection.vehicle?.plate || 'Véhicule'} - {typeLabels[inspection.type]}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
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
      <View 
        className={cn('rounded-2xl p-4', className)}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}25`,
              }}
            >
              <IconSymbol name="clipboard.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text 
                className="text-lg font-bold"
                style={{ color: colors.foreground }}
              >
                {inspection.vehicle?.plate || 'Véhicule'}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {typeLabels[inspection.type]}
              </Text>
            </View>
          </View>
          <StatusBadge status={inspection.status} />
        </View>

        {/* Progress bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs" style={{ color: colors.muted }}>Progression</Text>
            <Text 
              className="text-xs font-medium"
              style={{ color: colors.foreground }}
            >
              {inspection.completedItems}/{inspection.totalItems} ({progress}%)
            </Text>
          </View>
          <View 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <View
              className="h-full rounded-full"
              style={{ 
                width: `${progress}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>

        {/* Stats */}
        <View 
          className="flex-row justify-between pt-3"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
              <Text 
                className="text-sm font-semibold ml-1"
                style={{ color: colors.success }}
              >
                {inspection.okCount}
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>OK</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={colors.warning} />
              <Text 
                className="text-sm font-semibold ml-1"
                style={{ color: colors.warning }}
              >
                {inspection.minorDefectCount}
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Mineurs</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <IconSymbol name="xmark.circle.fill" size={14} color={colors.error} />
              <Text 
                className="text-sm font-semibold ml-1"
                style={{ color: colors.error }}
              >
                {inspection.majorDefectCount}
              </Text>
            </View>
            <Text className="text-xs" style={{ color: colors.muted }}>Majeurs</Text>
          </View>
        </View>

        {/* Footer */}
        <View 
          className="flex-row items-center justify-between mt-3 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <View className="flex-row items-center">
            <IconSymbol name="person.fill" size={14} color={colors.muted} />
            <Text className="text-xs ml-1" style={{ color: colors.muted }}>
              {inspection.technicianName}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text 
              className="text-xs font-semibold mr-1"
              style={{ color: colors.primary }}
            >
              {inspection.status === 'IN_PROGRESS' ? 'Continuer' : 'Voir détails'}
            </Text>
            <IconSymbol name="chevron.right" size={14} color={colors.primary} />
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
  card: {
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
