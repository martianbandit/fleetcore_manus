import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol, type IconSymbolName } from './icon-symbol';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconSymbolName;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  variant?: 'default' | 'glow' | 'minimal';
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  trendValue,
  className,
  variant = 'default',
}: KPICardProps) {
  const colors = useColors();
  
  // Utiliser la couleur primaire cyan par défaut
  const effectiveIconColor = iconColor || colors.primary;
  
  const trendColors = {
    up: colors.success,
    down: colors.error,
    neutral: colors.muted,
  };

  const trendIcons = {
    up: 'arrow.up.right' as IconSymbolName,
    down: 'arrow.down.right' as IconSymbolName,
    neutral: 'minus' as IconSymbolName,
  };

  return (
    <View 
      className={cn('rounded-2xl p-4', className)}
      style={[
        styles.card,
        { 
          backgroundColor: colors.surface,
          borderColor: variant === 'glow' ? `${effectiveIconColor}40` : colors.border,
        },
        variant === 'glow' && {
          shadowColor: effectiveIconColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        },
      ]}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{ 
            backgroundColor: `${effectiveIconColor}15`,
            borderWidth: 1,
            borderColor: `${effectiveIconColor}25`,
          }}
        >
          <IconSymbol name={icon} size={22} color={effectiveIconColor} />
        </View>
        {trend && trendValue && (
          <View 
            className="flex-row items-center px-2 py-1 rounded-full"
            style={{ backgroundColor: `${trendColors[trend]}15` }}
          >
            <IconSymbol
              name={trendIcons[trend]}
              size={12}
              color={trendColors[trend]}
            />
            <Text style={{ 
              color: trendColors[trend], 
              fontSize: 11, 
              fontWeight: '700',
              marginLeft: 3,
            }}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text 
        className="text-2xl font-bold"
        style={{ color: colors.foreground }}
      >
        {value}
      </Text>
      <Text 
        className="text-sm mt-1"
        style={{ color: colors.muted }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text 
          className="text-xs mt-0.5"
          style={{ color: `${colors.muted}99` }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
