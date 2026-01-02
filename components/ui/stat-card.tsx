import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  badge?: {
    text: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'primary';
  };
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'gradient' | 'outlined' | 'glass';
  onPress?: () => void;
  className?: string;
  animate?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#0891B2',
  iconBgColor,
  trend,
  badge,
  size = 'medium',
  variant = 'default',
  onPress,
  className,
  animate = true,
}: StatCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (animate) {
      opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = 1;
      translateY.value = 0;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const sizeStyles = {
    small: { padding: 12, iconSize: 20, valueSize: 'text-xl', titleSize: 'text-xs' },
    medium: { padding: 16, iconSize: 24, valueSize: 'text-2xl', titleSize: 'text-sm' },
    large: { padding: 20, iconSize: 28, valueSize: 'text-3xl', titleSize: 'text-base' },
  };

  const currentSize = sizeStyles[size];

  const variantStyles = {
    default: 'bg-surface border border-border',
    gradient: 'bg-surface border border-border',
    outlined: 'bg-transparent border-2 border-primary',
    glass: 'bg-surface/80 border border-border/50',
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up': return '#22C55E';
      case 'down': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getBadgeColor = (): { bg: string; text: string } => {
    if (!badge) return { bg: '#E0F2FE', text: '#0369A1' };
    const colors: Record<string, { bg: string; text: string }> = {
      success: { bg: '#DCFCE7', text: '#166534' },
      warning: { bg: '#FEF3C7', text: '#92400E' },
      error: { bg: '#FEE2E2', text: '#991B1B' },
      info: { bg: '#DBEAFE', text: '#1E40AF' },
      primary: { bg: '#E0F2FE', text: '#0369A1' },
    };
    return colors[badge.color] || colors.primary;
  };

  const computedIconBgColor = iconBgColor || `${iconColor}15`;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[animatedStyle, { padding: currentSize.padding }]}
      className={cn(
        'rounded-2xl shadow-sm',
        variantStyles[variant],
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: getBadgeColor().bg },
          ]}
        >
          <Text style={[styles.badgeText, { color: getBadgeColor().text }]}>
            {badge.text}
          </Text>
        </View>
      )}

      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: computedIconBgColor,
            width: currentSize.iconSize + 24,
            height: currentSize.iconSize + 24,
          },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={currentSize.iconSize}
          color={iconColor}
        />
      </View>

      {/* Value */}
      <Text
        className={cn(
          'font-bold text-foreground mt-3',
          currentSize.valueSize
        )}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      {/* Title */}
      <Text
        className={cn(
          'text-muted mt-1',
          currentSize.titleSize
        )}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Subtitle or Trend */}
      {(subtitle || trend) && (
        <View className="flex-row items-center mt-1">
          {trend && (
            <View className="flex-row items-center mr-2">
              <Text style={{ color: getTrendColor(), fontSize: 12, fontWeight: '600' }}>
                {getTrendIcon()} {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
          {subtitle && (
            <Text className="text-xs text-muted" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
