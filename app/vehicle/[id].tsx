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
import { getVehicle, getInspectionsByVehicle, deleteVehicle } from '@/lib/data-service';
import { getDocuments, addDocument, deleteDocument, type VehicleDocument } from '@/lib/documents-service';
import { getPEPFormsByVehicle, type PEPForm } from '@/lib/pep-service';
import { canAccessPEP } from '@/lib/subscription-service';
import * as DocumentPicker from 'expo-document-picker';
import type { Vehicle, Inspection, VehicleImage } from '@/lib/types';
import { ImageGallery } from '@/components/ui/image-gallery';
import { DocumentList } from '@/components/ui/document-list';
import type { VehicleDocument as VehicleDocType } from '@/lib/types';
import { VehicleAssignmentManager } from '@/components/vehicle-assignment-manager';

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
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [pepForms, setPepForms] = useState<PEPForm[]>([]);
  const [hasPEPAccess, setHasPEPAccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehicleImages, setVehicleImages] = useState<VehicleImage[]>([]);
  const [vehicleDocs, setVehicleDocs] = useState<VehicleDocType[]>([]);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [vehicleData, inspectionsData, documentsData, pepFormsData, pepAccessResult] = await Promise.all([
        getVehicle(id),
        getInspectionsByVehicle(id),
        getDocuments(id),
        getPEPFormsByVehicle(id),
        canAccessPEP(),
      ]);
      setVehicle(vehicleData);
      setInspections(inspectionsData.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ));
      setDocuments(documentsData);
      setPepForms(pepFormsData);
      setHasPEPAccess(pepAccessResult.allowed);
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

  const handleEdit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/vehicle/add?id=${id}` as any);
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le véhicule',
      `Êtes-vous sûr de vouloir supprimer ${vehicle?.make} ${vehicle?.model}? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await deleteVehicle(id);
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                router.back();
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le véhicule');
            }
          },
        },
      ]
    );
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
              onPress={handleEdit}
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
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.secondaryButton,
                { flex: 1 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="trash.fill" size={18} color={colors.error} />
              <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Supprimer</Text>
            </Pressable>
          </View>
        </View>

        {/* Techniciens assignés */}
        <View className="mx-4 mt-6">
          <VehicleAssignmentManager
            vehicleId={id || ''}
            vehiclePlate={vehicle.plate}
            onAssignmentChange={loadData}
          />
        </View>

        {/* Galerie d'images */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">
              Galerie photos ({vehicleImages.length})
            </Text>
          </View>
          <View className="bg-surface rounded-xl border border-border p-4">
            <ImageGallery
              images={vehicleImages.map(img => ({
                id: img.id,
                uri: img.uri,
                caption: img.caption,
                createdAt: img.takenAt,
              }))}
              onAddImage={async (uri) => {
                const newImage: VehicleImage = {
                  id: `img_${Date.now()}`,
                  vehicleId: id || '',
                  uri: uri,
                  localUri: uri,
                  thumbnail: uri,
                  caption: '',
                  takenAt: new Date().toISOString(),
                  uploadedBy: 'current_user',
                  isPrimary: vehicleImages.length === 0,
                };
                setVehicleImages(prev => [...prev, newImage]);
              }}
              onRemoveImage={(imgId) => {
                setVehicleImages(prev => prev.filter(img => img.id !== imgId));
              }}
              maxImages={20}
              editable={true}
              emptyText="Aucune photo du véhicule"
            />
          </View>
        </View>

        {/* Documents améliorés */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">
              Documents ({vehicleDocs.length})
            </Text>
          </View>
          <DocumentList
            documents={vehicleDocs}
            onAddDocument={async (doc) => {
              const newDoc: VehicleDocType = {
                ...doc,
                id: `doc_${Date.now()}`,
                vehicleId: id || '',
              };
              setVehicleDocs(prev => [...prev, newDoc]);
            }}
            onRemoveDocument={(docId) => {
              setVehicleDocs(prev => prev.filter(d => d.id !== docId));
            }}
            editable={true}
            emptyText="Aucun document attaché"
          />
        </View>

        {/* Fiches PEP SAAQ */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-foreground">
                Fiches PEP ({pepForms.length})
              </Text>
              {!hasPEPAccess && (
                <View className="ml-2 bg-warning px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-bold text-background">PRO</Text>
                </View>
              )}
            </View>
            {hasPEPAccess && (
              <Pressable
                onPress={() => router.push(`/pep/create?vehicleId=${id}` as any)}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>+ Nouvelle</Text>
              </Pressable>
            )}
          </View>
          {pepForms.length > 0 ? (
            <View className="rounded-xl border border-border" style={{ backgroundColor: colors.surface }}>
              {pepForms.slice(0, 5).map((form, index) => {
                const statusColor = form.totalMajorDefects > 0 ? colors.error : 
                  form.totalMinorDefects > 0 ? colors.warning : colors.success;
                const statusText = form.totalMajorDefects > 0 ? 'Défauts majeurs' :
                  form.totalMinorDefects > 0 ? 'Défauts mineurs' : 'Conforme';
                return (
                  <Pressable
                    key={form.id}
                    onPress={() => router.push(`/pep/sign?pepId=${form.id}` as any)}
                    style={({ pressed }) => [{
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomWidth: index < Math.min(pepForms.length, 5) - 1 ? 1 : 0,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-semibold" style={{ color: colors.foreground }}>
                          PEP du {new Date(form.inspectionDate).toLocaleDateString('fr-CA')}
                        </Text>
                        <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor + '20' }}>
                          <Text className="text-xs font-medium" style={{ color: statusColor }}>
                            {statusText}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                        {form.status === 'signed' ? 'Signée' : form.status === 'draft' ? 'Brouillon' : 'Complétée'}
                        {form.nextMaintenanceDate && ` • Prochain: ${new Date(form.nextMaintenanceDate).toLocaleDateString('fr-CA')}`}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="bg-surface rounded-xl border border-border p-6 items-center">
              <IconSymbol name="doc.text.fill" size={32} color={colors.muted} />
              <Text className="text-muted mt-2 text-center">
                {hasPEPAccess ? 'Aucune fiche PEP pour ce véhicule' : 'Passez au plan Pro pour accéder aux fiches PEP'}
              </Text>
              {!hasPEPAccess && (
                <Pressable
                  onPress={() => router.push('/subscription/upgrade' as any)}
                  style={({ pressed }) => [{
                    marginTop: 12,
                    backgroundColor: colors.warning,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    opacity: pressed ? 0.7 : 1,
                  }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Voir les plans</Text>
                </Pressable>
              )}
            </View>
          )}
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
