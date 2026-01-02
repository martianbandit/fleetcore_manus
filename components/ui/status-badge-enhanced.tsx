import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral'
  | 'active' | 'inactive' | 'maintenance' | 'blocked' | 'retired'
  | 'completed' | 'in_progress' | 'cancelled' | 'overdue';

interface StatusBadgeEnhancedProps {
  status: StatusType;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'subtle' | 'dot';
  icon?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { color: string; bgColor: string; icon: string; label: string }> = {
  success: { color: '#166534', bgColor: '#DCFCE7', icon: 'checkmark.circle.fill', label: 'Succès' },
  warning: { color: '#92400E', bgColor: '#FEF3C7', icon: 'exclamationmark.triangle.fill', label: 'Attention' },
  error: { color: '#991B1B', bgColor: '#FEE2E2', icon: 'xmark.circle.fill', label: 'Erreur' },
  info: { color: '#1E40AF', bgColor: '#DBEAFE', icon: 'info.circle.fill', label: 'Info' },
  pending: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'clock.fill', label: 'En attente' },
  neutral: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'minus.circle.fill', label: 'Neutre' },
  
  // Vehicle statuses
  active: { color: '#166534', bgColor: '#DCFCE7', icon: 'checkmark.circle.fill', label: 'Actif' },
  inactive: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'pause.circle.fill', label: 'Inactif' },
  maintenance: { color: '#92400E', bgColor: '#FEF3C7', icon: 'wrench.fill', label: 'Maintenance' },
  blocked: { color: '#991B1B', bgColor: '#FEE2E2', icon: 'xmark.octagon.fill', label: 'Bloqué' },
  retired: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'archivebox.fill', label: 'Retiré' },
  
  // Task statuses
  completed: { color: '#166534', bgColor: '#DCFCE7', icon: 'checkmark.circle.fill', label: 'Complété' },
  in_progress: { color: '#1E40AF', bgColor: '#DBEAFE', icon: 'arrow.clockwise', label: 'En cours' },
  cancelled: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'xmark.circle.fill', label: 'Annulé' },
  overdue: { color: '#991B1B', bgColor: '#FEE2E2', icon: 'exclamationmark.triangle.fill', label: 'En retard' },
};

export function StatusBadgeEnhanced({
  status,
  label,
  size = 'medium',
  variant = 'subtle',
  icon,
  showIcon = false,
  className,
}: StatusBadgeEnhancedProps) {
  const config = statusConfig[status] || statusConfig.neutral;
  const displayLabel = label || config.label;
  const displayIcon = icon || config.icon;

  const sizeStyles = {
    small: { paddingH: 6, paddingV: 2, fontSize: 10, iconSize: 10, dotSize: 6 },
    medium: { paddingH: 8, paddingV: 4, fontSize: 12, iconSize: 12, dotSize: 8 },
    large: { paddingH: 12, paddingV: 6, fontSize: 14, iconSize: 14, dotSize: 10 },
  };

  const currentSize = sizeStyles[size];

  if (variant === 'dot') {
    return (
      <View className={cn('flex-row items-center', className)}>
        <View
          style={[
            styles.dot,
            {
              width: currentSize.dotSize,
              height: currentSize.dotSize,
              backgroundColor: config.color,
            },
          ]}
        />
        <Text
          style={{ fontSize: currentSize.fontSize, color: config.color, marginLeft: 6, fontWeight: '500' }}
        >
          {displayLabel}
        </Text>
      </View>
    );
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'filled': return config.color;
      case 'outlined': return 'transparent';
      case 'subtle': return config.bgColor;
      default: return config.bgColor;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'filled': return '#FFFFFF';
      case 'outlined': return config.color;
      case 'subtle': return config.color;
      default: return config.color;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outlined': return config.color;
      default: return 'transparent';
    }
  };

  return (
    <View
      className={cn('flex-row items-center rounded-full', className)}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderColor: getBorderColor(),
          paddingHorizontal: currentSize.paddingH,
          paddingVertical: currentSize.paddingV,
        },
      ]}
    >
      {showIcon && (
        <IconSymbol
          name={displayIcon as any}
          size={currentSize.iconSize}
          color={getTextColor()}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={{
          fontSize: currentSize.fontSize,
          fontWeight: '600',
          color: getTextColor(),
        }}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderRadius: 100,
  },
});
