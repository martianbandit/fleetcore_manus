/**
 * Écran de sélection de véhicule pour créer une fiche PEP
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchBar } from '@/components/ui/search-bar';
import { useColors } from '@/hooks/use-colors';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';

export default function SelectVehicleScreen() {
  const router = useRouter();
  const colors = useColors();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
    setFilteredVehicles(data);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVehicles(vehicles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredVehicles(
        vehicles.filter(
          (v) =>
            v.unit.toLowerCase().includes(query) ||
            v.make.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.plate.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, vehicles]);

  const handleSelectVehicle = (vehicle: Vehicle) => {
    router.push({
      pathname: '/pep/create' as any,
      params: { vehicleId: vehicle.id },
    });
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <Pressable
      onPress={() => handleSelectVehicle(item)}
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
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: colors.primary + '20' }}
        >
          <IconSymbol name="car.fill" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold" style={{ color: colors.foreground }}>
            {item.unit} - {item.plate}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {item.make} {item.model} {item.year}
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.muted }}>
            VIN: {item.vin || 'Non spécifié'}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
          </Pressable>
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Sélectionner un véhicule
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Pour créer une fiche PEP
            </Text>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par unité, plaque..."
        />
      </View>

      {/* Liste des véhicules */}
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.surface }}
            >
              <IconSymbol name="car" size={32} color={colors.muted} />
            </View>
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
              Aucun véhicule trouvé
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Ajoutez d'abord un véhicule pour créer une fiche PEP
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
