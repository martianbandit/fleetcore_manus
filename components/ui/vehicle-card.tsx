import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  className?: string;
}

export function VehicleCard({ vehicle, onPress, className }: VehicleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View className={cn('bg-surface rounded-xl p-4 border border-border', className)}>
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-lg bg-primary/10 items-center justify-center mr-3">
              <IconSymbol name="car.fill" size={24} color="#0066CC" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">{vehicle.plate}</Text>
              <Text className="text-sm text-muted">{vehicle.unit}</Text>
            </View>
          </View>
          <StatusBadge status={vehicle.status} size="sm" />
        </View>
        
        <View className="flex-row mt-3 pt-3 border-t border-border">
          <View className="flex-1">
            <Text className="text-xs text-muted">Marque/Modèle</Text>
            <Text className="text-sm text-foreground font-medium">
              {vehicle.make} {vehicle.model}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted">Année</Text>
            <Text className="text-sm text-foreground font-medium">{vehicle.year}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted">Classe</Text>
            <Text className="text-sm text-foreground font-medium">{vehicle.vehicleClass}</Text>
          </View>
        </View>
        
        {vehicle.lastInspectionDate && (
          <View className="flex-row items-center mt-3 pt-3 border-t border-border">
            <IconSymbol name="clipboard.fill" size={14} color="#64748B" />
            <Text className="text-xs text-muted ml-1">
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
        
        <View className="flex-row items-center justify-end mt-2">
          <Text className="text-xs text-primary font-medium mr-1">Voir détails</Text>
          <IconSymbol name="chevron.right" size={14} color="#0066CC" />
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
