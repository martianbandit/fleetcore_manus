import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl, TextInput, Modal } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import {
  getDocuments,
  addDocument,
  deleteDocument,
  type VehicleDocument,
  documentCategories,
} from '@/lib/documents-service';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';

type DocType = VehicleDocument['type'];

const categoryLabels: Record<DocType, string> = {
  manual: 'Manuel',
  invoice: 'Facture',
  registration: 'Immatriculation',
  insurance: 'Assurance',
  inspection: 'Inspection',
  other: 'Autre',
};

const categoryIcons: Record<DocType, IconSymbolName> = {
  manual: 'book.fill',
  invoice: 'doc.text.fill',
  registration: 'car.fill',
  insurance: 'shield.fill',
  inspection: 'clipboard.fill',
  other: 'folder.fill',
};

const categoryColors: Record<DocType, string> = {
  manual: '#0EA5E9',
  invoice: '#22C55E',
  registration: '#8B5CF6',
  insurance: '#F59E0B',
  inspection: '#00D4FF',
  other: '#64748B',
};

interface DocumentCardProps {
  document: VehicleDocument;
  onPress: () => void;
  onDelete: () => void;
}

function DocumentCard({ document, onPress, onDelete }: DocumentCardProps) {
  const colors = useColors();
  const categoryColor = categoryColors[document.type];

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Supprimer le document',
      `Êtes-vous sûr de vouloir supprimer "${document.name}"?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: categoryColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <IconSymbol
            name={categoryIcons[document.type]}
            size={24}
            color={categoryColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}
            numberOfLines={1}
          >
            {document.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {categoryLabels[document.type]} • {new Date(document.uploadedAt).toLocaleDateString('fr-CA')}
          </Text>
          {document.notes && (
            <Text
              style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}
              numberOfLines={1}
            >
              {document.notes}
            </Text>
          )}
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export default function DocumentsScreen() {
  const colors = useColors();
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocVehicleId, setNewDocVehicleId] = useState<string>('');
  const [newDocCategory, setNewDocCategory] = useState<DocType>('other');
  const [newDocNotes, setNewDocNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [docsData, vehiclesData] = await Promise.all([
        getDocuments(),
        getVehicles(),
      ]);
      setDocuments(docsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddDocument = async () => {
    if (!newDocVehicleId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule');
      return;
    }

    try {
      const result = await addDocument(newDocVehicleId, newDocCategory, newDocNotes.trim() || undefined);

      if (result) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setShowAddModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le document');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le document');
    }
  };

  const handleOpenDocument = async (doc: VehicleDocument) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Linking.openURL(doc.uri);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le document');
    }
  };

  const resetForm = () => {
    setNewDocVehicleId('');
    setNewDocCategory('other');
    setNewDocNotes('');
  };

  const categories: (DocType | 'all')[] = ['all', 'manual', 'invoice', 'registration', 'insurance', 'inspection', 'other'];

  // Stats
  const totalDocs = documents.length;
  const invoiceCount = documents.filter(d => d.type === 'invoice').length;
  const insuranceCount = documents.filter(d => d.type === 'insurance').length;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* Stats Header */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
            {totalDocs}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>Documents</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.success }}>
            {invoiceCount}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>Factures</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.warning }}>
            {insuranceCount}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>Assurances</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un document..."
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedCategory(item)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === item ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: selectedCategory === item ? '#FFF' : colors.foreground,
              }}
            >
              {item === 'all' ? 'Tous' : categoryLabels[item]}
            </Text>
          </Pressable>
        )}
      />

      {/* Documents List */}
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <IconSymbol name="folder.fill" size={48} color={colors.muted} />
            <Text style={{ fontSize: 16, color: colors.muted, marginTop: 12 }}>
              {searchQuery ? 'Aucun document trouvé' : 'Aucun document'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Appuyez sur + pour ajouter un document
            </Text>
          </View>
        }
        ListFooterComponent={
          filteredDocuments.length > 0 ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <AdBanner variant="banner" rotationInterval={5000} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => handleOpenDocument(item)}
            onDelete={() => handleDeleteDocument(item.id)}
          />
        )}
      />

      {/* Add Button */}
      <Pressable
        onPress={() => setShowAddModal(true)}
        style={({ pressed }) => [
          {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <IconSymbol name="plus" size={28} color="#FFF" />
      </Pressable>

      {/* Add Document Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
                Ajouter un document
              </Text>
              <Pressable onPress={() => { setShowAddModal(false); resetForm(); }}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </Pressable>
            </View>

            {/* Vehicle Selector */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
              Véhicule
            </Text>
            <FlatList
              horizontal
              data={vehicles}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              ListEmptyComponent={
                <Text style={{ color: colors.muted, padding: 8 }}>Aucun véhicule disponible</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setNewDocVehicleId(item.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: newDocVehicleId === item.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: newDocVehicleId === item.id ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: newDocVehicleId === item.id ? '#FFF' : colors.foreground,
                    }}
                  >
                    {item.plate}
                  </Text>
                </Pressable>
              )}
            />

            {/* Category Selector */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
              Catégorie
            </Text>
            <FlatList
              horizontal
              data={Object.keys(categoryLabels) as DocType[]}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setNewDocCategory(item)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor: newDocCategory === item ? categoryColors[item] : colors.surface,
                    borderWidth: 1,
                    borderColor: newDocCategory === item ? categoryColors[item] : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: newDocCategory === item ? '#FFF' : colors.foreground,
                    }}
                  >
                    {categoryLabels[item]}
                  </Text>
                </Pressable>
              )}
            />

            {/* Notes Input */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
              Notes (optionnel)
            </Text>
            <TextInput
              value={newDocNotes}
              onChangeText={setNewDocNotes}
              placeholder="Ajouter des notes..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={2}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 24,
                minHeight: 60,
              }}
            />

            {/* Submit Button */}
            <Pressable
              onPress={handleAddDocument}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFF' }}>
                Sélectionner et ajouter
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
