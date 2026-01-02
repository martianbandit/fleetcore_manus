import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  iconColor?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

const presets: Record<string, { icon: string; iconColor: string; title: string; description: string }> = {
  vehicles: {
    icon: 'car.fill',
    iconColor: '#0891B2',
    title: 'Aucun véhicule',
    description: 'Ajoutez votre premier véhicule pour commencer à gérer votre flotte.',
  },
  inspections: {
    icon: 'clipboard.fill',
    iconColor: '#22C55E',
    title: 'Aucune inspection',
    description: 'Démarrez une inspection pour vérifier l\'état de vos véhicules.',
  },
  notifications: {
    icon: 'bell.fill',
    iconColor: '#64748B',
    title: 'Aucune notification',
    description: 'Vous êtes à jour ! Aucune notification en attente.',
  },
  workOrders: {
    icon: 'wrench.fill',
    iconColor: '#F59E0B',
    title: 'Aucun bon de travail',
    description: 'Les bons de travail apparaîtront ici une fois créés.',
  },
  search: {
    icon: 'magnifyingglass',
    iconColor: '#64748B',
    title: 'Aucun résultat',
    description: 'Essayez de modifier vos critères de recherche.',
  },
  error: {
    icon: 'exclamationmark.triangle.fill',
    iconColor: '#EF4444',
    title: 'Une erreur est survenue',
    description: 'Impossible de charger les données. Veuillez réessayer.',
  },
  offline: {
    icon: 'wifi.slash',
    iconColor: '#F59E0B',
    title: 'Hors ligne',
    description: 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
  },
};

export function EmptyState({
  icon,
  iconColor,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const content = (
    <>
      {/* Icon */}
      <View
        className="rounded-full items-center justify-center mb-4"
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${iconColor || '#64748B'}10`,
            width: variant === 'compact' ? 48 : 64,
            height: variant === 'compact' ? 48 : 64,
          },
        ]}
      >
        <IconSymbol
          name={(icon || 'questionmark.circle.fill') as any}
          size={variant === 'compact' ? 24 : 32}
          color={iconColor || '#64748B'}
        />
      </View>

      {/* Title */}
      <Text
        className={cn(
          'font-semibold text-foreground text-center',
          variant === 'compact' ? 'text-base' : 'text-lg'
        )}
      >
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          className={cn(
            'text-muted text-center mt-2 max-w-xs',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </Text>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <View className="flex-row items-center mt-4 gap-3">
          {action && (
            <Pressable
              onPress={action.onPress}
              className="bg-primary px-5 py-2.5 rounded-full"
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
            >
              <Text className="text-white font-semibold text-sm">
                {action.label}
              </Text>
            </Pressable>
          )}
          {secondaryAction && (
            <Pressable
              onPress={secondaryAction.onPress}
              className="px-5 py-2.5 rounded-full border border-border"
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text className="text-foreground font-medium text-sm">
                {secondaryAction.label}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );

  if (variant === 'card') {
    return (
      <View
        className={cn(
          'bg-surface rounded-2xl border border-border p-6 items-center',
          className
        )}
      >
        {content}
      </View>
    );
  }

  return (
    <View
      className={cn(
        'items-center justify-center py-12 px-6',
        className
      )}
    >
      {content}
    </View>
  );
}

// Preset empty states
export function VehiclesEmptyState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.vehicles} {...props} />;
}

export function InspectionsEmptyState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.inspections} {...props} />;
}

export function NotificationsEmptyState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.notifications} {...props} />;
}

export function WorkOrdersEmptyState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.workOrders} {...props} />;
}

export function SearchEmptyState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.search} {...props} />;
}

export function ErrorState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.error} {...props} />;
}

export function OfflineState(props: Partial<EmptyStateProps>) {
  return <EmptyState {...presets.offline} {...props} />;
}

const styles = StyleSheet.create({
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
