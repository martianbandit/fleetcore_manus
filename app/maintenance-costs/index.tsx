import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl, TextInput, Modal, ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { AdBanner } from '@/components/ui/ad-banner';
import { useColors } from '@/hooks/use-colors';
import { getVehicles } from '@/lib/data-service';
import { addMaintenanceCost, getMaintenanceCosts, type MaintenanceCost } from '@/lib/metrics-service';
import type { Vehicle } from '@/lib/types';

const costCategories = [
  { key: 'repair', label: 'Réparation', icon: 'wrench.fill' as IconSymbolName, color: '#EF4444' },
  { key: 'maintenance', label: 'Entretien', icon: 'gearshape.fill' as IconSymbolName, color: '#22C55E' },
  { key: 'parts', label: 'Pièces', icon: 'shippingbox.fill' as IconSymbolName, color: '#F59E0B' },
  { key: 'labor', label: 'Main d\'œuvre', icon: 'person.fill' as IconSymbolName, color: '#0EA5E9' },
  { key: 'tires', label: 'Pneus', icon: 'car.fill' as IconSymbolName, color: '#8B5CF6' },
  { key: 'fuel', label: 'Carburant', icon: 'fuelpump.fill' as IconSymbolName, color: '#EC4899' },
  { key: 'other', label: 'Autre', icon: 'ellipsis.circle.fill' as IconSymbolName, color: '#64748B' },
];

interface CostEntry {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  workOrderId?: string;
}

export default function MaintenanceCostsScreen() {
  const colors = useColors();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newCostVehicleId, setNewCostVehicleId] = useState<string>('');
  const [newCostCategory, setNewCostCategory] = useState<string>('repair');
  const [newCostAmount, setNewCostAmount] = useState<string>('');
  const [newCostDescription, setNewCostDescription] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
      
      // Load all costs
      const allMaintenanceCosts = await getMaintenanceCosts();
      const allCosts: CostEntry[] = allMaintenanceCosts.map((cost: MaintenanceCost) => {
        const vehicle = vehiclesData.find(v => v.id === cost.vehicleId);
        return {
          id: cost.id,
          vehicleId: cost.vehicleId,
          vehiclePlate: vehicle?.plate || 'Inconnu',
          category: cost.type,
          amount: cost.amount,
          description: cost.description,
          date: cost.date,
        };
      });
      
      // Sort by date descending
      allCosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCosts(allCosts);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const filteredCosts = costs.filter((cost) => {
    const matchesSearch =
      searchQuery === '' ||
      cost.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cost.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cost.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const thisMonthCosts = filteredCosts
    .filter(cost => {
      const costDate = new Date(cost.date);
      const now = new Date();
      return costDate.getMonth() === now.getMonth() && costDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, cost) => sum + cost.amount, 0);

  const handleAddCost = async () => {
    if (!newCostVehicleId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule');
      return;
    }
    if (!newCostAmount || parseFloat(newCostAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }
    if (!newCostDescription.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description');
      return;
    }

    try {
      await addMaintenanceCost({
        vehicleId: newCostVehicleId,
        type: newCostCategory as MaintenanceCost['type'],
        amount: parseFloat(newCostAmount),
        description: newCostDescription.trim(),
        date: new Date().toISOString(),
        currency: 'CAD',
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le coût');
    }
  };

  const resetForm = () => {
    setNewCostVehicleId('');
    setNewCostCategory('repair');
    setNewCostAmount('');
    setNewCostDescription('');
  };

  const getCategoryInfo = (key: string) => {
    return costCategories.find(c => c.key === key) || costCategories[costCategories.length - 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
  };

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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
            {formatCurrency(totalCosts)}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Total</Text>
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.warning }}>
            {formatCurrency(thisMonthCosts)}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Ce mois</Text>
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>
            {filteredCosts.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>Entrées</Text>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher..."
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ key: 'all', label: 'Tous', icon: 'list.bullet' as IconSymbolName, color: colors.primary }, ...costCategories]}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedCategory(item.key)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedCategory === item.key ? item.color : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === item.key ? item.color : colors.border,
                opacity: pressed ? 0.8 : 1,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
            <IconSymbol
              name={item.icon}
              size={14}
              color={selectedCategory === item.key ? '#FFF' : item.color}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: selectedCategory === item.key ? '#FFF' : colors.foreground,
                marginLeft: 6,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      {/* Costs List */}
      <FlatList
        data={filteredCosts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <IconSymbol name="doc.text.fill" size={48} color={colors.muted} />
            <Text style={{ fontSize: 16, color: colors.muted, marginTop: 12 }}>
              Aucun coût enregistré
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Appuyez sur + pour ajouter un coût
            </Text>
          </View>
        }
        ListFooterComponent={
          filteredCosts.length > 0 ? (
            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
              <AdBanner variant="banner" rotationInterval={5000} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const categoryInfo = getCategoryInfo(item.category);
          return (
            <Pressable
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
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: categoryInfo.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <IconSymbol name={categoryInfo.icon} size={22} color={categoryInfo.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {item.vehiclePlate} • {new Date(item.date).toLocaleDateString('fr-CA')}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: categoryInfo.color }}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            </Pressable>
          );
        }}
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

      {/* Add Cost Modal */}
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
              maxHeight: '80%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
                  Ajouter un coût
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
                  <Text style={{ color: colors.muted, padding: 8 }}>Aucun véhicule</Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setNewCostVehicleId(item.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor: newCostVehicleId === item.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: newCostVehicleId === item.id ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: newCostVehicleId === item.id ? '#FFF' : colors.foreground,
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
                data={costCategories}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setNewCostCategory(item.key)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 8,
                      backgroundColor: newCostCategory === item.key ? item.color : colors.surface,
                      borderWidth: 1,
                      borderColor: newCostCategory === item.key ? item.color : colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <IconSymbol
                      name={item.icon}
                      size={14}
                      color={newCostCategory === item.key ? '#FFF' : item.color}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: newCostCategory === item.key ? '#FFF' : colors.foreground,
                        marginLeft: 6,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />

              {/* Amount Input */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                Montant ($)
              </Text>
              <TextInput
                value={newCostAmount}
                onChangeText={setNewCostAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              />

              {/* Description Input */}
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                Description
              </Text>
              <TextInput
                value={newCostDescription}
                onChangeText={setNewCostDescription}
                placeholder="Ex: Changement d'huile"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 24,
                }}
              />

              {/* Submit Button */}
              <Pressable
                onPress={handleAddCost}
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
                  Ajouter le coût
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
