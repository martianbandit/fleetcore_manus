/**
 * Écran de liste des fiches PEP (Programme d'entretien préventif)
 * Réservé aux plans Plus, Pro et Entreprise
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { StatusBadge } from '@/components/ui/status-badge';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getPEPForms,
  PEPForm,
  isPEPAccessAllowed,
} from '@/lib/pep-service';

export default function PEPListScreen() {
  const router = useRouter();
  const colors = useColors();
  const { subscription } = useSubscription();
  const [forms, setForms] = useState<PEPForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<PEPForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'accès au plan
  const hasAccess = subscription ? isPEPAccessAllowed(subscription.plan) : false;

  const loadForms = async () => {
    try {
      const data = await getPEPForms();
      setForms(data);
      setFilteredForms(data);
    } catch (error) {
      console.error('Erreur chargement fiches PEP:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadForms();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredForms(forms);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredForms(
        forms.filter(
          (form) =>
            form.vehicleInfo.plateNumber.toLowerCase().includes(query) ||
            form.vehicleInfo.make.toLowerCase().includes(query) ||
            form.vehicleInfo.model.toLowerCase().includes(query) ||
            form.mechanicName.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, forms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadForms();
    setRefreshing(false);
  };

  const handleCreatePEP = () => {
    if (!hasAccess) {
      Alert.alert(
        'Fonctionnalité Premium',
        'La fiche d\'entretien préventif (PEP) est réservée aux plans Plus, Pro et Entreprise.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Mettre à niveau',
            onPress: () => router.push('/subscription/upgrade' as any),
          },
        ]
      );
      return;
    }
    router.push('/pep/select-vehicle' as any);
  };

  const getStatusColor = (status: PEPForm['status']) => {
    switch (status) {
      case 'draft':
        return colors.warning;
      case 'completed':
        return colors.primary;
      case 'signed':
        return colors.success;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: PEPForm['status']) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'completed':
        return 'Complétée';
      case 'signed':
        return 'Signée';
      default:
        return status;
    }
  };

  const renderPEPCard = ({ item }: { item: PEPForm }) => (
    <Pressable
      onPress={() => router.push(`/pep/${item.id}` as any)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
          </View>
          <View>
            <Text className="text-base font-bold" style={{ color: colors.foreground }}>
              {item.vehicleInfo.plateNumber}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {item.vehicleInfo.make} {item.vehicleInfo.model} {item.vehicleInfo.year}
            </Text>
          </View>
        </View>
        <StatusBadge
          status={item.status === 'draft' ? 'DRAFT' : item.status === 'completed' ? 'COMPLETED' : 'active'}
          size="sm"
        />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs" style={{ color: colors.muted }}>
            Inspection: {new Date(item.inspectionDate).toLocaleDateString('fr-CA')}
          </Text>
          <Text className="text-xs" style={{ color: colors.muted }}>
            Prochain: {new Date(item.nextMaintenanceDate).toLocaleDateString('fr-CA')}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          {item.totalMajorDefects > 0 && (
            <View className="flex-row items-center">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-1"
                style={{ backgroundColor: colors.error + '20' }}
              >
                <Text className="text-xs font-bold" style={{ color: colors.error }}>
                  {item.totalMajorDefects}
                </Text>
              </View>
              <Text className="text-xs" style={{ color: colors.error }}>
                Maj
              </Text>
            </View>
          )}
          {item.totalMinorDefects > 0 && (
            <View className="flex-row items-center">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-1"
                style={{ backgroundColor: colors.warning + '20' }}
              >
                <Text className="text-xs font-bold" style={{ color: colors.warning }}>
                  {item.totalMinorDefects}
                </Text>
              </View>
              <Text className="text-xs" style={{ color: colors.warning }}>
                Min
              </Text>
            </View>
          )}
          {item.totalMajorDefects === 0 && item.totalMinorDefects === 0 && (
            <View className="flex-row items-center">
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
              <Text className="text-xs ml-1" style={{ color: colors.success }}>
                Conforme
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.mechanicName && (
        <View className="mt-2 pt-2 border-t" style={{ borderColor: colors.border }}>
          <Text className="text-xs" style={{ color: colors.muted }}>
            Mécanicien: {item.mechanicName} ({item.mechanicNumber})
          </Text>
        </View>
      )}
    </Pressable>
  );

  // Écran de mise à niveau si pas d'accès
  if (!hasAccess && !loading) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Fiche PEP
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <IconSymbol name="lock.fill" size={48} color={colors.primary} />
          </View>
          
          <View
            className="px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: colors.accent + '20' }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.accent }}>
              PREMIUM
            </Text>
          </View>

          <Text
            className="text-2xl font-bold text-center mb-3"
            style={{ color: colors.foreground }}
          >
            Fiche d'entretien préventif
          </Text>
          
          <Text
            className="text-base text-center mb-6"
            style={{ color: colors.muted }}
          >
            Le formulaire PEP SAAQ officiel (6609 30) est réservé aux plans Plus, Pro et Entreprise.
          </Text>

          <View className="w-full mb-6">
            {[
              'Formulaire SAAQ officiel complet',
              '13 sections d\'inspection',
              'Diagramme de localisation interactif',
              'Génération PDF conforme',
              'Historique des inspections',
            ].map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <Text className="ml-3 text-base" style={{ color: colors.foreground }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/subscription/upgrade' as any)}
            className="w-full py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-bold text-white">
              Mettre à niveau
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-2 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
            </Pressable>
            <View>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  Fiches PEP
                </Text>
                <View
                  className="ml-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: colors.accent + '20' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.accent }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Programme d'entretien préventif SAAQ
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleCreatePEP}
            className="p-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <IconSymbol name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par plaque, marque..."
        />
      </View>

      {/* Liste */}
      <FlatList
        data={filteredForms}
        renderItem={renderPEPCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View className="mb-4">
            <AdBanner variant="card" />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.surface }}
            >
              <IconSymbol name="doc.text" size={32} color={colors.muted} />
            </View>
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
              Aucune fiche PEP
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Créez votre première fiche d'entretien préventif
            </Text>
            <Pressable
              onPress={handleCreatePEP}
              className="mt-4 px-6 py-3 rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold">Créer une fiche</Text>
            </Pressable>
          </View>
        }
      />
    </ScreenContainer>
  );
}
