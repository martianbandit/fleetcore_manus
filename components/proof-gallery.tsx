import { View, Text, Pressable, Image, StyleSheet, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import type { Proof } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface ProofGalleryProps {
  proofs: Proof[];
  onAddProof?: () => void;
  onDeleteProof?: (proofId: string) => void;
  readonly?: boolean;
}

export function ProofGallery({ proofs, onAddProof, onDeleteProof, readonly = false }: ProofGalleryProps) {
  const colors = useColors();
  const [selectedProof, setSelectedProof] = useState<Proof | null>(null);

  const handleSelectProof = (proof: Proof) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedProof(proof);
  };

  const handleCloseModal = () => {
    setSelectedProof(null);
  };

  const handleDelete = (proofId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDeleteProof?.(proofId);
    setSelectedProof(null);
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-foreground">
          Preuves photographiques ({proofs.length})
        </Text>
        {!readonly && onAddProof && (
          <Pressable
            onPress={onAddProof}
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol name="camera.fill" size={16} color={colors.primary} />
            <Text style={[styles.addButtonText, { color: colors.primary }]}>Ajouter</Text>
          </Pressable>
        )}
      </View>

      {proofs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {proofs.map((proof) => (
            <Pressable
              key={proof.id}
              onPress={() => handleSelectProof(proof)}
              style={({ pressed }) => [
                styles.proofCard,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Image
                source={{ uri: proof.uri }}
                style={styles.proofImage}
                resizeMode="cover"
              />
              <View style={styles.proofOverlay}>
                <View
                  className="flex-row items-center px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                  <IconSymbol
                    name={proof.type === 'video' ? 'video.fill' : 'camera.fill'}
                    size={12}
                    color="#FFFFFF"
                  />
                  {proof.location && (
                    <Text style={styles.locationText}>Pos. {proof.location}</Text>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View className="bg-surface rounded-xl border border-border p-6 items-center">
          <IconSymbol name="camera.fill" size={32} color={colors.muted} />
          <Text className="text-sm text-muted mt-2 text-center">
            {readonly
              ? 'Aucune preuve photographique'
              : 'Ajoutez des photos pour documenter les défauts'}
          </Text>
        </View>
      )}

      {/* Full Screen Modal */}
      <Modal
        visible={selectedProof !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          
          {selectedProof && (
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Preuve photographique</Text>
                  <Text style={styles.modalSubtitle}>
                    {new Date(selectedProof.timestamp).toLocaleString('fr-CA')}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCloseModal}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <IconSymbol name="xmark.circle.fill" size={28} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Image */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: selectedProof.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>

              {/* Info */}
              <View style={styles.modalInfo}>
                {selectedProof.location && (
                  <View className="flex-row items-center mb-2">
                    <IconSymbol name="location.fill" size={16} color={colors.primary} />
                    <Text className="text-sm text-foreground ml-2">
                      Position: {selectedProof.location}
                    </Text>
                  </View>
                )}
                {selectedProof.notes && (
                  <View className="flex-row items-start mb-2">
                    <IconSymbol name="doc.text.fill" size={16} color={colors.muted} />
                    <Text className="text-sm text-foreground ml-2 flex-1">
                      {selectedProof.notes}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              {!readonly && onDeleteProof && (
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => handleDelete(selectedProof.id)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gallery: {
    gap: 12,
    paddingRight: 16,
  },
  proofCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  proofOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0066CC',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalImageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalInfo: {
    padding: 16,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
