import { useEffect, useState, useCallback, useMemo } from 'react';
import { Text, View, Pressable, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getInspection, getChecklistItems, updateChecklistItem, updateInspection } from '@/lib/data-service';
import type { Inspection, ChecklistItem, ItemStatus, Proof } from '@/lib/types';
import { CameraCapture } from '@/components/camera-capture';
import { ProofGallery } from '@/components/proof-gallery';
import { notifyInspectionCompleted, notifyMajorDefect, notifyWorkOrderCreated } from '@/lib/notification-service';
import { createWorkOrderFromInspection } from '@/lib/work-order-service';
import { getVehicle } from '@/lib/data-service';

const statusConfig: Record<ItemStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: '#64748B', icon: 'clock.fill' },
  ok: { label: 'OK', color: '#22C55E', icon: 'checkmark.circle.fill' },
  minor_defect: { label: 'Défaut mineur', color: '#F59E0B', icon: 'exclamationmark.triangle.fill' },
  major_defect: { label: 'Défaut majeur', color: '#EF4444', icon: 'xmark.circle.fill' },
  blocking_defect: { label: 'Défaut bloquant', color: '#DC2626', icon: 'xmark.octagon.fill' },
};

export default function ChecklistScreen() {
  const { id, startIndex } = useLocalSearchParams<{ id: string; startIndex?: string }>();
  const router = useRouter();
  const colors = useColors();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(parseInt(startIndex || '0'));
  const [notes, setNotes] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [itemProofs, setItemProofs] = useState<Record<string, Proof[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? Math.round(((currentIndex + 1) / items.length) * 100) : 0;

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [inspectionData, itemsData] = await Promise.all([
        getInspection(id),
        getChecklistItems(id),
      ]);
      setInspection(inspectionData);
      setItems(itemsData);
      
      // Update inspection status to IN_PROGRESS if DRAFT
      if (inspectionData?.status === 'DRAFT') {
        await updateInspection(id, { status: 'IN_PROGRESS' });
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (currentItem) {
      setNotes(currentItem.notes || '');
      // Load proofs for current item
      if (!itemProofs[currentItem.id]) {
        setItemProofs(prev => ({ ...prev, [currentItem.id]: [] }));
      }
    }
  }, [currentIndex, currentItem]);

  const currentProofs = useMemo(() => {
    return currentItem ? (itemProofs[currentItem.id] || []) : [];
  }, [currentItem, itemProofs]);

  const handleAddProof = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCamera(true);
  };

  const handleCapturePhoto = (uri: string) => {
    if (!currentItem) return;
    
    const newProof: Proof = {
      id: `proof_${Date.now()}`,
      checklistItemId: currentItem.id,
      type: 'photo',
      uri,
      localUri: uri,
      timestamp: new Date().toISOString(),
    };

    setItemProofs(prev => ({
      ...prev,
      [currentItem.id]: [...(prev[currentItem.id] || []), newProof],
    }));

    setShowCamera(false);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteProof = (proofId: string) => {
    if (!currentItem) return;
    
    setItemProofs(prev => ({
      ...prev,
      [currentItem.id]: (prev[currentItem.id] || []).filter(p => p.id !== proofId),
    }));
  };

  const handleStatusSelect = async (status: ItemStatus) => {
    if (!currentItem || saving) return;

    if (Platform.OS !== 'web') {
      if (status === 'ok') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (status === 'major_defect') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }

    // Check if proof is required for defects
    if ((status === 'minor_defect' || status === 'major_defect') && !notes.trim() && currentProofs.length === 0) {
      Alert.alert(
        'Preuve requise',
        'Veuillez ajouter une note ou une photo décrivant le défaut.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSaving(true);
    try {
      await updateChecklistItem(currentItem.id, {
        status,
        notes: notes.trim() || null,
      });

      // Update local state
      const updatedItems = [...items];
      updatedItems[currentIndex] = {
        ...updatedItems[currentIndex],
        status,
        notes: notes.trim() || null,
      };
      setItems(updatedItems);

      // Move to next item or finish
      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setNotes('');
      } else {
        // All items completed
        handleComplete();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Reload inspection to get updated counts
    const updatedInspection = await getInspection(id!);
    const vehicle = updatedInspection?.vehicleId ? await getVehicle(updatedInspection.vehicleId) : null;
    const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.plate}` : 'Véhicule';
    
    // Check if there are any defects (minor or major)
    const hasDefects = (updatedInspection?.minorDefectCount || 0) > 0 || (updatedInspection?.majorDefectCount || 0) > 0;
    
    if (updatedInspection?.majorDefectCount && updatedInspection.majorDefectCount > 0) {
      // Send notification for major defects
      await notifyMajorDefect(
        vehicleName,
        `${updatedInspection.majorDefectCount} défaut(s) majeur(s) détecté(s)`,
        id!
      );
      
      // Create work order automatically for defects
      if (hasDefects) {
        try {
          // Collect defects from checklist items
          const defects = items
            .filter(item => item.status === 'minor_defect' || item.status === 'major_defect')
            .map(item => ({
              description: item.title + (item.notes ? `: ${item.notes}` : ''),
              componentCode: item.vmrsCode || item.sectionId,
              defectType: item.status === 'major_defect' ? 'MAJOR' as const : 'MINOR' as const,
            }));
          
          const workOrder = await createWorkOrderFromInspection(
            id!,
            updatedInspection.vehicleId,
            vehicleName,
            defects
          );
          
          // Send notification for work order created
          await notifyWorkOrderCreated(
            vehicleName,
            workOrder.orderNumber,
            defects.length
          );
          
          Alert.alert(
            'Inspection bloquée',
            `L'inspection est bloquée en raison de ${updatedInspection.majorDefectCount} défaut(s) majeur(s).\n\nBon de travail ${workOrder.orderNumber} créé automatiquement avec ${defects.length} tâche(s).`,
            [
              {
                text: 'Voir le bon de travail',
                onPress: () => router.replace(`/work-orders/${workOrder.id}` as any),
              },
              {
                text: 'Voir le résumé',
                onPress: () => router.replace(`/inspection/${id}` as any),
              },
            ]
          );
        } catch (error) {
          console.error('Error creating work order:', error);
          Alert.alert(
            'Inspection bloquée',
            `L'inspection est bloquée en raison de ${updatedInspection.majorDefectCount} défaut(s) majeur(s). Erreur lors de la création du bon de travail.`,
            [
              {
                text: 'Voir le résumé',
                onPress: () => router.replace(`/inspection/${id}` as any),
              },
            ]
          );
        }
      }
    } else if (hasDefects) {
      // Minor defects only - create work order but don't block
      try {
        const defects = items
          .filter(item => item.status === 'minor_defect')
          .map(item => ({
            description: item.title + (item.notes ? `: ${item.notes}` : ''),
            componentCode: item.vmrsCode || item.sectionId,
            defectType: 'MINOR' as const,
          }));
        
        const workOrder = await createWorkOrderFromInspection(
          id!,
          updatedInspection?.vehicleId || '',
          vehicleName,
          defects
        );
        
        await notifyWorkOrderCreated(
          vehicleName,
          workOrder.orderNumber,
          defects.length
        );
        
        await notifyInspectionCompleted(vehicleName, id!);
        
        Alert.alert(
          'Inspection terminée',
          `L'inspection est complétée avec ${defects.length} défaut(s) mineur(s).\n\nBon de travail ${workOrder.orderNumber} créé pour les réparations.`,
          [
            {
              text: 'Voir le bon de travail',
              onPress: () => router.replace(`/work-orders/${workOrder.id}` as any),
            },
            {
              text: 'Voir le résumé',
              onPress: () => router.replace(`/inspection/${id}` as any),
            },
          ]
        );
      } catch (error) {
        console.error('Error creating work order:', error);
        Alert.alert(
          'Inspection terminée',
          'Tous les éléments ont été vérifiés. L\'inspection est complétée.',
          [
            {
              text: 'Voir le résumé',
              onPress: () => router.replace(`/inspection/${id}` as any),
            },
          ]
        );
      }
    } else {
      // No defects - just complete
      await notifyInspectionCompleted(vehicleName, id!);
      
      Alert.alert(
        'Inspection terminée',
        'Tous les éléments ont été vérifiés. L\'inspection est complétée sans défaut.',
        [
          {
            text: 'Voir le résumé',
            onPress: () => router.replace(`/inspection/${id}` as any),
          },
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentIndex(currentIndex + 1);
      setNotes('');
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Quitter l\'inspection',
      'Votre progression sera sauvegardée. Vous pourrez reprendre plus tard.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          onPress: () => router.back(),
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

  if (!currentItem) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Stack.Screen options={{ title: 'Erreur' }} />
        <IconSymbol name="xmark.circle.fill" size={48} color={colors.error} />
        <Text className="text-foreground mt-4">Aucun élément à inspecter</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          title: inspection?.vehicle?.plate || 'Inspection',
          headerBackTitle: 'Retour',
          headerLeft: () => (
            <Pressable onPress={handleExit} style={{ padding: 8 }}>
              <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Progress Header */}
        <View className="px-4 py-3 bg-surface border-b border-border">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-muted">
              {currentItem.sectionName}
            </Text>
            <Text className="text-sm font-semibold text-foreground">
              {currentIndex + 1} / {items.length}
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-4 py-6">
          {/* Item Info */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-2xl bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="clipboard.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-foreground text-center mb-2">
              {currentItem.title}
            </Text>
            <Text className="text-base text-muted text-center">
              {currentItem.description}
            </Text>
            {currentItem.isRequired && (
              <View className="mt-2 bg-error/10 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-error">Obligatoire</Text>
              </View>
            )}
          </View>

          {/* Notes Input */}
          {/* Proof Gallery */}
          <View className="mb-6">
            <ProofGallery
              proofs={currentProofs}
              onAddProof={handleAddProof}
              onDeleteProof={handleDeleteProof}
            />
          </View>

          {/* Notes Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Notes (requis si défaut)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ajouter une note..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
              className="bg-surface border border-border rounded-xl p-3 text-foreground"
            />
          </View>

          {/* Current Status */}
          {currentItem.status !== 'pending' && (
            <View className="mb-4 flex-row items-center justify-center">
              <Text className="text-sm text-muted mr-2">Statut actuel:</Text>
              <View
                className="flex-row items-center px-3 py-1 rounded-full"
                style={{ backgroundColor: `${statusConfig[currentItem.status].color}15` }}
              >
                <IconSymbol
                  name={statusConfig[currentItem.status].icon as any}
                  size={14}
                  color={statusConfig[currentItem.status].color}
                />
                <Text
                  className="text-sm font-semibold ml-1"
                  style={{ color: statusConfig[currentItem.status].color }}
                >
                  {statusConfig[currentItem.status].label}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Status Buttons */}
        <View className="px-4 pb-4">
          <View className="flex-row gap-3 mb-3">
            <Pressable
              onPress={() => handleStatusSelect('ok')}
              disabled={saving}
              style={({ pressed }) => [
                styles.statusButton,
                { backgroundColor: '#22C55E' },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol name="checkmark.circle.fill" size={24} color="#FFFFFF" />
              <Text style={styles.statusButtonText}>OK</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-3">
            <Pressable
              onPress={() => handleStatusSelect('minor_defect')}
              disabled={saving}
              style={({ pressed }) => [
                styles.statusButton,
                { backgroundColor: '#F59E0B', flex: 1 },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FFFFFF" />
              <Text style={[styles.statusButtonText, { fontSize: 14 }]}>Mineur</Text>
            </Pressable>
            <Pressable
              onPress={() => handleStatusSelect('major_defect')}
              disabled={saving}
              style={({ pressed }) => [
                styles.statusButton,
                { backgroundColor: '#EF4444', flex: 1 },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#FFFFFF" />
              <Text style={[styles.statusButtonText, { fontSize: 14 }]}>Majeur</Text>
            </Pressable>
          </View>

          {/* Navigation */}
          <View className="flex-row justify-between mt-2">
            <Pressable
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              style={({ pressed }) => [
                styles.navButton,
                currentIndex === 0 && { opacity: 0.3 },
                pressed && currentIndex > 0 && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="chevron.left" size={18} color={colors.primary} />
              <Text style={[styles.navButtonText, { color: colors.primary }]}>Précédent</Text>
            </Pressable>
            <Pressable
              onPress={handleSkip}
              disabled={currentIndex === items.length - 1}
              style={({ pressed }) => [
                styles.navButton,
                currentIndex === items.length - 1 && { opacity: 0.3 },
                pressed && currentIndex < items.length - 1 && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.navButtonText, { color: colors.muted }]}>Passer</Text>
              <IconSymbol name="chevron.right" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Camera Modal */}
      {showCamera && (
        <View style={StyleSheet.absoluteFill}>
          <CameraCapture
            onCapture={handleCapturePhoto}
            onClose={() => setShowCamera(false)}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
