import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from './icon-symbol';

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
}

interface AdBannerProps {
  ad: Ad;
  variant?: 'banner' | 'card';
}

export function AdBanner({ ad, variant = 'banner' }: AdBannerProps) {
  const { colors } = useTheme();

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(ad.targetUrl);
      if (supported) {
        await Linking.openURL(ad.targetUrl);
      }
    } catch (error) {
      console.error('Error opening ad URL:', error);
    }
  };

  if (variant === 'card') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="rounded-xl overflow-hidden mb-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {ad.imageUrl && (
          <Image
            source={{ uri: ad.imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
        )}
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
              {ad.isLocal ? '📍 LOCAL' : 'SPONSORISÉ'} • {ad.sponsor}
            </Text>
          </View>
          <Text className="text-lg font-bold mb-2" style={{ color: colors.foreground }}>
            {ad.title}
          </Text>
          <Text className="text-sm mb-3" style={{ color: colors.muted }}>
            {ad.description}
          </Text>
          <View
            className="py-2 px-4 rounded-lg self-start"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm">{ad.ctaText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="rounded-xl p-4 mb-4 flex-row items-center"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {ad.imageUrl && (
        <Image
          source={{ uri: ad.imageUrl }}
          className="w-16 h-16 rounded-lg mr-3"
          resizeMode="cover"
        />
      )}
      <View className="flex-1">
        <Text className="text-xs font-semibold mb-1" style={{ color: colors.muted }}>
          {ad.isLocal ? '📍 LOCAL' : 'SPONSORISÉ'} • {ad.sponsor}
        </Text>
        <Text className="text-sm font-bold mb-1" style={{ color: colors.foreground }}>
          {ad.title}
        </Text>
        <Text className="text-xs" style={{ color: colors.muted }} numberOfLines={2}>
          {ad.description}
        </Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

// Mock ads data
export const mockAds: Ad[] = [
  {
    id: 'ad-1',
    type: 'card',
    title: 'Pièces détachées Freightliner',
    description: 'Livraison rapide partout au Québec. Garantie 2 ans sur toutes les pièces.',
    ctaText: 'Voir le catalogue',
    targetUrl: 'https://example.com/pieces',
    sponsor: 'Pièces Lourdes QC',
    isLocal: true,
  },
  {
    id: 'ad-2',
    type: 'banner',
    title: 'Garage Mobile 24/7',
    description: 'Service de réparation d\'urgence sur la route. Disponible jour et nuit.',
    ctaText: 'Appeler maintenant',
    targetUrl: 'tel:+15145551234',
    sponsor: 'Garage Express',
    isLocal: true,
  },
  {
    id: 'ad-3',
    type: 'card',
    title: 'Formation SAAQ',
    description: 'Cours d\'inspection de véhicules lourds certifié. Inscription en ligne.',
    imageUrl: 'https://via.placeholder.com/400x200/0066CC/FFFFFF?text=Formation+SAAQ',
    ctaText: 'S\'inscrire',
    targetUrl: 'https://example.com/formation',
    sponsor: 'Centre de Formation Pro',
    isLocal: false,
  },
  {
    id: 'ad-4',
    type: 'banner',
    title: 'Pneus commerciaux',
    description: 'Rabais de 15% sur les pneus Michelin pour flottes de 5+ véhicules.',
    ctaText: 'Obtenir un devis',
    targetUrl: 'https://example.com/pneus',
    sponsor: 'Pneus Plus',
    isLocal: true,
  },
];

// Useful links
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
  const { colors } = useTheme();

  const handlePress = async () => {
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
    saaq: '#0066CC',
    formation: '#22C55E',
    regulation: '#F59E0B',
    tool: '#8B5CF6',
    supplier: '#EC4899',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="rounded-xl p-4 mb-3 flex-row items-center"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
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
    </TouchableOpacity>
  );
}
