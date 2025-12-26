import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  calculateTotalPrice,
  formatPrice,
  getVehicleTierName,
  getEmployeeTierName,
  qualifiesForEnterprise,
  STRIPE_PRICING,
} from '@/lib/stripe-service';
import { trpc } from '@/lib/trpc';

export default function PricingScreen() {
  const { colors } = useTheme();
  const [vehicleCount, setVehicleCount] = useState(5);
  const [employeeCount, setEmployeeCount] = useState(2);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pricing = calculateTotalPrice(vehicleCount, employeeCount, selectedFeatures);
  const isEnterprise = qualifiesForEnterprise(vehicleCount, employeeCount);

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleSubscribe = async () => {
    if (vehicleCount === 0 && employeeCount === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un véhicule ou un employé');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call tRPC to create checkout session
      // const result = await trpc.stripe.createCheckoutSession.mutate({
      //   vehicleCount,
      //   employeeCount,
      //   enabledFeatures: selectedFeatures,
      //   successUrl: 'fleetcore://subscription/success',
      //   cancelUrl: 'fleetcore://subscription/pricing',
      // });
      
      Alert.alert(
        'Paiement',
        'L\'intégration Stripe nécessite la configuration des clés API. Veuillez contacter le support.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Erreur', 'Impossible de créer la session de paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Tarification FleetCore
          </Text>
          <Text className="text-base mt-2" style={{ color: colors.muted }}>
            Payez uniquement pour ce que vous utilisez
          </Text>
        </View>

        {/* Vehicle Count */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                  Nombre de véhicules
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  {getVehicleTierName(vehicleCount)}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setVehicleCount(Math.max(0, vehicleCount - 1))}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <IconSymbol name="minus" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold w-12 text-center" style={{ color: colors.foreground }}>
                  {vehicleCount}
                </Text>
                <TouchableOpacity
                  onPress={() => setVehicleCount(vehicleCount + 1)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <IconSymbol name="plus" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Prix par véhicule
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {vehicleCount >= 61
                  ? 'Forfait 500$/mois'
                  : vehicleCount >= 31
                  ? '10$/mois'
                  : vehicleCount >= 11
                  ? '12$/mois'
                  : '15$/mois'}
              </Text>
            </View>
          </View>
        </View>

        {/* Employee Count */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                  Nombre d'employés
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  {getEmployeeTierName(employeeCount)}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setEmployeeCount(Math.max(0, employeeCount - 1))}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <IconSymbol name="minus" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-2xl font-bold w-12 text-center" style={{ color: colors.foreground }}>
                  {employeeCount}
                </Text>
                <TouchableOpacity
                  onPress={() => setEmployeeCount(employeeCount + 1)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <IconSymbol name="plus" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Prix par employé
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {employeeCount >= 16
                  ? 'Forfait 250$/mois'
                  : employeeCount >= 6
                  ? '20$/mois'
                  : '25$/mois'}
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.muted }}>
            FONCTIONNALITÉS ADDITIONNELLES
          </Text>

          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            {/* Advanced Metrics */}
            <TouchableOpacity
              onPress={() => toggleFeature('advancedMetrics')}
              className="p-4 flex-row items-center border-b"
              style={{ borderColor: colors.border }}
            >
              <View
                className="w-6 h-6 rounded-md items-center justify-center mr-3"
                style={{
                  backgroundColor: selectedFeatures.includes('advancedMetrics')
                    ? colors.primary
                    : colors.border,
                }}
              >
                {selectedFeatures.includes('advancedMetrics') && (
                  <IconSymbol name="checkmark" size={16} color="#FFF" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  Métriques avancées
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Temps de travail, coûts, statistiques
                </Text>
              </View>
              <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                50$/mois
              </Text>
            </TouchableOpacity>

            {/* Premium PDF Export */}
            <TouchableOpacity
              onPress={() => toggleFeature('premiumPdfExport')}
              className="p-4 flex-row items-center border-b"
              style={{ borderColor: colors.border }}
            >
              <View
                className="w-6 h-6 rounded-md items-center justify-center mr-3"
                style={{
                  backgroundColor: selectedFeatures.includes('premiumPdfExport')
                    ? colors.primary
                    : colors.border,
                }}
              >
                {selectedFeatures.includes('premiumPdfExport') && (
                  <IconSymbol name="checkmark" size={16} color="#FFF" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  Export PDF Premium
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Rapports personnalisés avec logo
                </Text>
              </View>
              <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                30$/mois
              </Text>
            </TouchableOpacity>

            {/* Cloud Sync */}
            <TouchableOpacity
              onPress={() => toggleFeature('cloudSync')}
              className="p-4 flex-row items-center"
            >
              <View
                className="w-6 h-6 rounded-md items-center justify-center mr-3"
                style={{
                  backgroundColor: selectedFeatures.includes('cloudSync')
                    ? colors.primary
                    : colors.border,
                }}
              >
                {selectedFeatures.includes('cloudSync') && (
                  <IconSymbol name="checkmark" size={16} color="#FFF" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  Synchronisation Cloud
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.muted }}>
                  Backup automatique et multi-appareils
                </Text>
              </View>
              <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                40$/mois
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enterprise Notice */}
        {isEnterprise && (
          <View className="px-4 mb-6">
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary }}
            >
              <View className="flex-row items-start">
                <IconSymbol name="star.fill" size={20} color={colors.primary} />
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold" style={{ color: colors.primary }}>
                    Éligible au plan Enterprise
                  </Text>
                  <Text className="text-sm mt-1" style={{ color: colors.foreground }}>
                    Vous bénéficiez d'un forfait avantageux pour grandes flottes. Contactez-nous pour une offre personnalisée.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Price Summary */}
        <View className="px-4 mb-6">
          <View className="rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
              Résumé
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-base" style={{ color: colors.muted }}>
                {vehicleCount} véhicules
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {formatPrice(pricing.breakdown.vehicles.price)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-base" style={{ color: colors.muted }}>
                {employeeCount} employés
              </Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {formatPrice(pricing.breakdown.employees.price)}
              </Text>
            </View>

            {selectedFeatures.length > 0 && (
              <>
                <View className="h-px my-3" style={{ backgroundColor: colors.border }} />
                {selectedFeatures.map((feature) => (
                  <View key={feature} className="flex-row justify-between mb-2">
                    <Text className="text-base" style={{ color: colors.muted }}>
                      {feature === 'advancedMetrics'
                        ? 'Métriques avancées'
                        : feature === 'premiumPdfExport'
                        ? 'Export PDF Premium'
                        : 'Synchronisation Cloud'}
                    </Text>
                    <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                      {formatPrice(pricing.breakdown.features[feature])}
                    </Text>
                  </View>
                ))}
              </>
            )}

            <View className="h-px my-3" style={{ backgroundColor: colors.border }} />

            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                Total
              </Text>
              <View className="items-end">
                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {formatPrice(pricing.total)}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  par mois
                </Text>
              </View>
            </View>

            <View
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.success + '15' }}
            >
              <Text className="text-sm text-center" style={{ color: colors.success }}>
                ✓ 14 jours d'essai gratuit • Annulez à tout moment
              </Text>
            </View>
          </View>
        </View>

        {/* Subscribe Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={loading}
            className="rounded-2xl py-4 items-center"
            style={{
              backgroundColor: colors.primary,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text className="text-lg font-bold text-white">
              {loading ? 'Chargement...' : 'Commencer l\'essai gratuit'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
