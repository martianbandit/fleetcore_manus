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
    <View 
      className={cn('flex-row items-center rounded-xl px-3', className)}
      style={[
        styles.container,
        { 
          backgroundColor: colors.surface,
          borderColor: value.length > 0 ? `${colors.primary}40` : colors.border,
        },
      ]}
    >
      <IconSymbol 
        name="magnifyingglass" 
        size={20} 
        color={value.length > 0 ? colors.primary : colors.muted} 
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        className="flex-1 py-3 px-2"
        style={[styles.input, { color: colors.foreground }]}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={({ pressed }) => [
            styles.clearButton,
            { backgroundColor: `${colors.muted}20` },
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="xmark" size={12} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  input: {
    fontSize: 16,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
