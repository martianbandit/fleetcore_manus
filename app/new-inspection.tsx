import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { SearchBar } from '@/components/ui/search-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getVehicles, createInspection } from '@/lib/data-service';
import type { Vehicle, InspectionType } from '@/lib/types';

const inspectionTypes: { key: InspectionType; label: string; description: string; icon: string }[] = [
  { key: 'periodic', label: 'Périodique', description: 'Inspection complète réglementaire', icon: 'calendar' },
  { key: 'pre_trip', label: 'Pré-trajet', description: 'Vérification avant départ', icon: 'play.fill' },
  { key: 'post_trip', label: 'Post-trajet', description: 'Vérification après trajet', icon: 'stop.fill' },
  { key: 'incident', label: 'Incident', description: 'Suite à un incident signalé', icon: 'exclamationmark.triangle.fill' },
];

export default function NewInspectionScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const router = useRouter();
  const colors = useColors();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedType, setSelectedType] = useState<InspectionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await getVehicles();
      const activeVehicles = data.filter(v => v.status === 'active');
      setVehicles(activeVehicles);
      setFilteredVehicles(activeVehicles);
      
      // Pre-select vehicle if provided
      if (vehicleId) {
        const preselected = activeVehicles.find(v => v.id === vehicleId);
        if (preselected) {
          setSelectedVehicle(preselected);
        }
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const lowerQuery = query.toLowerCase();
      setFilteredVehicles(vehicles.filter(v =>
        v.plate.toLowerCase().includes(lowerQuery) ||
        v.unit.toLowerCase().includes(lowerQuery) ||
        v.vin.toLowerCase().includes(lowerQuery)
      ));
    } else {
      setFilteredVehicles(vehicles);
    }
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVehicle(vehicle);
  };

  const handleSelectType = (type: InspectionType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedType(type);
  };

  const handleStartInspection = async () => {
    if (!selectedVehicle || !selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule et un type d\'inspection.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setCreating(true);
    try {
      const inspection = await createInspection(
        selectedVehicle.id,
        selectedType,
        'Jean Tremblay' // TODO: Get from user context
      );
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Navigate to checklist
      router.replace(`/checklist/${inspection.id}` as any);
    } catch (error) {
      console.error('Error creating inspection:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'inspection.');
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Stack.Screen options={{ title: 'Nouvelle inspection' }} />
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Nouvelle inspection',
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Select Vehicle */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
              <Text className="text-sm font-bold text-background">1</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">Sélectionner un véhicule</Text>
          </View>

          {selectedVehicle ? (
            <Pressable
              onPress={() => setSelectedVehicle(null)}
              style={({ pressed }) => [
                styles.selectedVehicle,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-lg bg-primary/10 items-center justify-center mr-3">
                  <IconSymbol name="car.fill" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-lg font-bold text-foreground">{selectedVehicle.plate}</Text>
                  <Text className="text-sm text-muted">
                    {selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.unit}
                  </Text>
                </View>
              </View>
              <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
            </Pressable>
          ) : (
            <>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Rechercher par plaque, unité..."
                className="mb-3"
              />
              <View style={styles.vehicleList}>
                {filteredVehicles.slice(0, 5).map((vehicle) => (
                  <Pressable
                    key={vehicle.id}
                    onPress={() => handleSelectVehicle(vehicle)}
                    style={({ pressed }) => [
                      styles.vehicleItem,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mr-3">
                      <IconSymbol name="car.fill" size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{vehicle.plate}</Text>
                      <Text className="text-sm text-muted">{vehicle.unit}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                  </Pressable>
                ))}
                {filteredVehicles.length === 0 && (
                  <View className="items-center py-8">
                    <Text className="text-muted">Aucun véhicule trouvé</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Step 2: Select Type */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center mb-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: selectedVehicle ? colors.primary : colors.muted }}
            >
              <Text className="text-sm font-bold text-background">2</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">Type d'inspection</Text>
          </View>

          <View style={styles.typeGrid}>
            {inspectionTypes.map((type) => (
              <Pressable
                key={type.key}
                onPress={() => handleSelectType(type.key)}
                disabled={!selectedVehicle}
                style={({ pressed }) => [
                  styles.typeCard,
                  selectedType === type.key && styles.typeCardSelected,
                  !selectedVehicle && styles.typeCardDisabled,
                  pressed && selectedVehicle && { opacity: 0.8 },
                ]}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                  style={{
                    backgroundColor: selectedType === type.key ? colors.primary : `${colors.primary}15`,
                  }}
                >
                  <IconSymbol
                    name={type.icon as any}
                    size={24}
                    color={selectedType === type.key ? '#FFFFFF' : colors.primary}
                  />
                </View>
                <Text
                  className="text-sm font-semibold text-center"
                  style={{ color: selectedType === type.key ? colors.primary : colors.foreground }}
                >
                  {type.label}
                </Text>
                <Text className="text-xs text-muted text-center mt-1">{type.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View className="px-4 mt-8">
          <Pressable
            onPress={handleStartInspection}
            disabled={!selectedVehicle || !selectedType || creating}
            style={({ pressed }) => [
              styles.startButton,
              (!selectedVehicle || !selectedType) && styles.startButtonDisabled,
              pressed && selectedVehicle && selectedType && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            {creating ? (
              <Text style={styles.startButtonText}>Création en cours...</Text>
            ) : (
              <>
                <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Démarrer l'inspection</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  selectedVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0066CC',
  },
  vehicleList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  typeCardSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  typeCardDisabled: {
    opacity: 0.5,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
