import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';
import type { Vehicle } from '@/lib/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  className?: string;
}

export function VehicleCard({ vehicle, onPress, className }: VehicleCardProps) {
  const colors = useColors();
  
  // Couleur d'accent basée sur le statut
  const statusAccentColors: Record<string, string> = {
    active: colors.success,
    maintenance: colors.warning,
    inactive: colors.error,
  };
  const accentColor = statusAccentColors[vehicle.status] || colors.primary;

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
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}25`,
              }}
            >
              <IconSymbol name="car.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text 
                className="text-lg font-bold"
                style={{ color: colors.foreground }}
              >
                {vehicle.plate}
              </Text>
              <Text 
                className="text-sm"
                style={{ color: colors.muted }}
              >
                {vehicle.unit}
              </Text>
            </View>
          </View>
          <StatusBadge status={vehicle.status} size="sm" />
        </View>
        
        <View 
          className="flex-row mt-3 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          <View className="flex-1">
            <Text className="text-xs" style={{ color: colors.muted }}>Marque/Modèle</Text>
            <Text 
              className="text-sm font-medium"
              style={{ color: colors.foreground }}
            >
              {vehicle.make} {vehicle.model}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs" style={{ color: colors.muted }}>Année</Text>
            <Text 
              className="text-sm font-medium"
              style={{ color: colors.foreground }}
            >
              {vehicle.year}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs" style={{ color: colors.muted }}>Classe</Text>
            <Text 
              className="text-sm font-medium"
              style={{ color: colors.foreground }}
            >
              {vehicle.vehicleClass}
            </Text>
          </View>
        </View>
        
        {vehicle.lastInspectionDate && (
          <View 
            className="flex-row items-center mt-3 pt-3"
            style={{ borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <IconSymbol name="clipboard.fill" size={14} color={colors.muted} />
            <Text 
              className="text-xs ml-1"
              style={{ color: colors.muted }}
            >
              Dernière inspection: {new Date(vehicle.lastInspectionDate).toLocaleDateString('fr-CA')}
            </Text>
            {vehicle.lastInspectionStatus && (
              <StatusBadge
                status={vehicle.lastInspectionStatus}
                size="sm"
                className="ml-2"
              />
            )}
          </View>
        )}
        
        <View className="flex-row items-center justify-end mt-3">
          <Text 
            className="text-xs font-semibold mr-1"
            style={{ color: colors.primary }}
          >
            Voir détails
          </Text>
          <IconSymbol name="chevron.right" size={14} color={colors.primary} />
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
