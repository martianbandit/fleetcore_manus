import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  badge?: number;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({
  title,
  description,
  icon,
  iconColor,
  iconBgColor,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  badge,
  className,
}: ActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const variantStyles: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
    default: {
      bg: 'bg-surface',
      iconBg: '#F1F5F9',
      iconColor: iconColor || '#64748B',
      border: 'border-border',
    },
    primary: {
      bg: 'bg-primary/10',
      iconBg: '#0891B215',
      iconColor: iconColor || '#0891B2',
      border: 'border-primary/20',
    },
    success: {
      bg: 'bg-success/10',
      iconBg: '#22C55E15',
      iconColor: iconColor || '#22C55E',
      border: 'border-success/20',
    },
    warning: {
      bg: 'bg-warning/10',
      iconBg: '#F59E0B15',
      iconColor: iconColor || '#F59E0B',
      border: 'border-warning/20',
    },
    danger: {
      bg: 'bg-error/10',
      iconBg: '#EF444415',
      iconColor: iconColor || '#EF4444',
      border: 'border-error/20',
    },
  };

  const sizeStyles = {
    small: { padding: 12, iconSize: 20, iconContainer: 36 },
    medium: { padding: 16, iconSize: 24, iconContainer: 44 },
    large: { padding: 20, iconSize: 28, iconContainer: 52 },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, { padding: currentSize.padding, opacity: disabled ? 0.5 : 1 }]}
      className={cn(
        'rounded-2xl border flex-row items-center',
        currentVariant.bg,
        currentVariant.border,
        className
      )}
    >
      {/* Icon Container */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBgColor || currentVariant.iconBg,
            width: currentSize.iconContainer,
            height: currentSize.iconContainer,
          },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={currentSize.iconSize}
          color={currentVariant.iconColor}
        />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text className="text-sm text-muted mt-0.5" numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Arrow */}
      <IconSymbol
        name="chevron.right"
        size={16}
        color="#94A3B8"
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
