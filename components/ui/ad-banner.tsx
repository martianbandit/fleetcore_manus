/**
 * AdBanner Component - Bannière publicitaire avec rotation automatique
 * 
 * Affiche des annonces avec transition fluide toutes les 5 secondes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from './icon-symbol';

// Types
export interface Ad {
  id: string;
  type: 'banner' | 'card' | 'native';
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  targetUrl: string;
  sponsor: string;
  isLocal?: boolean;
  backgroundColor?: string;
  textColor?: string;
  priority?: number;
}

interface AdBannerProps {
  ad?: Ad;
  variant?: 'banner' | 'card';
  // Nouvelles props pour la rotation automatique
  ads?: Ad[];
  rotationInterval?: number;
  showIndicators?: boolean;
  compact?: boolean;
  position?: 'top' | 'bottom' | 'inline';
}

// Mock ads data avec style FleetCore
export const mockAds: Ad[] = [
  {
    id: 'ad-1',
    type: 'banner',
    title: 'Pneus Michelin Pro',
    description: 'Performance et durabilité pour votre flotte. Livraison gratuite.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=200&fit=crop',
    ctaText: 'En savoir plus',
    targetUrl: 'https://example.com/michelin',
    sponsor: 'Michelin',
    backgroundColor: '#0A1628',
    textColor: '#00D4FF',
    priority: 10,
  },
  {
    id: 'ad-2',
    type: 'banner',
    title: 'Huile Moteur Total Quartz',
    description: 'Protection maximale pour vos moteurs. -20% ce mois-ci.',
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=200&fit=crop',
    ctaText: 'Découvrir',
    targetUrl: 'https://example.com/total',
    sponsor: 'TotalEnergies',
    backgroundColor: '#111827',
    textColor: '#22D3EE',
    priority: 9,
  },
  {
    id: 'ad-3',
    type: 'banner',
    title: 'Assurance Flotte Desjardins',
    description: 'Protégez votre entreprise avec nos solutions sur mesure.',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=200&fit=crop',
    ctaText: 'Soumission gratuite',
    targetUrl: 'https://example.com/desjardins',
    sponsor: 'Desjardins',
    backgroundColor: '#0F172A',
    textColor: '#67E8F9',
    priority: 8,
  },
  {
    id: 'ad-4',
    type: 'banner',
    title: 'Pièces NAPA Pro',
    description: 'Qualité professionnelle pour votre atelier. Garantie 2 ans.',
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=200&fit=crop',
    ctaText: 'Commander',
    targetUrl: 'https://example.com/napa',
    sponsor: 'NAPA Auto Parts',
    backgroundColor: '#030712',
    textColor: '#00D4FF',
    priority: 7,
  },
  {
    id: 'ad-5',
    type: 'banner',
    title: 'GPS Fleet Tracking',
    description: 'Suivez votre flotte en temps réel. Essai gratuit 30 jours.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=200&fit=crop',
    ctaText: 'Essai gratuit',
    targetUrl: 'https://example.com/gps',
    sponsor: 'FleetTrack Pro',
    backgroundColor: '#0A1628',
    textColor: '#34D399',
    priority: 6,
  },
  {
    id: 'ad-6',
    type: 'card',
    title: 'Formation Conducteurs',
    description: 'Réduisez vos coûts avec des conducteurs formés professionnellement.',
    ctaText: 'Inscrivez-vous',
    targetUrl: 'https://example.com/formation',
    sponsor: 'SafeDrive Academy',
    backgroundColor: '#111827',
    textColor: '#FBBF24',
    priority: 5,
  },
  {
    id: 'ad-7',
    type: 'banner',
    title: 'Carburant Petro-Canada',
    description: 'Économisez avec notre programme flottes. Jusqu\'à 5¢/L.',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=200&fit=crop',
    ctaText: 'Adhérer',
    targetUrl: 'https://example.com/petro',
    sponsor: 'Petro-Canada',
    backgroundColor: '#0F172A',
    textColor: '#F87171',
    priority: 4,
  },
];

export function AdBanner({ 
  ad,
  variant = 'banner',
  ads = mockAds,
  rotationInterval = 5000,
  showIndicators = true,
  compact = false,
  position = 'inline',
}: AdBannerProps) {
  const colors = useColors();
  const { colors: themeColors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Si une seule annonce est passée, l'utiliser directement
  const displayAds = ad ? [ad] : ads.filter(a => a.type === 'banner' || variant === 'card');

  // Rotation automatique
  useEffect(() => {
    if (displayAds.length <= 1) return;

    intervalRef.current = setInterval(() => {
      rotateAd();
    }, rotationInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [displayAds.length, rotationInterval]);

  const rotateAd = useCallback(() => {
    // Animation de sortie
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -15,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Changer l'annonce
      setCurrentIndex((prev) => (prev + 1) % displayAds.length);

      // Réinitialiser la position
      slideAnim.setValue(15);

      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [displayAds.length, fadeAnim, slideAnim]);

  const handlePress = async (adItem: Ad) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const supported = await Linking.canOpenURL(adItem.targetUrl);
      if (supported) {
        await Linking.openURL(adItem.targetUrl);
      }
    } catch (error) {
      console.error('Error opening ad URL:', error);
    }
  };

  const goToAd = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Reset interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Animation rapide
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    // Restart interval
    if (displayAds.length > 1) {
      intervalRef.current = setInterval(() => {
        rotateAd();
      }, rotationInterval);
    }
  };

  if (displayAds.length === 0) {
    return null;
  }

  const currentAd = displayAds[currentIndex];
  const bgColor = currentAd.backgroundColor || colors.surface;
  const txtColor = currentAd.textColor || colors.primary;

  // Variante Card
  if (variant === 'card') {
    return (
      <TouchableOpacity
        onPress={() => handlePress(currentAd)}
        className="rounded-2xl overflow-hidden mb-4"
        style={{
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: `${colors.primary}30`,
        }}
        activeOpacity={0.9}
      >
        {currentAd.imageUrl && (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={{ width: '100%', height: 120 }}
            contentFit="cover"
          />
        )}
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View style={[styles.sponsorBadge, { backgroundColor: `${txtColor}20` }]}>
              <Text style={[styles.sponsorText, { color: txtColor }]}>
                {currentAd.isLocal ? '📍 LOCAL' : 'SPONSORISÉ'} • {currentAd.sponsor}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-bold mb-2" style={{ color: txtColor }}>
            {currentAd.title}
          </Text>
          <Text className="text-sm mb-3" style={{ color: `${txtColor}99` }}>
            {currentAd.description}
          </Text>
          <View
            className="py-2 px-4 rounded-full self-start"
            style={{ backgroundColor: txtColor }}
          >
            <Text style={{ color: bgColor, fontWeight: '700', fontSize: 13 }}>
              {currentAd.ctaText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Variante Banner avec rotation
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Pressable
        onPress={() => handlePress(currentAd)}
        style={({ pressed }) => [
          styles.adContainer,
          compact && styles.adContainerCompact,
          { 
            backgroundColor: bgColor,
            borderColor: `${colors.primary}25`,
          },
          pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
        ]}
      >
        <Animated.View
          style={[
            styles.adContent,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Image de fond */}
          {currentAd.imageUrl && !compact && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.adImage}
                contentFit="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: `${bgColor}E6` }]} />
            </View>
          )}

          {/* Contenu */}
          <View style={[styles.contentWrapper, compact && styles.contentWrapperCompact]}>
            {/* Badge Sponsorisé */}
            <View style={[styles.sponsorBadge, { backgroundColor: `${txtColor}15` }]}>
              <Text style={[styles.sponsorText, { color: txtColor }]}>
                Sponsorisé • {currentAd.sponsor}
              </Text>
            </View>

            {/* Texte */}
            <View style={styles.textContent}>
              <Text 
                style={[
                  styles.adTitle, 
                  compact && styles.adTitleCompact,
                  { color: txtColor }
                ]}
                numberOfLines={1}
              >
                {currentAd.title}
              </Text>
              {!compact && (
                <Text 
                  style={[styles.adDescription, { color: `${txtColor}90` }]}
                  numberOfLines={1}
                >
                  {currentAd.description}
                </Text>
              )}
            </View>

            {/* CTA */}
            <View style={[styles.ctaButton, { backgroundColor: txtColor }]}>
              <Text style={[styles.ctaText, { color: bgColor }]}>
                {currentAd.ctaText}
              </Text>
              <IconSymbol name="chevron.right" size={11} color={bgColor} />
            </View>
          </View>
        </Animated.View>
      </Pressable>

      {/* Indicateurs */}
      {showIndicators && displayAds.length > 1 && (
        <View style={styles.indicators}>
          {displayAds.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToAd(index)}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex 
                    ? colors.primary 
                    : `${colors.primary}35`,
                  width: index === currentIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// LIENS UTILES
// ============================================

export interface UsefulLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'saaq' | 'formation' | 'regulation' | 'tool' | 'supplier';
  icon: string;
}

export const usefulLinks: UsefulLink[] = [
  {
    id: 'link-1',
    title: 'Guide SAAQ - Inspection véhicules lourds',
    description: 'Guide officiel de la SAAQ pour l\'inspection des véhicules lourds',
    url: 'https://saaq.gouv.qc.ca/securite-routiere/moyens-deplacement/vehicules-lourds',
    category: 'saaq',
    icon: 'doc.text.fill',
  },
  {
    id: 'link-2',
    title: 'Codes VMRS',
    description: 'Base de données complète des codes VMRS pour composants',
    url: 'https://www.ata.org/vmrs',
    category: 'tool',
    icon: 'chart.bar.fill',
  },
  {
    id: 'link-3',
    title: 'Formations certifiées',
    description: 'Liste des formations certifiées pour inspecteurs',
    url: 'https://example.com/formations',
    category: 'formation',
    icon: 'person.fill',
  },
  {
    id: 'link-4',
    title: 'Réglementation transport Québec',
    description: 'Lois et règlements sur le transport routier',
    url: 'https://www.transports.gouv.qc.ca/',
    category: 'regulation',
    icon: 'doc.text.fill',
  },
];

interface UsefulLinkCardProps {
  link: UsefulLink;
}

export function UsefulLinkCard({ link }: UsefulLinkCardProps) {
  const colors = useColors();

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const supported = await Linking.canOpenURL(link.url);
      if (supported) {
        await Linking.openURL(link.url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const categoryColors: Record<string, string> = {
    saaq: '#0891B2',
    formation: '#059669',
    regulation: '#D97706',
    tool: '#7C3AED',
    supplier: '#DB2777',
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-xl p-4 mb-3 flex-row items-center"
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: categoryColors[link.category] + '20' }}
      >
        <IconSymbol
          name={link.icon as any}
          size={24}
          color={categoryColors[link.category]}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold mb-1" style={{ color: colors.foreground }}>
          {link.title}
        </Text>
        <Text className="text-xs" style={{ color: colors.muted }} numberOfLines={2}>
          {link.description}
        </Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </Pressable>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  containerCompact: {
    marginVertical: 4,
  },
  adContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    minHeight: 90,
  },
  adContainerCompact: {
    minHeight: 56,
    borderRadius: 12,
  },
  adContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  contentWrapperCompact: {
    padding: 10,
    gap: 8,
  },
  sponsorBadge: {
    position: 'absolute',
    top: 8,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sponsorText: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textContent: {
    flex: 1,
    marginTop: 18,
  },
  adTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  adTitleCompact: {
    fontSize: 13,
    marginBottom: 0,
    marginTop: 0,
  },
  adDescription: {
    fontSize: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 3,
    marginTop: 18,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
  },
});
