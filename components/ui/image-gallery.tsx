/**
 * Composant de galerie d'images pour FleetCore
 * Affiche une galerie d'images avec prévisualisation et gestion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from './icon-symbol';

interface ImageItem {
  id: string;
  uri: string;
  caption?: string;
  createdAt?: string;
  type?: 'photo' | 'document';
}

interface ImageGalleryProps {
  images: ImageItem[];
  onAddImage?: (uri: string) => void;
  onRemoveImage?: (id: string) => void;
  maxImages?: number;
  editable?: boolean;
  columns?: number;
  showAddButton?: boolean;
  emptyText?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ImageGallery({
  images,
  onAddImage,
  onRemoveImage,
  maxImages = 10,
  editable = true,
  columns = 3,
  showAddButton = true,
  emptyText = 'Aucune image',
}: ImageGalleryProps) {
  const colors = useColors();
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const imageSize = (SCREEN_WIDTH - 48 - (columns - 1) * 8) / columns;

  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limite atteinte', `Maximum ${maxImages} images autorisées`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onAddImage?.(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limite atteinte', `Maximum ${maxImages} images autorisées`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onAddImage?.(result.assets[0].uri);
    }
  };

  const handleRemoveImage = (image: ImageItem) => {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onRemoveImage?.(image.id);
            setSelectedImage(null);
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une image',
      'Choisissez une source',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Prendre une photo', onPress: handleTakePhoto },
        { text: 'Galerie', onPress: handleAddImage },
      ]
    );
  };

  const renderImage = ({ item, index }: { item: ImageItem; index: number }) => (
    <Pressable
      onPress={() => {
        setSelectedImage(item);
        setViewerIndex(index);
      }}
      style={({ pressed }) => ({
        width: imageSize,
        height: imageSize,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: (index + 1) % columns !== 0 ? 8 : 0,
        marginBottom: 8,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Image
        source={{ uri: item.uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
      />
      {editable && (
        <Pressable
          onPress={() => handleRemoveImage(item)}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.6)',
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name="xmark" size={14} color="#FFFFFF" />
        </Pressable>
      )}
    </Pressable>
  );

  const renderAddButton = () => {
    if (!showAddButton || !editable || images.length >= maxImages) return null;

    return (
      <Pressable
        onPress={showImageOptions}
        style={({ pressed }) => ({
          width: imageSize,
          height: imageSize,
          borderRadius: 8,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <IconSymbol name="plus" size={24} color={colors.muted} />
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
          Ajouter
        </Text>
      </Pressable>
    );
  };

  return (
    <View>
      {images.length === 0 && !showAddButton ? (
        <View
          style={{
            padding: 24,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
        >
          <IconSymbol name="photo.on.rectangle" size={40} color={colors.muted} />
          <Text style={{ color: colors.muted, marginTop: 8 }}>{emptyText}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {images.map((item, index) => (
            <View key={item.id}>{renderImage({ item, index })}</View>
          ))}
          {renderAddButton()}
        </View>
      )}

      {/* Compteur */}
      {images.length > 0 && (
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
          {images.length}/{maxImages} images
        </Text>
      )}

      {/* Visionneuse plein écran */}
      <Modal
        visible={!!selectedImage}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingBottom: 16,
            }}
          >
            <Pressable onPress={() => setSelectedImage(null)}>
              <IconSymbol name="xmark" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
              {viewerIndex + 1} / {images.length}
            </Text>
            {editable && selectedImage && (
              <Pressable onPress={() => handleRemoveImage(selectedImage)}>
                <IconSymbol name="trash" size={22} color="#EF4444" />
              </Pressable>
            )}
          </View>

          {/* Image */}
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setViewerIndex(newIndex);
              setSelectedImage(images[newIndex]);
            }}
            renderItem={({ item }) => (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  contentFit="contain"
                />
                {item.caption && (
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 14,
                      marginTop: 16,
                      textAlign: 'center',
                      paddingHorizontal: 24,
                    }}
                  >
                    {item.caption}
                  </Text>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
          />

          {/* Miniatures */}
          {images.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingVertical: 16,
                paddingBottom: 40,
              }}
            >
              {images.map((img, idx) => (
                <Pressable
                  key={img.id}
                  onPress={() => {
                    setViewerIndex(idx);
                    setSelectedImage(img);
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 6,
                    marginHorizontal: 4,
                    borderWidth: idx === viewerIndex ? 2 : 0,
                    borderColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: img.uri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

export default ImageGallery;
