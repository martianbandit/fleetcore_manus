import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { cn } from '@/lib/utils';
import { useColors } from '@/hooks/use-colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  className,
}: SearchBarProps) {
  const colors = useColors();
  
  return (
    <View className={cn('flex-row items-center bg-surface rounded-xl border border-border px-3', className)}>
      <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="flex-1 py-3 px-2 text-foreground"
        style={styles.input}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
  },
});
