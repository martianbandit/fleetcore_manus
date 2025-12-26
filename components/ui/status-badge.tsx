import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
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

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-success/15', text: 'text-success' },
  warning: { bg: 'bg-warning/15', text: 'text-warning' },
  error: { bg: 'bg-error/15', text: 'text-error' },
  info: { bg: 'bg-primary/15', text: 'text-primary' },
  neutral: { bg: 'bg-muted/15', text: 'text-muted' },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'neutral' as BadgeVariant };
  const styles = variantStyles[config.variant];
  
  return (
    <View
      className={cn(
        'rounded-full self-start',
        styles.bg,
        size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1',
        className
      )}
    >
      <Text
        className={cn(
          'font-semibold',
          styles.text,
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {config.label}
      </Text>
    </View>
  );
}
