import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';
import type { InspectionStatus, ItemStatus, VehicleStatus } from '@/lib/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: InspectionStatus | ItemStatus | VehicleStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  // Inspection statuses
  DRAFT: { label: 'Brouillon', variant: 'neutral' },
  IN_PROGRESS: { label: 'En cours', variant: 'info' },
  COMPLETED: { label: 'Complété', variant: 'success' },
  BLOCKED: { label: 'Bloqué', variant: 'error' },
  // Item statuses
  pending: { label: 'En attente', variant: 'neutral' },
  ok: { label: 'OK', variant: 'success' },
  minor_defect: { label: 'Mineur', variant: 'warning' },
  major_defect: { label: 'Majeur', variant: 'error' },
  // Vehicle statuses
  active: { label: 'Actif', variant: 'success' },
  inactive: { label: 'Inactif', variant: 'neutral' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const colors = useColors();
  
  const config = statusConfig[status] || { label: status, variant: 'neutral' as BadgeVariant };
  
  const variantColors: Record<BadgeVariant, string> = {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.primary,
    neutral: colors.muted,
  };
  
  const color = variantColors[config.variant];
  
  return (
    <View
      className={cn(
        'rounded-full self-start',
        size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1',
        className
      )}
      style={[
        styles.badge,
        { 
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        },
      ]}
    >
      <Text
        className={cn(
          'font-semibold',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
        style={{ color }}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
  },
});
