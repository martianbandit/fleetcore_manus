import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getInspection, getChecklistItems, updateInspection, getVehicle } from '@/lib/data-service';
import { generateAndSharePDF } from '@/lib/pdf-generator';
import type { Inspection, ChecklistItem, ChecklistSection } from '@/lib/types';

const typeLabels: Record<string, string> = {
  periodic: 'Périodique',
  pre_trip: 'Pré-trajet',
  post_trip: 'Post-trajet',
  incident: 'Incident',
};

export default function InspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [inspectionData, itemsData] = await Promise.all([
        getInspection(id),
        getChecklistItems(id),
      ]);
      setInspection(inspectionData);
      setChecklistItems(itemsData);
      
      // Group items by section
      const sectionMap = new Map<string, ChecklistSection>();
      itemsData.forEach(item => {
        if (!sectionMap.has(item.sectionId)) {
          sectionMap.set(item.sectionId, {
            id: item.sectionId,
            name: item.sectionName,
            order: parseInt(item.sectionId.replace('s', '')),
            items: [],
          });
        }
        sectionMap.get(item.sectionId)!.items.push(item);
      });
      setSections(Array.from(sectionMap.values()).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading inspection:', error);
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

  const handleContinueInspection = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Find the first pending item
    const pendingItem = checklistItems.find(item => item.status === 'pending');
    const startIndex = pendingItem 
      ? checklistItems.findIndex(i => i.id === pendingItem.id)
      : 0;
    router.push(`/checklist/${id}?startIndex=${startIndex}` as any);
  };

  const handleGenerateReport = async () => {
    if (!inspection || !inspection.vehicle) {
      Alert.alert('Erreur', 'Informations du véhicule manquantes');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      Alert.alert(
        'Génération du rapport',
        'Génération du rapport PDF en cours...',
        []
      );

      await generateAndSharePDF({
        inspection,
        vehicle: inspection.vehicle,
        checklistItems,
        technicianNumber: 'TEC-001', // TODO: Get from user profile
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Erreur',
        'Impossible de générer le rapport PDF. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const progress = inspection 
    ? Math.round((inspection.completedItems / inspection.totalItems) * 100)
    : 0;

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!inspection) {
    return (
      <ScreenContainer className="items-center justify-center">
        <IconSymbol name="xmark.circle.fill" size={48} color={colors.error} />
        <Text className="text-foreground mt-4">Inspection non trouvée</Text>
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
            <View>
              <Text className="text-2xl font-bold text-foreground">
                {inspection.vehicle?.plate || 'Véhicule'}
              </Text>
              <Text className="text-base text-muted">{typeLabels[inspection.type]}</Text>
            </View>
            <StatusBadge status={inspection.status} />
          </View>

          {/* Progress */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Progression</Text>
              <Text className="text-sm font-semibold text-foreground">
                {inspection.completedItems}/{inspection.totalItems} ({progress}%)
              </Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between bg-background rounded-lg p-3">
            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <IconSymbol name="checkmark.circle.fill" size={18} color="#22C55E" />
                <Text className="text-lg font-bold text-success ml-1">{inspection.okCount}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">OK</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#F59E0B" />
                <Text className="text-lg font-bold text-warning ml-1">{inspection.minorDefectCount}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">Mineurs</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center flex-1">
              <View className="flex-row items-center">
                <IconSymbol name="xmark.circle.fill" size={18} color="#EF4444" />
                <Text className="text-lg font-bold text-error ml-1">{inspection.majorDefectCount}</Text>
              </View>
              <Text className="text-xs text-muted mt-1">Majeurs</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="mx-4 mt-4 bg-surface rounded-xl border border-border p-4">
          <Text className="text-lg font-bold text-foreground mb-3">Informations</Text>
          <View className="flex-row items-center py-2 border-b border-border">
            <IconSymbol name="person.fill" size={16} color={colors.muted} />
            <Text className="text-sm text-muted ml-2 w-24">Technicien</Text>
            <Text className="text-sm font-medium text-foreground flex-1">
              {inspection.technicianName}
            </Text>
          </View>
          <View className="flex-row items-center py-2 border-b border-border">
            <IconSymbol name="calendar" size={16} color={colors.muted} />
            <Text className="text-sm text-muted ml-2 w-24">Débutée le</Text>
            <Text className="text-sm font-medium text-foreground flex-1">
              {new Date(inspection.startedAt).toLocaleString('fr-CA')}
            </Text>
          </View>
          {inspection.completedAt && (
            <View className="flex-row items-center py-2">
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-2 w-24">Terminée le</Text>
              <Text className="text-sm font-medium text-foreground flex-1">
                {new Date(inspection.completedAt).toLocaleString('fr-CA')}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {(inspection.status === 'IN_PROGRESS' || inspection.status === 'DRAFT') && (
          <View className="mx-4 mt-4">
            <Pressable
              onPress={handleContinueInspection}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {inspection.status === 'DRAFT' ? 'Démarrer l\'inspection' : 'Continuer l\'inspection'}
              </Text>
            </Pressable>
          </View>
        )}

        {inspection.status === 'COMPLETED' && (
          <View className="mx-4 mt-4">
            <Pressable
              onPress={handleGenerateReport}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: '#22C55E' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol name="doc.text.fill" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Générer le rapport PDF</Text>
            </Pressable>
          </View>
        )}

        {inspection.status === 'BLOCKED' && (
          <View className="mx-4 mt-4 bg-error/10 rounded-xl p-4 border border-error/30">
            <View className="flex-row items-center mb-2">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.error} />
              <Text className="text-base font-bold text-error ml-2">Inspection bloquée</Text>
            </View>
            <Text className="text-sm text-foreground">
              Cette inspection est bloquée en raison d'un ou plusieurs défauts majeurs. 
              Les défauts doivent être corrigés avant de pouvoir clôturer l'inspection.
            </Text>
          </View>
        )}

        {/* Checklist Sections */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Checklist ({checklistItems.length} items)
          </Text>
          {sections.map((section) => {
            const sectionOk = section.items.filter(i => i.status === 'ok').length;
            const sectionMinor = section.items.filter(i => i.status === 'minor_defect').length;
            const sectionMajor = section.items.filter(i => i.status === 'major_defect').length;
            const sectionPending = section.items.filter(i => i.status === 'pending').length;
            
            return (
              <View
                key={section.id}
                className="bg-surface rounded-xl border border-border p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {section.name}
                  </Text>
                  <Text className="text-xs text-muted">
                    {section.items.length - sectionPending}/{section.items.length}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  {sectionOk > 0 && (
                    <View className="flex-row items-center">
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
                      <Text className="text-xs text-success ml-1">{sectionOk}</Text>
                    </View>
                  )}
                  {sectionMinor > 0 && (
                    <View className="flex-row items-center">
                      <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F59E0B" />
                      <Text className="text-xs text-warning ml-1">{sectionMinor}</Text>
                    </View>
                  )}
                  {sectionMajor > 0 && (
                    <View className="flex-row items-center">
                      <IconSymbol name="xmark.circle.fill" size={14} color="#EF4444" />
                      <Text className="text-xs text-error ml-1">{sectionMajor}</Text>
                    </View>
                  )}
                  {sectionPending > 0 && (
                    <View className="flex-row items-center">
                      <IconSymbol name="clock.fill" size={14} color="#64748B" />
                      <Text className="text-xs text-muted ml-1">{sectionPending}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Notes */}
        {inspection.notes && (
          <View className="mx-4 mb-4 bg-surface rounded-xl border border-border p-4">
            <Text className="text-lg font-bold text-foreground mb-2">Notes</Text>
            <Text className="text-sm text-foreground">{inspection.notes}</Text>
          </View>
        )}

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
});
