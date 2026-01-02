import { View, Text, Pressable } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  badge?: number;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  iconColor = '#64748B',
  action,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between mb-3', className)}>
      <View className="flex-row items-center flex-1">
        {icon && (
          <View
            className="mr-2 rounded-lg items-center justify-center"
            style={{
              backgroundColor: `${iconColor}15`,
              width: 28,
              height: 28,
            }}
          >
            <IconSymbol name={icon as any} size={16} color={iconColor} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-foreground">{title}</Text>
            {badge !== undefined && badge > 0 && (
              <View className="ml-2 bg-primary px-2 py-0.5 rounded-full">
                <Text className="text-xs font-bold text-background">
                  {badge > 99 ? '99+' : badge}
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text className="text-sm text-muted">{subtitle}</Text>
          )}
        </View>
      </View>
      {action && (
        <Pressable
          onPress={action.onPress}
          className="flex-row items-center"
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Text className="text-sm font-medium text-primary mr-1">
            {action.label}
          </Text>
          <IconSymbol name="chevron.right" size={14} color="#0891B2" />
        </Pressable>
      )}
    </View>
  );
}
