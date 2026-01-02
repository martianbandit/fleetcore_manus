import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'inspection' | 'defect' | 'repair' | 'vehicle' | 'alert' | 'document' | 'user';
  title: string;
  description?: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
  metadata?: {
    vehiclePlate?: string;
    userName?: string;
    cost?: number;
  };
  onPress?: () => void;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  maxItems?: number;
  showConnector?: boolean;
  className?: string;
}

const typeConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  inspection: { icon: 'clipboard.fill', color: '#0891B2', bgColor: '#0891B215' },
  defect: { icon: 'exclamationmark.triangle.fill', color: '#F59E0B', bgColor: '#F59E0B15' },
  repair: { icon: 'wrench.fill', color: '#22C55E', bgColor: '#22C55E15' },
  vehicle: { icon: 'car.fill', color: '#3B82F6', bgColor: '#3B82F615' },
  alert: { icon: 'bell.fill', color: '#EF4444', bgColor: '#EF444415' },
  document: { icon: 'doc.fill', color: '#8B5CF6', bgColor: '#8B5CF615' },
  user: { icon: 'person.fill', color: '#64748B', bgColor: '#64748B15' },
};

const statusColors: Record<string, string> = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  pending: '#64748B',
};

export function ActivityTimeline({
  items,
  maxItems = 5,
  showConnector = true,
  className,
}: ActivityTimelineProps) {
  const displayItems = items.slice(0, maxItems);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
  };

  return (
    <View className={cn('', className)}>
      {displayItems.map((item, index) => {
        const config = typeConfig[item.type] || typeConfig.user;
        const isLast = index === displayItems.length - 1;

        return (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            disabled={!item.onPress}
            style={({ pressed }) => [
              styles.itemContainer,
              pressed && item.onPress && { opacity: 0.7 },
            ]}
          >
            {/* Timeline connector */}
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: config.bgColor },
                ]}
              >
                <IconSymbol
                  name={config.icon as any}
                  size={14}
                  color={config.color}
                />
              </View>
              {showConnector && !isLast && (
                <View style={styles.connector} />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text className="text-xs text-muted mt-0.5" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  {item.metadata && (
                    <View className="flex-row items-center mt-1 flex-wrap">
                      {item.metadata.vehiclePlate && (
                        <View className="flex-row items-center mr-3">
                          <IconSymbol name="car.fill" size={10} color="#64748B" />
                          <Text className="text-xs text-muted ml-1">
                            {item.metadata.vehiclePlate}
                          </Text>
                        </View>
                      )}
                      {item.metadata.userName && (
                        <View className="flex-row items-center mr-3">
                          <IconSymbol name="person.fill" size={10} color="#64748B" />
                          <Text className="text-xs text-muted ml-1">
                            {item.metadata.userName}
                          </Text>
                        </View>
                      )}
                      {item.metadata.cost !== undefined && (
                        <View className="flex-row items-center">
                          <Text className="text-xs font-medium text-success">
                            {item.metadata.cost.toLocaleString()} $
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted">
                    {formatTimestamp(item.timestamp)}
                  </Text>
                  {item.status && (
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColors[item.status] },
                      ]}
                    />
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}

      {items.length === 0 && (
        <View className="py-8 items-center">
          <IconSymbol name="clock.fill" size={32} color="#94A3B8" />
          <Text className="text-sm text-muted mt-2">Aucune activité récente</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 40,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
