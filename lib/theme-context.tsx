import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { getSettings, saveSettings, type AppSettings } from './data-service';

type ThemeMode = 'light' | 'dark' | 'auto';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  colorScheme: ColorScheme;
  primaryColor: string;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setPrimaryColor: (color: string) => Promise<void>;
  colors: ThemeColors;
}

interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  tint: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: ThemeColors = {
  primary: '#0066CC',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  foreground: '#11181C',
  muted: '#687076',
  border: '#E5E7EB',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  tint: '#0066CC',
};

const darkColors: ThemeColors = {
  primary: '#0a7ea4',
  background: '#151718',
  surface: '#1E2022',
  foreground: '#ECEDEE',
  muted: '#9BA1A6',
  border: '#334155',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  tint: '#0a7ea4',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [primaryColor, setPrimaryColorState] = useState<string>('#0066CC');
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setThemeState(settings.theme);
      setPrimaryColorState(settings.primaryColor);
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await saveSettings({ theme: newTheme });
  };

  const setPrimaryColor = async (color: string) => {
    setPrimaryColorState(color);
    await saveSettings({ primaryColor: color });
  };

  // Determine actual color scheme based on theme setting
  const colorScheme: ColorScheme = 
    theme === 'auto' 
      ? (systemColorScheme || 'light')
      : theme;

  // Get colors based on color scheme and apply primary color
  const colors: ThemeColors = colorScheme === 'dark'
    ? { ...darkColors, primary: primaryColor, tint: primaryColor }
    : { ...lightColors, primary: primaryColor, tint: primaryColor };

  if (loading) {
    return null; // or a loading screen
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        primaryColor,
        setTheme,
        setPrimaryColor,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
