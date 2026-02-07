/**
 * Écran de sélection de langue
 */

import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { 
  getLanguage, 
  setLanguage, 
  getAvailableLanguages,
  type Language,
} from '@/lib/i18n-service';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export default function LanguageSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<Language>('fr');

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    const lang = getLanguage();
    setCurrentLang(lang);
  };

  const handleSelectLanguage = async (lang: Language) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await setLanguage(lang);
      setCurrentLang(lang);
      
      Alert.alert(
        lang === 'fr' ? 'Langue modifiée' : 'Language changed',
        lang === 'fr' 
          ? 'L\'application utilisera maintenant le français.' 
          : 'The app will now use English.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error setting language:', error);
      Alert.alert('Erreur', 'Impossible de changer la langue');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Langue de l'application
          </Text>
          <Text className="text-base mt-1" style={{ color: colors.muted }}>
            Choisissez votre langue préférée
          </Text>
        </View>

        {/* Language Options */}
        <View className="px-4">
          <View 
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            {LANGUAGES.map((lang, index) => (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: index < LANGUAGES.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: pressed ? colors.border + '40' : 'transparent',
                })}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>{lang.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: colors.foreground, 
                    fontWeight: '600',
                    fontSize: 16,
                  }}>
                    {lang.nativeName}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {lang.name}
                  </Text>
                </View>
                {currentLang === lang.code && (
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.success,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info */}
        <View className="px-4 mt-6">
          <View 
            className="rounded-xl p-4 border"
            style={{ backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }}
          >
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: colors.foreground, fontWeight: '600', marginBottom: 4 }}>
                  Note
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
                  Le changement de langue s'applique immédiatement à l'interface. 
                  Certains contenus générés par le système (comme les rapports) 
                  utiliseront également la langue sélectionnée.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
