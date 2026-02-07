import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '@/constants/oauth';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated, refresh } = useAuth({ autoFetch: true });
  const [loading, setLoading] = useState(false);

  // Redirect to onboarding if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        // On web, redirect to OAuth endpoint
        window.location.href = '/api/auth/login';
      } else {
        const baseUrl =
          process.env.EXPO_PUBLIC_API_URL ||
          process.env.EXPO_PUBLIC_API_BASE_URL ||
          getApiBaseUrl() ||
          (__DEV__ ? 'http://localhost:3000' : '');

        if (!baseUrl) {
          Alert.alert(
            'Configuration requise',
            "L'URL du serveur n'est pas configurée. Veuillez définir EXPO_PUBLIC_API_URL.",
          );
          setLoading(false);
          return;
        }

        if (!__DEV__ && baseUrl.startsWith('http://')) {
          Alert.alert(
            'Connexion non sécurisée',
            "Une URL HTTPS est requise pour se connecter en production.",
          );
          setLoading(false);
          return;
        }

        // On native, open OAuth in browser
        const result = await WebBrowser.openAuthSessionAsync(
          `${baseUrl}/api/auth/login`,
          'fleetcore://oauth/callback'
        );
        
        if (result.type === 'success') {
          await refresh();
          router.replace('/(tabs)' as any);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 px-6 justify-center">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Image
              source={require('@/assets/images/icon.png')}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>
          <Text
            className="text-4xl font-bold mb-2"
            style={{ color: colors.foreground }}
          >
            FleetCore
          </Text>
          <Text
            className="text-base text-center"
            style={{ color: colors.muted }}
          >
            Gestion professionnelle de flotte de véhicules lourds
          </Text>
        </View>

        {/* Features */}
        <View className="mb-12">
          <FeatureItem
            icon="clipboard.fill"
            title="Inspections SAAQ"
            description="Checklist complète conforme aux normes"
          />
          <FeatureItem
            icon="car.fill"
            title="Gestion de flotte"
            description="Suivi complet de vos véhicules"
          />
          <FeatureItem
            icon="chart.bar.fill"
            title="Métriques avancées"
            description="Analyses et rapports détaillés"
          />
          <FeatureItem
            icon="doc.text.fill"
            title="Rapports PDF"
            description="Génération automatique de documents"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="rounded-xl py-4 items-center mb-4"
          style={{
            backgroundColor: colors.primary,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Text className="text-white font-bold text-lg">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text
          className="text-xs text-center"
          style={{ color: colors.muted }}
        >
          En vous connectant, vous acceptez nos{' '}
          <Text style={{ color: colors.primary }}>Conditions d'utilisation</Text>
          {' '}et notre{' '}
          <Text style={{ color: colors.primary }}>Politique de confidentialité</Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  const { colors } = useTheme();
  
  return (
    <View className="flex-row items-center mb-4">
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        <IconSymbol name={icon as any} size={24} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold mb-0.5"
          style={{ color: colors.foreground }}
        >
          {title}
        </Text>
        <Text className="text-sm" style={{ color: colors.muted }}>
          {description}
        </Text>
      </View>
    </View>
  );
}
