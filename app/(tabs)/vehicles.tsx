import { useEffect, useState, useCallback } from 'react';
import { FlatList, Text, View, RefreshControl, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { VehicleCard } from '@/components/ui/vehicle-card';
import { SearchBar } from '@/components/ui/search-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getVehicles, searchVehicles } from '@/lib/data-service';
import type { Vehicle, VehicleStatus } from '@/lib/types';
import { useColors } from '@/hooks/use-colors';

const statusFilters: { key: VehicleStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'Actifs' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive', label: 'Inactifs' },
];

export default function VehiclesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<VehicleStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
      applyFilters(data, searchQuery, activeFilter);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    loadData();
  }, []);

  const applyFilters = (data: Vehicle[], query: string, filter: VehicleStatus | 'all') => {
    let result = data;
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(v =>
        v.plate.toLowerCase().includes(lowerQuery) ||
        v.vin.toLowerCase().includes(lowerQuery) ||
        v.unit.toLowerCase().includes(lowerQuery) ||
        v.make.toLowerCase().includes(lowerQuery) ||
        v.model.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (filter !== 'all') {
      result = result.filter(v => v.status === filter);
    }
    
    setFilteredVehicles(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(vehicles, query, activeFilter);
  };

  const handleFilterChange = (filter: VehicleStatus | 'all') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveFilter(filter);
    applyFilters(vehicles, searchQuery, filter);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <VehicleCard
      vehicle={item}
      onPress={() => router.push(`/vehicle/${item.id}` as any)}
    />
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-foreground">Véhicules</Text>
            <Text className="text-base text-muted mt-1">
              {vehicles.length} véhicules dans la flotte
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/vehicle/add' as any)}
            className="bg-primary px-4 py-3 rounded-full flex-row items-center gap-2"
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFF" />
            <Text className="text-white font-semibold">Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 mb-3">
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Rechercher par plaque, VIN, unité..."
        />
      </View>

      {/* Filters */}
      <View className="px-4 mb-4">
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleFilterChange(item.key)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: activeFilter === item.key ? colors.primary : colors.surface,
                  borderColor: activeFilter === item.key ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: activeFilter === item.key ? '#FFFFFF' : colors.muted,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Vehicle List */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-12">
            <IconSymbol name="car.fill" size={48} color={colors.muted} />
            <Text className="text-muted mt-4 text-center">
              {searchQuery || activeFilter !== 'all'
                ? 'Aucun véhicule trouvé'
                : 'Aucun véhicule dans la flotte'}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterList: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
