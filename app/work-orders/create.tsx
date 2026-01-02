import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getVehicles } from '@/lib/data-service';
import type { Vehicle } from '@/lib/types';
import { createWorkOrder, type WorkOrderPriority } from '@/lib/work-order-service';

const priorities: { value: WorkOrderPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Basse', color: '#64748B' },
  { value: 'MEDIUM', label: 'Moyenne', color: '#3B82F6' },
  { value: 'HIGH', label: 'Haute', color: '#F59E0B' },
  { value: 'URGENT', label: 'Urgente', color: '#EF4444' },
];

export default function CreateWorkOrderScreen() {
  const { colors } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<WorkOrderPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
  };

  const handleCreate = async () => {
    if (!selectedVehicle) {
      Alert.alert('Erreur', 'Veuillez sélectionner un véhicule');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return;
    }

    setLoading(true);
    try {
      const workOrder = await createWorkOrder({
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.plate}`,
        status: 'PENDING',
        priority,
        title: title.trim(),
        description: description.trim(),
        items: [],
        estimatedTotalTime: 0,
        estimatedTotalCost: 0,
      });

      Alert.alert(
        'Bon créé',
        `Le bon de travail ${workOrder.orderNumber} a été créé avec succès.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le bon de travail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          Nouveau bon de travail
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Vehicle Selection */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            VÉHICULE *
          </Text>
          <TouchableOpacity
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface }}
            onPress={() => setShowVehiclePicker(!showVehiclePicker)}
          >
            {selectedVehicle ? (
              <View className="flex-row items-center">
                <IconSymbol name="car.fill" size={20} color={colors.primary} />
                <Text className="text-base ml-3" style={{ color: colors.foreground }}>
                  {selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.plate}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.muted }}>Sélectionner un véhicule</Text>
            )}
          </TouchableOpacity>

          {showVehiclePicker && (
            <View className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
              {vehicles.length === 0 ? (
                <View className="p-4">
                  <Text style={{ color: colors.muted }}>Aucun véhicule disponible</Text>
                </View>
              ) : (
                vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    className="p-4 border-b"
                    style={{ borderColor: colors.border }}
                    onPress={() => {
                      setSelectedVehicle(vehicle);
                      setShowVehiclePicker(false);
                    }}
                  >
                    <Text style={{ color: colors.foreground }}>
                      {vehicle.make} {vehicle.model} - {vehicle.plate}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      Unité: {vehicle.unit}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            TITRE *
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholder="Ex: Remplacement des freins"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            DESCRIPTION
          </Text>
          <TextInput
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.surface, color: colors.foreground, minHeight: 100 }}
            placeholder="Détails du travail à effectuer..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            PRIORITÉ
          </Text>
          <View className="flex-row gap-2">
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: priority === p.value ? p.color + '20' : colors.surface,
                  borderWidth: priority === p.value ? 2 : 0,
                  borderColor: p.color,
                }}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: priority === p.value ? p.color : colors.foreground }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          className="py-4 rounded-xl items-center"
          style={{ backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? 'Création...' : 'Créer le bon de travail'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
