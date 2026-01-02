/**
 * Composant de liste de documents pour FleetCore
 * Affiche et gère les documents attachés aux véhicules
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './icon-symbol';
import type { VehicleDocument } from '@/lib/types';

interface DocumentListProps {
  documents: VehicleDocument[];
  onAddDocument?: (doc: Omit<VehicleDocument, 'id'>) => void;
  onRemoveDocument?: (id: string) => void;
  editable?: boolean;
  emptyText?: string;
}

const DOCUMENT_TYPES: Record<VehicleDocument['type'], { label: string; icon: string; color: string }> = {
  registration: { label: 'Immatriculation', icon: 'doc.text', color: '#0891B2' },
  insurance: { label: 'Assurance', icon: 'shield.checkmark', color: '#059669' },
  inspection: { label: 'Rapport d\'inspection', icon: 'checkmark.seal', color: '#7C3AED' },
  invoice: { label: 'Facture', icon: 'doc.text.fill', color: '#EF4444' },
  permit: { label: 'Permis spécial', icon: 'doc.badge.gearshape', color: '#F59E0B' },
  other: { label: 'Autre', icon: 'doc', color: '#6B7280' },
};

export function DocumentList({
  documents,
  onAddDocument,
  onRemoveDocument,
  editable = true,
  emptyText = 'Aucun document',
}: DocumentListProps) {
  const colors = useColors();
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState<VehicleDocument['type'] | null>(null);

  const handlePickDocument = async (type: VehicleDocument['type']) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const newDoc: Omit<VehicleDocument, 'id'> = {
          vehicleId: '',
          type,
          name: asset.name,
          description: '',
          fileUrl: asset.uri,
          localUri: asset.uri,
          mimeType: asset.mimeType || 'application/octet-stream',
          fileSize: asset.size || 0,
          expiryDate: type === 'insurance' || type === 'registration' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
          uploadedBy: 'current_user',
          uploadedAt: new Date().toISOString(),
        };
        onAddDocument?.(newDoc
          );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le document');
    }

    setShowTypeModal(false);
    setSelectedType(null);
  };

  const handleRemoveDocument = (doc: VehicleDocument) => {
    Alert.alert(
      'Supprimer le document',
      `Êtes-vous sûr de vouloir supprimer "${doc.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onRemoveDocument?.(doc.id);
          },
        },
      ]
    );
  };

  const handleOpenDocument = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir ce document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileExtension = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext || 'doc';
  };

  return (
    <View>
      {documents.length === 0 ? (
        <View
          style={{
            padding: 24,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
        >
          <IconSymbol name="doc.text" size={40} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>{emptyText}</Text>
          {editable && (
            <Pressable
              onPress={() => setShowTypeModal(true)}
              style={{
                marginTop: 12,
                backgroundColor: colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>
                Ajouter un document
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View>
          {documents.map((doc) => {
            const typeConfig = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.other;
            const expired = isExpired(doc.expiryDate);
            const expiringSoon = isExpiringSoon(doc.expiryDate);

            return (
              <Pressable
                key={doc.id}
                onPress={() => handleOpenDocument(doc.fileUrl)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  opacity: pressed ? 0.7 : 1,
                  borderWidth: expired ? 1 : 0,
                  borderColor: colors.error,
                })}
              >
                {/* Icône */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: typeConfig.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <IconSymbol name={typeConfig.icon as any} size={22} color={typeConfig.color} />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: colors.foreground, fontSize: 14, fontWeight: '500' }}
                    numberOfLines={1}
                  >
                    {doc.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <View
                      style={{
                        backgroundColor: typeConfig.color + '20',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: typeConfig.color, fontSize: 10, fontWeight: '500' }}>
                        {typeConfig.label}
                      </Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 11, marginLeft: 8 }}>
                      {getFileExtension(doc.name).toUpperCase()}
                    </Text>
                  </View>
                  
                  {/* Date d'expiration */}
                  {doc.expiryDate && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <IconSymbol
                        name="calendar"
                        size={12}
                        color={expired ? colors.error : expiringSoon ? colors.warning : colors.muted}
                      />
                      <Text
                        style={{
                          color: expired ? colors.error : expiringSoon ? colors.warning : colors.muted,
                          fontSize: 11,
                          marginLeft: 4,
                        }}
                      >
                        {expired
                          ? `Expiré le ${formatDate(doc.expiryDate)}`
                          : `Expire le ${formatDate(doc.expiryDate)}`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {editable && (
                  <Pressable
                    onPress={() => handleRemoveDocument(doc)}
                    style={({ pressed }) => ({
                      padding: 8,
                      opacity: pressed ? 0.5 : 1,
                    })}
                  >
                    <IconSymbol name="trash" size={18} color={colors.error} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}

          {/* Bouton ajouter */}
          {editable && (
            <Pressable
              onPress={() => setShowTypeModal(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <IconSymbol name="plus" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '500', marginLeft: 8 }}>
                Ajouter un document
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Modal de sélection du type */}
      <Modal
        visible={showTypeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTypeModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setShowTypeModal(false)}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 8,
              paddingBottom: 40,
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <Text
              style={{
                color: colors.foreground,
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Type de document
            </Text>

            {(Object.keys(DOCUMENT_TYPES) as VehicleDocument['type'][]).map((type) => {
              const config = DOCUMENT_TYPES[type];
              return (
                <Pressable
                  key={type}
                  onPress={() => handlePickDocument(type)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    backgroundColor: pressed ? colors.surface : 'transparent',
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: config.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}
                  >
                    <IconSymbol name={config.icon as any} size={20} color={config.color} />
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 16 }}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default DocumentList;
