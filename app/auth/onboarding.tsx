import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  createCompanyProfile,
  setOnboardingCompleted,
  type CompanySize,
  type FleetType,
  companySizeLabels,
  fleetTypeLabels,
} from '@/lib/company-service';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    logo: undefined as string | undefined,
    size: '6-20' as CompanySize,
    estimatedVehicles: 10,
    fleetType: 'heavy_trucks' as FleetType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Le nom de l\'entreprise doit contenir au moins 2 caractères';
      }
    }

    if (currentStep === 3) {
      if (formData.estimatedVehicles < 1 || formData.estimatedVehicles > 10000) {
        newErrors.estimatedVehicles = 'Nombre de véhicules invalide (1-10000)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await createCompanyProfile(formData);
      await setOnboardingCompleted(true);
      
      Alert.alert(
        'Bienvenue!',
        'Votre profil a été créé avec succès.',
        [{ text: 'Commencer', onPress: () => router.replace('/(tabs)' as any) }]
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Erreur', 'Impossible de créer le profil');
    }
  };

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, logo: result.assets[0].uri });
    }
  };

  const renderStep1 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
        Bienvenue sur FleetCore
      </Text>
      <Text className="text-base mb-8" style={{ color: colors.muted }}>
        Commençons par configurer votre entreprise
      </Text>

      <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
        Nom de l'entreprise *
      </Text>
      <TextInput
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder="Ex: Transport ABC Inc."
        className="rounded-xl px-4 py-3 text-base mb-6"
        style={{
          backgroundColor: colors.surface,
          color: colors.foreground,
          borderWidth: errors.name ? 2 : 0,
          borderColor: errors.name ? colors.error : 'transparent',
        }}
        placeholderTextColor={colors.muted}
      />
      {errors.name && (
        <Text className="text-xs -mt-4 mb-4" style={{ color: colors.error }}>
          {errors.name}
        </Text>
      )}

      <Text className="text-sm font-semibold mb-3" style={{ color: colors.foreground }}>
        Logo de l'entreprise (optionnel)
      </Text>
      {formData.logo ? (
        <View className="items-center mb-6">
          <Image
            source={{ uri: formData.logo }}
            className="w-32 h-32 rounded-xl mb-3"
            resizeMode="cover"
          />
          <TouchableOpacity onPress={() => setFormData({ ...formData, logo: undefined })}>
            <Text className="text-sm" style={{ color: colors.error }}>
              Supprimer
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickLogo}
          className="h-32 rounded-xl border-2 border-dashed items-center justify-center mb-6"
          style={{ borderColor: colors.border }}
        >
          <IconSymbol name="photo" size={32} color={colors.muted} />
          <Text className="text-sm mt-2" style={{ color: colors.muted }}>
            Ajouter un logo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
        Taille de l'entreprise
      </Text>
      <Text className="text-base mb-8" style={{ color: colors.muted }}>
        Combien d'employés travaillent dans votre entreprise?
      </Text>

      {(Object.keys(companySizeLabels) as CompanySize[]).map((size) => (
        <TouchableOpacity
          key={size}
          onPress={() => setFormData({ ...formData, size })}
          className="rounded-xl p-4 mb-3 flex-row items-center justify-between"
          style={{
            backgroundColor: formData.size === size ? `${colors.primary}15` : colors.surface,
            borderWidth: formData.size === size ? 2 : 1,
            borderColor: formData.size === size ? colors.primary : colors.border,
          }}
        >
          <Text
            className="text-base font-medium"
            style={{
              color: formData.size === size ? colors.primary : colors.foreground,
            }}
          >
            {companySizeLabels[size]}
          </Text>
          {formData.size === size && (
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
        Taille de la flotte
      </Text>
      <Text className="text-base mb-8" style={{ color: colors.muted }}>
        Combien de véhicules gérez-vous approximativement?
      </Text>

      <View className="items-center mb-8">
        <Text className="text-6xl font-bold mb-4" style={{ color: colors.primary }}>
          {formData.estimatedVehicles}
        </Text>
        <Text className="text-base" style={{ color: colors.muted }}>
          véhicules
        </Text>
      </View>

      <View className="flex-row items-center gap-4 mb-6">
        <TouchableOpacity
          onPress={() => setFormData({ ...formData, estimatedVehicles: Math.max(1, formData.estimatedVehicles - 5) })}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-3xl" style={{ color: colors.foreground }}>-</Text>
        </TouchableOpacity>

        <TextInput
          value={formData.estimatedVehicles.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 0;
            setFormData({ ...formData, estimatedVehicles: Math.max(1, Math.min(10000, num)) });
          }}
          keyboardType="numeric"
          className="flex-1 rounded-xl px-4 py-3 text-center text-2xl font-bold"
          style={{
            backgroundColor: colors.surface,
            color: colors.foreground,
          }}
        />

        <TouchableOpacity
          onPress={() => setFormData({ ...formData, estimatedVehicles: Math.min(10000, formData.estimatedVehicles + 5) })}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-3xl" style={{ color: colors.foreground }}>+</Text>
        </TouchableOpacity>
      </View>

      {errors.estimatedVehicles && (
        <Text className="text-sm text-center" style={{ color: colors.error }}>
          {errors.estimatedVehicles}
        </Text>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="flex-1">
      <Text className="text-3xl font-bold mb-2" style={{ color: colors.foreground }}>
        Type de flotte
      </Text>
      <Text className="text-base mb-8" style={{ color: colors.muted }}>
        Quel type de véhicules composent votre flotte?
      </Text>

      {(Object.keys(fleetTypeLabels) as FleetType[]).map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => setFormData({ ...formData, fleetType: type })}
          className="rounded-xl p-4 mb-3 flex-row items-center justify-between"
          style={{
            backgroundColor: formData.fleetType === type ? `${colors.primary}15` : colors.surface,
            borderWidth: formData.fleetType === type ? 2 : 1,
            borderColor: formData.fleetType === type ? colors.primary : colors.border,
          }}
        >
          <Text
            className="text-base font-medium"
            style={{
              color: formData.fleetType === type ? colors.primary : colors.foreground,
            }}
          >
            {fleetTypeLabels[type]}
          </Text>
          {formData.fleetType === type && (
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Progress Indicator */}
        <View className="flex-row mb-8">
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              className="flex-1 h-1 mx-1 rounded-full"
              style={{
                backgroundColor: s <= step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 py-6">
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              className="flex-1 rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="font-semibold text-base" style={{ color: colors.foreground }}>
                Retour
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            className="flex-1 rounded-xl py-4 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-base">
              {step === 4 ? 'Terminer' : 'Suivant'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        {step < 4 && (
          <TouchableOpacity
            onPress={() => setStep(4)}
            className="items-center py-4"
          >
            <Text className="text-sm" style={{ color: colors.muted }}>
              Passer
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
