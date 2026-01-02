/**
 * Écran d'aide et FAQ
 * Affiche les questions fréquentes avec recherche et filtres
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

// Catégories de FAQ
const FAQ_CATEGORIES = [
  { id: 'general', label: 'Général', icon: 'info.circle.fill' },
  { id: 'vehicles', label: 'Véhicules', icon: 'car.fill' },
  { id: 'inspections', label: 'Inspections', icon: 'clipboard.fill' },
  { id: 'pep', label: 'Fiches PEP', icon: 'doc.text.fill' },
  { id: 'workorders', label: 'Bons de travail', icon: 'wrench.fill' },
  { id: 'inventory', label: 'Inventaire', icon: 'cube.box.fill' },
  { id: 'sync', label: 'Synchronisation', icon: 'arrow.triangle.2.circlepath' },
  { id: 'billing', label: 'Abonnements', icon: 'dollarsign.circle.fill' },
];

// Questions fréquentes
const FAQ_ITEMS = [
  // Général
  {
    id: '1',
    category: 'general',
    question: 'Qu\'est-ce que FleetCore?',
    answer: 'FleetCore est une application de gestion de flotte conforme aux exigences de la SAAQ. Elle permet de gérer les véhicules lourds, les inspections préventives, les bons de travail et l\'inventaire de pièces.',
  },
  {
    id: '2',
    category: 'general',
    question: 'FleetCore fonctionne-t-il hors ligne?',
    answer: 'Oui, FleetCore fonctionne en mode hors-ligne. Vos données sont stockées localement et synchronisées automatiquement lorsque vous retrouvez une connexion internet.',
  },
  {
    id: '3',
    category: 'general',
    question: 'Comment contacter le support?',
    answer: 'Vous pouvez nous contacter par email à support@fleetcore.app ou consulter notre documentation en ligne sur docs.fleetcore.app.',
  },
  // Véhicules
  {
    id: '4',
    category: 'vehicles',
    question: 'Comment ajouter un véhicule?',
    answer: 'Allez dans l\'onglet Véhicules, appuyez sur le bouton + en haut à droite, puis remplissez les informations du véhicule (numéro d\'unité, plaque, NIV, etc.).',
  },
  {
    id: '5',
    category: 'vehicles',
    question: 'Comment modifier les informations d\'un véhicule?',
    answer: 'Ouvrez la fiche du véhicule, appuyez sur le bouton "Modifier" en haut à droite, effectuez vos modifications puis sauvegardez.',
  },
  {
    id: '6',
    category: 'vehicles',
    question: 'Comment supprimer un véhicule?',
    answer: 'Ouvrez la fiche du véhicule, appuyez sur le bouton "Supprimer" et confirmez. Attention: cette action est irréversible.',
  },
  // Inspections
  {
    id: '7',
    category: 'inspections',
    question: 'Comment faire une inspection?',
    answer: 'Allez dans l\'onglet Inspections, appuyez sur "Nouvelle inspection", sélectionnez le véhicule, puis parcourez les 8 sections en évaluant chaque composant.',
  },
  {
    id: '8',
    category: 'inspections',
    question: 'Quelle est la différence entre un défaut mineur et majeur?',
    answer: 'Un défaut mineur n\'affecte pas la sécurité immédiate mais doit être réparé rapidement. Un défaut majeur compromet la sécurité et le véhicule ne doit pas circuler jusqu\'à réparation.',
  },
  {
    id: '9',
    category: 'inspections',
    question: 'Comment générer un rapport PDF?',
    answer: 'Ouvrez une inspection complétée, appuyez sur le bouton "Générer PDF" pour créer un rapport conforme aux exigences de la SAAQ.',
  },
  // Fiches PEP
  {
    id: '10',
    category: 'pep',
    question: 'Qu\'est-ce qu\'une fiche PEP?',
    answer: 'La fiche PEP (Programme d\'Entretien Préventif) est un formulaire officiel de la SAAQ (6609-30) pour documenter l\'entretien préventif des véhicules lourds.',
  },
  {
    id: '11',
    category: 'pep',
    question: 'Qui peut accéder aux fiches PEP?',
    answer: 'Les fiches PEP sont disponibles pour les plans Plus, Pro et Entreprise. Mettez à niveau votre abonnement pour y accéder.',
  },
  {
    id: '12',
    category: 'pep',
    question: 'À quelle fréquence faire une fiche PEP?',
    answer: 'La fréquence dépend du PNBV du véhicule: tous les 3 mois pour les véhicules > 4 500 kg, tous les 6 mois pour les autres.',
  },
  // Bons de travail
  {
    id: '13',
    category: 'workorders',
    question: 'Comment créer un bon de travail?',
    answer: 'Allez dans FleetCommand depuis le Dashboard, appuyez sur "+ Nouveau", sélectionnez le véhicule et décrivez les travaux à effectuer.',
  },
  {
    id: '14',
    category: 'workorders',
    question: 'Comment utiliser le chronomètre de travail?',
    answer: 'Ouvrez un bon de travail, appuyez sur "Démarrer" pour lancer le chronomètre. Appuyez sur "Pause" pour faire une pause et "Arrêter" pour terminer.',
  },
  // Inventaire
  {
    id: '15',
    category: 'inventory',
    question: 'Comment ajouter une pièce à l\'inventaire?',
    answer: 'Allez dans FleetCrew depuis le Dashboard, appuyez sur "+ Ajouter", puis remplissez les informations de la pièce (nom, catégorie, quantité, prix).',
  },
  {
    id: '16',
    category: 'inventory',
    question: 'Comment lier des pièces à un bon de travail?',
    answer: 'Ouvrez un bon de travail, appuyez sur "Ajouter des pièces" dans la section "Pièces utilisées", sélectionnez les pièces et quantités.',
  },
  // Synchronisation
  {
    id: '17',
    category: 'sync',
    question: 'Comment synchroniser avec Google Calendar?',
    answer: 'Allez dans Paramètres > Google Calendar, connectez votre compte Google, puis activez la synchronisation des rappels.',
  },
  {
    id: '18',
    category: 'sync',
    question: 'Mes données sont-elles sécurisées?',
    answer: 'Oui, vos données sont chiffrées et stockées de manière sécurisée. Nous respectons les normes de sécurité les plus strictes.',
  },
  // Abonnements
  {
    id: '19',
    category: 'billing',
    question: 'Quels sont les plans disponibles?',
    answer: 'FleetCore propose 4 plans: Free (gratuit, 3 véhicules), Plus (29$/mois, 15 véhicules), Pro (79$/mois, 50 véhicules) et Entreprise (199$/mois, illimité).',
  },
  {
    id: '20',
    category: 'billing',
    question: 'Comment mettre à niveau mon abonnement?',
    answer: 'Allez dans Paramètres > Abonnement > Mettre à niveau, sélectionnez le plan souhaité et suivez les instructions de paiement.',
  },
];

function FAQItem({ item, isExpanded, onToggle }: {
  item: typeof FAQ_ITEMS[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 'auto' : 0, { duration: 200 }),
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onToggle();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          marginBottom: 8,
          overflow: 'hidden',
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: '600',
              color: colors.foreground,
              marginRight: 12,
            }}
          >
            {item.question}
          </Text>
          <IconSymbol
            name={isExpanded ? 'chevron.left' : 'chevron.right'}
            size={16}
            color={colors.muted}
          />
        </View>
        {isExpanded && (
          <Text
            style={{
              marginTop: 12,
              fontSize: 14,
              lineHeight: 22,
              color: colors.muted,
            }}
          >
            {item.answer}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQ = useMemo(() => {
    let items = FAQ_ITEMS;

    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [searchQuery, selectedCategory]);

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 12 }}
            >
              <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground }}>
              Aide & FAQ
            </Text>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher une question..."
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 16,
                color: colors.foreground,
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 16, marginBottom: 16 }}
          contentContainerStyle={{ paddingRight: 16, gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: selectedCategory === null ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedCategory === null ? '#FFF' : colors.foreground,
              }}
            >
              Tout
            </Text>
          </Pressable>
          {FAQ_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedCategory === cat.id ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === cat.id ? colors.primary : colors.border,
                gap: 6,
              }}
            >
              <IconSymbol
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#FFF' : colors.foreground}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedCategory === cat.id ? '#FFF' : colors.foreground,
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.muted,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            {filteredFAQ.length} question{filteredFAQ.length !== 1 ? 's' : ''}
          </Text>

          {filteredFAQ.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 40,
              }}
            >
              <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 16,
                  color: colors.muted,
                  textAlign: 'center',
                }}
              >
                Aucune question trouvée
              </Text>
            </View>
          ) : (
            filteredFAQ.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))
          )}
        </View>

        {/* Contact Support */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.primary + '30',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              Besoin d'aide supplémentaire?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginBottom: 16,
                lineHeight: 22,
              }}
            >
              Notre équipe de support est disponible pour répondre à toutes vos questions.
            </Text>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
                Contacter le support
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
