import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { InspectionCard } from '@/components/ui/inspection-card';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getVehicle, getInspectionsByVehicle } from '@/lib/data-service';
import type { Vehicle, Inspection } from '@/lib/types';

interface InfoRowProps {
  icon: IconSymbolName;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  const colors = useColors();
  return (
    <View className="flex-row items-center py-3 border-b border-border">
      <IconSymbol name={icon} size={18} color={colors.muted} />
      <Text className="text-sm text-muted ml-3 w-28">{label}</Text>
      <Text className="text-sm font-medium text-foreground flex-1">{value}</Text>
    </View>
  );
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [vehicleData, inspectionsData] = await Promise.all([
        getVehicle(id),
        getInspectionsByVehicle(id),
      ]);
      setVehicle(vehicleData);
      setInspections(inspectionsData.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleStartInspection = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/new-inspection?vehicleId=${id}` as any);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Stack.Screen options={{ title: 'Chargement...' }} />
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!vehicle) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Stack.Screen options={{ title: 'Erreur' }} />
        <IconSymbol name="xmark.circle.fill" size={48} color={colors.error} />
        <Text className="text-foreground mt-4">Véhicule non trouvé</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: vehicle.plate,
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View className="mx-4 mt-4 bg-surface rounded-xl border border-border p-4">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-xl bg-primary/10 items-center justify-center mr-4">
                <IconSymbol name="car.fill" size={32} color={colors.primary} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-foreground">{vehicle.plate}</Text>
                <Text className="text-base text-muted">{vehicle.unit}</Text>
              </View>
            </View>
            <StatusBadge status={vehicle.status} />
          </View>

          <View className="bg-background rounded-lg p-3">
            <Text className="text-lg font-semibold text-foreground">
              {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-sm text-muted">{vehicle.year}</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View className="mx-4 mt-4 bg-surface rounded-xl border border-border p-4">
          <Text className="text-lg font-bold text-foreground mb-2">Informations</Text>
          <InfoRow icon="doc.text.fill" label="VIN" value={vehicle.vin} />
          <InfoRow icon="car.fill" label="Classe" value={`Classe ${vehicle.vehicleClass}`} />
          <InfoRow
            icon="calendar"
            label="Ajouté le"
            value={new Date(vehicle.createdAt).toLocaleDateString('fr-CA')}
          />
          {vehicle.lastInspectionDate && (
            <InfoRow
              icon="clipboard.fill"
              label="Dernière inspection"
              value={new Date(vehicle.lastInspectionDate).toLocaleDateString('fr-CA')}
            />
          )}
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4">
          <Pressable
            onPress={handleStartInspection}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Lancer une inspection</Text>
          </Pressable>

          <View className="flex-row mt-3 gap-3">
            <Pressable
              onPress={() => Alert.alert('Info', 'Modification à venir')}
              style={({ pressed }) => [
                styles.secondaryButton,
                { flex: 1 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="pencil" size={18} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Modifier</Text>
            </Pressable>
            <Pressable
              onPress={() => Alert.alert('Info', 'Archivage à venir')}
              style={({ pressed }) => [
                styles.secondaryButton,
                { flex: 1 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="trash.fill" size={18} color={colors.error} />
              <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Archiver</Text>
            </Pressable>
          </View>
        </View>

        {/* Inspection History */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Historique des inspections ({inspections.length})
          </Text>
          {inspections.length > 0 ? (
            inspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                compact
                onPress={() => router.push(`/inspection/${inspection.id}` as any)}
              />
            ))
          ) : (
            <View className="bg-surface rounded-xl border border-border p-6 items-center">
              <IconSymbol name="clipboard.fill" size={32} color={colors.muted} />
              <Text className="text-muted mt-2">Aucune inspection pour ce véhicule</Text>
            </View>
          )}
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
  backButton: {
    marginTop: 16,
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
