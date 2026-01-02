import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { cn } from '@/lib/utils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  label?: string;
  animate?: boolean;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#0891B2',
  backgroundColor = '#E2E8F0',
  showValue = true,
  valuePrefix = '',
  valueSuffix = '%',
  label,
  animate = true,
  className,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (animate) {
      animatedProgress.value = withTiming(progress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animate]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 80) return '#22C55E'; // Success
    if (progress >= 50) return '#F59E0B'; // Warning
    return '#EF4444'; // Error
  };

  const displayColor = color === 'auto' ? getProgressColor() : color;

  return (
    <View className={cn('items-center justify-center', className)}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={displayColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
            />
          </G>
        </Svg>
        {showValue && (
          <View style={[styles.valueContainer, { width: size, height: size }]}>
            <Text
              style={[
                styles.valueText,
                { fontSize: size * 0.25, color: displayColor },
              ]}
            >
              {valuePrefix}{Math.round(progress)}{valueSuffix}
            </Text>
          </View>
        )}
      </View>
      {label && (
        <Text className="text-sm text-muted mt-2 text-center">{label}</Text>
      )}
    </View>
  );
}

interface ProgressRingGroupProps {
  items: Array<{
    progress: number;
    label: string;
    color?: string;
  }>;
  size?: number;
  className?: string;
}

export function ProgressRingGroup({
  items,
  size = 60,
  className,
}: ProgressRingGroupProps) {
  return (
    <View className={cn('flex-row justify-around', className)}>
      {items.map((item, index) => (
        <ProgressRing
          key={index}
          progress={item.progress}
          size={size}
          color={item.color || 'auto'}
          label={item.label}
          strokeWidth={6}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: '700',
  },
});
