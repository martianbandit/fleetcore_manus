/**
 * Écran des ressources utiles - Liens SAAQ, guides, support
 */

import { ScrollView, Text, View, Pressable, Linking } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { useColors } from '@/hooks/use-colors';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: IconSymbolName;
  category: 'saaq' | 'guide' | 'support' | 'legal';
}

const RESOURCES: ResourceItem[] = [
  // SAAQ
  {
    id: 'saaq-pep',
    title: 'Programme d\'entretien préventif (PEP)',
    description: 'Guide officiel du programme PEP de la SAAQ',
    url: 'https://saaq.gouv.qc.ca/transport-lourd/entretien-preventif/',
    icon: 'doc.text.fill',
    category: 'saaq',
  },
  {
    id: 'saaq-ronde',
    title: 'Ronde de sécurité',
    description: 'Exigences pour la vérification avant départ',
    url: 'https://saaq.gouv.qc.ca/transport-lourd/ronde-securite/',
    icon: 'checkmark.shield.fill',
    category: 'saaq',
  },
  {
    id: 'saaq-defauts',
    title: 'Liste des défauts mécaniques',
    description: 'Classification des défauts mineurs et majeurs',
    url: 'https://saaq.gouv.qc.ca/transport-lourd/defauts-mecaniques/',
    icon: 'exclamationmark.triangle.fill',
    category: 'saaq',
  },
  {
    id: 'saaq-controle',
    title: 'Contrôle routier',
    description: 'Informations sur les inspections routières',
    url: 'https://saaq.gouv.qc.ca/transport-lourd/controle-routier/',
    icon: 'car.fill',
    category: 'saaq',
  },
  // Guides
  {
    id: 'guide-inspection',
    title: 'Guide d\'inspection',
    description: 'Comment effectuer une inspection complète',
    url: 'https://fleetcore.app/guides/inspection',
    icon: 'book.fill',
    category: 'guide',
  },
  {
    id: 'guide-defauts',
    title: 'Identifier les défauts',
    description: 'Guide visuel pour identifier les problèmes',
    url: 'https://fleetcore.app/guides/defauts',
    icon: 'eye.fill',
    category: 'guide',
  },
  {
    id: 'guide-rapport',
    title: 'Générer des rapports',
    description: 'Comment créer et partager des rapports PDF',
    url: 'https://fleetcore.app/guides/rapports',
    icon: 'doc.richtext.fill',
    category: 'guide',
  },
  // Support
  {
    id: 'support-faq',
    title: 'FAQ',
    description: 'Questions fréquemment posées',
    url: 'https://fleetcore.app/faq',
    icon: 'questionmark.circle.fill',
    category: 'support',
  },
  {
    id: 'support-contact',
    title: 'Contacter le support',
    description: 'Besoin d\'aide? Contactez-nous',
    url: 'mailto:support@fleetcore.app',
    icon: 'envelope.fill',
    category: 'support',
  },
  {
    id: 'support-feedback',
    title: 'Envoyer un commentaire',
    description: 'Partagez vos suggestions d\'amélioration',
    url: 'https://fleetcore.app/feedback',
    icon: 'star.fill',
    category: 'support',
  },
  // Legal
  {
    id: 'legal-privacy',
    title: 'Politique de confidentialité',
    description: 'Comment nous protégeons vos données',
    url: 'https://fleetcore.app/privacy',
    icon: 'lock.fill',
    category: 'legal',
  },
  {
    id: 'legal-terms',
    title: 'Conditions d\'utilisation',
    description: 'Termes et conditions du service',
    url: 'https://fleetcore.app/terms',
    icon: 'doc.plaintext.fill',
    category: 'legal',
  },
];

const CATEGORY_TITLES: Record<string, { title: string; icon: IconSymbolName }> = {
  saaq: { title: 'Ressources SAAQ', icon: 'building.2.fill' },
  guide: { title: 'Guides FleetCore', icon: 'book.fill' },
  support: { title: 'Support', icon: 'lifepreserver.fill' },
  legal: { title: 'Informations légales', icon: 'doc.text.fill' },
};

export default function ResourcesScreen() {
  const colors = useColors();

  const handleOpenLink = async (url: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const groupedResources = RESOURCES.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, ResourceItem[]>);

  const renderResourceCard = (resource: ResourceItem, index: number, total: number) => (
    <Pressable
      key={resource.id}
      onPress={() => handleOpenLink(resource.url)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: index < total - 1 ? 1 : 0,
        borderBottomColor: colors.border,
        backgroundColor: pressed ? colors.border + '40' : 'transparent',
      })}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <IconSymbol name={resource.icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          color: colors.foreground, 
          fontWeight: '600',
          fontSize: 15,
        }}>
          {resource.title}
        </Text>
        <Text style={{ 
          color: colors.muted, 
          fontSize: 12,
          marginTop: 2,
        }}>
          {resource.description}
        </Text>
      </View>
      <IconSymbol name="arrow.up.right" size={16} color={colors.muted} />
    </Pressable>
  );

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Ressources utiles
          </Text>
          <Text className="text-base mt-1" style={{ color: colors.muted }}>
            Documentation, guides et support
          </Text>
        </View>

        {/* Resource Categories */}
        {Object.entries(groupedResources).map(([category, resources]) => (
          <View key={category} className="px-4 mb-6">
            <SectionHeader 
              title={CATEGORY_TITLES[category].title} 
              icon={CATEGORY_TITLES[category].icon}
            />
            <View 
              className="rounded-xl border overflow-hidden mt-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              {resources.map((resource, index) => 
                renderResourceCard(resource, index, resources.length)
              )}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View className="px-4 mb-8">
          <View 
            className="rounded-xl p-4 items-center"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 15,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <IconSymbol name="car.fill" size={30} color="#FFFFFF" />
            </View>
            <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>
              FleetCore
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
              Version 1.0.0
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8, textAlign: 'center' }}>
              © 2025 FleetCore. Tous droits réservés.
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
