import { View, Text } from 'react-native';
import { IconSymbol, type IconSymbolName } from './icon-symbol';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconSymbolName;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#0066CC',
  trend,
  trendValue,
  className,
}: KPICardProps) {
  const trendColors = {
    up: '#22C55E',
    down: '#EF4444',
    neutral: '#64748B',
  };

  return (
    <View className={cn('bg-surface rounded-xl p-4 border border-border', className)}>
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <IconSymbol name={icon} size={22} color={iconColor} />
        </View>
        {trend && trendValue && (
          <View className="flex-row items-center">
            <IconSymbol
              name={trend === 'up' ? 'chevron.right' : 'chevron.left'}
              size={14}
              color={trendColors[trend]}
            />
            <Text style={{ color: trendColors[trend], fontSize: 12, fontWeight: '600' }}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-sm text-muted mt-1">{title}</Text>
      {subtitle && (
        <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
      )}
    </View>
  );
}
