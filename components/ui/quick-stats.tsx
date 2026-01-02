import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

interface QuickStatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

interface QuickStatsProps {
  items: QuickStatItem[];
  variant?: 'default' | 'compact' | 'card';
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickStats({
  items,
  variant = 'default',
  columns = 4,
  className,
}: QuickStatsProps) {
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return '#22C55E';
      case 'down': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const columnWidth = `${100 / columns}%` as const;

  if (variant === 'compact') {
    return (
      <View className={cn('flex-row flex-wrap bg-surface rounded-xl p-3 border border-border', className)}>
        {items.map((item, index) => (
          <View
            key={index}
            style={{ width: columnWidth as any }}
            className="items-center py-2"
          >
            <Text className="text-lg font-bold text-foreground">
              {item.value}
            </Text>
            <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'card') {
    return (
      <View className={cn('flex-row flex-wrap -mx-1', className)}>
        {items.map((item, index) => (
          <View
            key={index}
            style={{ width: columnWidth as any }}
            className="px-1 mb-2"
          >
            <View className="bg-surface rounded-xl p-3 border border-border items-center">
              {item.icon && (
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${item.color || '#64748B'}15` },
                  ]}
                >
                  <IconSymbol
                    name={item.icon as any}
                    size={16}
                    color={item.color || '#64748B'}
                  />
                </View>
              )}
              <Text
                className="text-xl font-bold text-foreground mt-2"
                style={item.color ? { color: item.color } : undefined}
              >
                {item.value}
              </Text>
              <Text className="text-xs text-muted mt-1 text-center" numberOfLines={1}>
                {item.label}
              </Text>
              {item.trend && (
                <Text
                  className="text-xs font-medium mt-1"
                  style={{ color: getTrendColor(item.trend.direction) }}
                >
                  {getTrendIcon(item.trend.direction)} {Math.abs(item.trend.value)}%
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Default variant
  return (
    <View className={cn('flex-row flex-wrap bg-surface rounded-xl border border-border overflow-hidden', className)}>
      {items.map((item, index) => {
        const isLastRow = index >= items.length - columns;
        const isLastColumn = (index + 1) % columns === 0;

        return (
          <View
            key={index}
            style={[
              { width: columnWidth },
              !isLastColumn && styles.borderRight,
              !isLastRow && styles.borderBottom,
            ]}
            className="p-3 items-center"
          >
            {item.icon && (
              <IconSymbol
                name={item.icon as any}
                size={18}
                color={item.color || '#64748B'}
              />
            )}
            <Text
              className="text-xl font-bold text-foreground mt-1"
              style={item.color ? { color: item.color } : undefined}
            >
              {item.value}
            </Text>
            <Text className="text-xs text-muted mt-0.5 text-center" numberOfLines={1}>
              {item.label}
            </Text>
            {item.trend && (
              <View className="flex-row items-center mt-1">
                <Text
                  className="text-xs font-medium"
                  style={{ color: getTrendColor(item.trend.direction) }}
                >
                  {getTrendIcon(item.trend.direction)} {Math.abs(item.trend.value)}%
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
});
