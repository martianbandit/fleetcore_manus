/**
 * Ad Service - Gestion des espaces publicitaires FleetCore
 * 
 * Service pour gérer les annonces publicitaires avec rotation automatique
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types d'annonces
export type AdType = 'banner' | 'card' | 'native' | 'interstitial';
export type AdPosition = 'top' | 'bottom' | 'inline' | 'feed';

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  ctaText: string;
  ctaUrl: string;
  backgroundColor?: string;
  textColor?: string;
  sponsor: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: string[];
  impressions: number;
  clicks: number;
}

export interface AdConfig {
  rotationInterval: number; // en millisecondes
  maxAdsPerPage: number;
  enableTracking: boolean;
  showSponsorLabel: boolean;
}

const AD_CONFIG_KEY = '@fleetcore_ad_config';
const AD_STATS_KEY = '@fleetcore_ad_stats';

// Configuration par défaut
const defaultConfig: AdConfig = {
  rotationInterval: 5000, // 5 secondes
  maxAdsPerPage: 3,
  enableTracking: true,
  showSponsorLabel: true,
};

// Annonces de démonstration pour FleetCore
const demoAds: Ad[] = [
  {
    id: 'ad-1',
    type: 'banner',
    title: 'Pneus Michelin Pro',
    description: 'Performance et durabilité pour votre flotte',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=200&fit=crop',
    ctaText: 'En savoir plus',
    ctaUrl: 'https://example.com/michelin',
    backgroundColor: '#0A1628',
    textColor: '#00D4FF',
    sponsor: 'Michelin',
    priority: 10,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-2',
    type: 'banner',
    title: 'Huile Moteur Total Quartz',
    description: 'Protection maximale pour vos moteurs',
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=200&fit=crop',
    ctaText: 'Découvrir',
    ctaUrl: 'https://example.com/total',
    backgroundColor: '#111827',
    textColor: '#22D3EE',
    sponsor: 'TotalEnergies',
    priority: 9,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-3',
    type: 'banner',
    title: 'Assurance Flotte Desjardins',
    description: 'Protégez votre entreprise avec nos solutions',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=200&fit=crop',
    ctaText: 'Obtenir une soumission',
    ctaUrl: 'https://example.com/desjardins',
    backgroundColor: '#0F172A',
    textColor: '#67E8F9',
    sponsor: 'Desjardins',
    priority: 8,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-4',
    type: 'banner',
    title: 'Pièces NAPA Pro',
    description: 'Qualité professionnelle pour votre atelier',
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=200&fit=crop',
    ctaText: 'Commander',
    ctaUrl: 'https://example.com/napa',
    backgroundColor: '#030712',
    textColor: '#00D4FF',
    sponsor: 'NAPA Auto Parts',
    priority: 7,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-5',
    type: 'banner',
    title: 'GPS Fleet Tracking',
    description: 'Suivez votre flotte en temps réel',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=200&fit=crop',
    ctaText: 'Essai gratuit',
    ctaUrl: 'https://example.com/gps',
    backgroundColor: '#0A1628',
    textColor: '#34D399',
    sponsor: 'FleetTrack Pro',
    priority: 6,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-6',
    type: 'card',
    title: 'Formation Conducteurs',
    description: 'Réduisez vos coûts avec des conducteurs formés',
    iconUrl: 'graduation-cap',
    ctaText: 'Inscrivez-vous',
    ctaUrl: 'https://example.com/formation',
    backgroundColor: '#111827',
    textColor: '#FBBF24',
    sponsor: 'SafeDrive Academy',
    priority: 5,
    impressions: 0,
    clicks: 0,
  },
  {
    id: 'ad-7',
    type: 'native',
    title: 'Carburant Petro-Canada',
    description: 'Économisez avec notre programme flottes',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=200&fit=crop',
    ctaText: 'Adhérer',
    ctaUrl: 'https://example.com/petro',
    backgroundColor: '#0F172A',
    textColor: '#F87171',
    sponsor: 'Petro-Canada',
    priority: 4,
    impressions: 0,
    clicks: 0,
  },
];

/**
 * Récupère la configuration des annonces
 */
export async function getAdConfig(): Promise<AdConfig> {
  try {
    const stored = await AsyncStorage.getItem(AD_CONFIG_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading ad config:', error);
  }
  return defaultConfig;
}

/**
 * Sauvegarde la configuration des annonces
 */
export async function saveAdConfig(config: Partial<AdConfig>): Promise<void> {
  try {
    const current = await getAdConfig();
    const updated = { ...current, ...config };
    await AsyncStorage.setItem(AD_CONFIG_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving ad config:', error);
  }
}

/**
 * Récupère toutes les annonces disponibles
 */
export async function getAds(type?: AdType): Promise<Ad[]> {
  // Pour la démo, on retourne les annonces statiques
  // En production, cela ferait un appel API
  let ads = [...demoAds];
  
  if (type) {
    ads = ads.filter(ad => ad.type === type);
  }
  
  // Trier par priorité
  ads.sort((a, b) => b.priority - a.priority);
  
  return ads;
}

/**
 * Récupère les annonces pour une position spécifique
 */
export async function getAdsForPosition(position: AdPosition): Promise<Ad[]> {
  const ads = await getAds();
  const config = await getAdConfig();
  
  // Filtrer selon la position
  let filtered = ads;
  if (position === 'top' || position === 'bottom') {
    filtered = ads.filter(ad => ad.type === 'banner');
  } else if (position === 'feed') {
    filtered = ads.filter(ad => ad.type === 'card' || ad.type === 'native');
  }
  
  // Limiter le nombre d'annonces
  return filtered.slice(0, config.maxAdsPerPage);
}

/**
 * Enregistre une impression d'annonce
 */
export async function trackImpression(adId: string): Promise<void> {
  try {
    const statsStr = await AsyncStorage.getItem(AD_STATS_KEY);
    const stats = statsStr ? JSON.parse(statsStr) : {};
    
    if (!stats[adId]) {
      stats[adId] = { impressions: 0, clicks: 0 };
    }
    stats[adId].impressions++;
    
    await AsyncStorage.setItem(AD_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error tracking impression:', error);
  }
}

/**
 * Enregistre un clic sur une annonce
 */
export async function trackClick(adId: string): Promise<void> {
  try {
    const statsStr = await AsyncStorage.getItem(AD_STATS_KEY);
    const stats = statsStr ? JSON.parse(statsStr) : {};
    
    if (!stats[adId]) {
      stats[adId] = { impressions: 0, clicks: 0 };
    }
    stats[adId].clicks++;
    
    await AsyncStorage.setItem(AD_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}

/**
 * Récupère les statistiques d'une annonce
 */
export async function getAdStats(adId: string): Promise<{ impressions: number; clicks: number }> {
  try {
    const statsStr = await AsyncStorage.getItem(AD_STATS_KEY);
    const stats = statsStr ? JSON.parse(statsStr) : {};
    return stats[adId] || { impressions: 0, clicks: 0 };
  } catch (error) {
    console.error('Error getting ad stats:', error);
    return { impressions: 0, clicks: 0 };
  }
}

/**
 * Calcule le CTR (Click-Through Rate) d'une annonce
 */
export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}
