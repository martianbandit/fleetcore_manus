import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { addVehicle, updateVehicle, getVehicle } from '@/lib/data-service';
import { canAddVehicle } from '@/lib/subscription-service';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Vehicle } from '@/lib/types';

export default function AddVehicleScreen() {
  const { colors, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const isEditMode = !!vehicleId;
  
  const [formData, setFormData] = useState({
    id: vehicleId || '',
    vin: '',
    plate: '',
    unit: '',
    vehicleClass: 'C' as Vehicle['vehicleClass'],
    make: '',
    model: '',
    year: new Date().getFullYear(),
    companyId: '',
    coverImage: null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEditMode);

  // Charger les données du véhicule en mode édition
  useEffect(() => {
    if (isEditMode && vehicleId) {
      loadVehicleData(vehicleId);
    }
  }, [vehicleId]);

  const loadVehicleData = async (id: string) => {
    try {
      const vehicle = await getVehicle(id);
      if (vehicle) {
        setFormData({
          id: vehicle.id,
          vin: vehicle.vin,
          plate: vehicle.plate,
          unit: vehicle.unit,
          vehicleClass: vehicle.vehicleClass,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          companyId: vehicle.companyId,
          coverImage: null, // TODO: charger l'image de couverture
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données du véhicule');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vin || formData.vin.length !== 17) {
      newErrors.vin = 'Le NIV doit contenir exactement 17 caractères';
    }
    if (!formData.plate) {
      newErrors.plate = 'La plaque d\'immatriculation est requise';
    }
    if (!formData.unit) {
      newErrors.unit = 'Le numéro d\'unité est requis';
    }
    if (!formData.make) {
      newErrors.make = 'La marque est requise';
    }
    if (!formData.model) {
      newErrors.model = 'Le modèle est requis';
    }
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Année invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, coverImage: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à la caméra.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, coverImage: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    // Check subscription limits (only for new vehicles)
    if (!isEditMode) {
      const limitCheck = await canAddVehicle();
      if (!limitCheck.allowed) {
        Alert.alert(
          'Limite atteinte',
          limitCheck.reason || 'Impossible d\'ajouter plus de véhicules',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Voir les plans', onPress: () => router.push('/subscription/upgrade' as any) },
          ]
        );
        return;
      }
    }

    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      if (isEditMode) {
        await updateVehicle(formData.id, {
          ...formData,
        });
        Alert.alert('Succès', 'Véhicule modifié avec succès', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addVehicle({
          ...formData,
          status: 'active',
          lastInspectionDate: null,
          lastInspectionStatus: null,
        });
        Alert.alert('Succès', 'Véhicule ajouté avec succès', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', `Impossible de ${isEditMode ? 'modifier' : 'ajouter'} le véhicule`);
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ opacity: 0.7 }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            {isEditMode ? 'Éditer le véhicule' : 'Nouveau véhicule'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Cover Image */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Image de couverture
          </Text>
          {formData.coverImage ? (
            <View className="relative">
              <Image
                source={{ uri: formData.coverImage }}
                className="w-full h-48 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, coverImage: null })}
                className="absolute top-2 right-2 rounded-full p-2"
                style={{ backgroundColor: colors.error }}
              >
                <IconSymbol name="xmark" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 h-32 rounded-xl border-2 border-dashed items-center justify-center"
                style={{ borderColor: colors.border }}
              >
                <IconSymbol name="photo" size={32} color={colors.muted} />
                <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                  Galerie
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 h-32 rounded-xl border-2 border-dashed items-center justify-center"
                style={{ borderColor: colors.border }}
              >
                <IconSymbol name="camera" size={32} color={colors.muted} />
                <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                  Caméra
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* VIN */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            NIV (Numéro d'identification) *
          </Text>
          <TextInput
            value={formData.vin}
            onChangeText={(text) => setFormData({ ...formData, vin: text.toUpperCase() })}
            placeholder="Ex: 1HGBH41JXMN109186"
            maxLength={17}
            autoCapitalize="characters"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.vin ? 2 : 0,
              borderColor: errors.vin ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.vin && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.vin}
            </Text>
          )}
        </View>

        {/* Plate */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Plaque d'immatriculation *
          </Text>
          <TextInput
            value={formData.plate}
            onChangeText={(text) => setFormData({ ...formData, plate: text.toUpperCase() })}
            placeholder="Ex: ABC-1234"
            autoCapitalize="characters"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.plate ? 2 : 0,
              borderColor: errors.plate ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.plate && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.plate}
            </Text>
          )}
        </View>

        {/* Unit */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Numéro d'unité *
          </Text>
          <TextInput
            value={formData.unit}
            onChangeText={(text) => setFormData({ ...formData, unit: text })}
            placeholder="Ex: TRUCK-001"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.unit ? 2 : 0,
              borderColor: errors.unit ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.unit && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.unit}
            </Text>
          )}
        </View>

        {/* Vehicle Class */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Classe de véhicule *
          </Text>
          <View className="flex-row gap-2">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => setFormData({ ...formData, vehicleClass: cls })}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: formData.vehicleClass === cls ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    color: formData.vehicleClass === cls ? '#FFF' : colors.foreground,
                  }}
                >
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Make */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Marque *
          </Text>
          <TextInput
            value={formData.make}
            onChangeText={(text) => setFormData({ ...formData, make: text })}
            placeholder="Ex: Freightliner"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.make ? 2 : 0,
              borderColor: errors.make ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.make && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.make}
            </Text>
          )}
        </View>

        {/* Model */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Modèle *
          </Text>
          <TextInput
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
            placeholder="Ex: Cascadia"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.model ? 2 : 0,
              borderColor: errors.model ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.model && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.model}
            </Text>
          )}
        </View>

        {/* Year */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            Année *
          </Text>
          <TextInput
            value={formData.year.toString()}
            onChangeText={(text) => setFormData({ ...formData, year: parseInt(text) || new Date().getFullYear() })}
            placeholder="Ex: 2024"
            keyboardType="numeric"
            maxLength={4}
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              borderWidth: errors.year ? 2 : 0,
              borderColor: errors.year ? colors.error : 'transparent',
            }}
            placeholderTextColor={colors.muted}
          />
          {errors.year && (
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              {errors.year}
            </Text>
          )}
        </View>

        {/* Company ID (optional) */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            ID Compagnie (optionnel)
          </Text>
          <TextInput
            value={formData.companyId}
            onChangeText={(text) => setFormData({ ...formData, companyId: text })}
            placeholder="Ex: COMP-001"
            className="rounded-xl px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.muted}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="rounded-xl py-4 items-center mb-8"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-base">
            Ajouter le véhicule
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
