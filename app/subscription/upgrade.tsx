import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useTheme } from '@/lib/theme-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  type PlanType,
  PLAN_NAMES,
  PLAN_DESCRIPTIONS,
  PLAN_PRICES,
  PLAN_FEATURES,
  updateSubscription,
  getSubscription,
} from '@/lib/subscription-service';
import { useEffect } from 'react';

export default function UpgradeScreen() {
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    const subscription = await getSubscription();
    setCurrentPlan(subscription.plan);
  };

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) {
      Alert.alert('Information', 'Vous êtes déjà sur ce plan');
      return;
    }

    Alert.alert(
      'Confirmer l\'upgrade',
      `Passer au plan ${PLAN_NAMES[selectedPlan]} pour ${PLAN_PRICES[selectedPlan][billingPeriod]} ${PLAN_PRICES[selectedPlan].currency}/${billingPeriod === 'monthly' ? 'mois' : 'an'}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            await updateSubscription(selectedPlan);
            Alert.alert(
              'Succès!',
              `Vous êtes maintenant sur le plan ${PLAN_NAMES[selectedPlan]}`,
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const renderPlanCard = (plan: PlanType) => {
    const isSelected = selectedPlan === plan;
    const isCurrent = currentPlan === plan;
    const price = PLAN_PRICES[plan][billingPeriod];

    return (
      <TouchableOpacity
        key={plan}
        onPress={() => setSelectedPlan(plan)}
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: isSelected ? `${colors.primary}15` : colors.surface,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.primary : colors.border,
        }}
      >
        {isCurrent && (
          <View
            className="absolute top-3 right-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-white text-xs font-semibold">Plan actuel</Text>
          </View>
        )}

        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: isSelected ? colors.primary : colors.foreground }}
        >
          {PLAN_NAMES[plan]}
        </Text>
        <Text className="text-sm mb-4" style={{ color: colors.muted }}>
          {PLAN_DESCRIPTIONS[plan]}
        </Text>

        <View className="flex-row items-baseline mb-6">
          <Text
            className="text-4xl font-bold"
            style={{ color: isSelected ? colors.primary : colors.foreground }}
          >
            {price}
          </Text>
          <Text className="text-lg ml-2" style={{ color: colors.muted }}>
            {PLAN_PRICES[plan].currency}/{billingPeriod === 'monthly' ? 'mois' : 'an'}
          </Text>
        </View>

        {billingPeriod === 'yearly' && price > 0 && (
          <View
            className="px-3 py-1 rounded-full self-start mb-4"
            style={{ backgroundColor: colors.success + '20' }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.success }}>
              Économisez {Math.round((1 - price / (PLAN_PRICES[plan].monthly * 12)) * 100)}%
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Choisir un plan
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Billing Period Toggle */}
        <View className="flex-row rounded-xl p-1 mb-6" style={{ backgroundColor: colors.surface }}>
          <TouchableOpacity
            onPress={() => setBillingPeriod('monthly')}
            className="flex-1 py-3 rounded-lg"
            style={{
              backgroundColor: billingPeriod === 'monthly' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: billingPeriod === 'monthly' ? '#FFF' : colors.foreground,
              }}
            >
              Mensuel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBillingPeriod('yearly')}
            className="flex-1 py-3 rounded-lg"
            style={{
              backgroundColor: billingPeriod === 'yearly' ? colors.primary : 'transparent',
            }}
          >
            <Text
              className="text-center font-semibold"
              style={{
                color: billingPeriod === 'yearly' ? '#FFF' : colors.foreground,
              }}
            >
              Annuel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {renderPlanCard('free')}
        {renderPlanCard('pro')}
        {renderPlanCard('enterprise')}

        {/* Features Comparison */}
        <View className="mt-6 mb-4">
          <Text className="text-xl font-bold mb-4" style={{ color: colors.foreground }}>
            Comparaison des fonctionnalités
          </Text>

          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            {/* Header */}
            <View className="flex-row p-3 border-b" style={{ borderColor: colors.border }}>
              <View className="flex-1" />
              <Text className="w-20 text-center text-xs font-semibold" style={{ color: colors.muted }}>
                Gratuit
              </Text>
              <Text className="w-20 text-center text-xs font-semibold" style={{ color: colors.muted }}>
                Pro
              </Text>
              <Text className="w-20 text-center text-xs font-semibold" style={{ color: colors.muted }}>
                Enterprise
              </Text>
            </View>

            {/* Features */}
            {PLAN_FEATURES.map((feature, index) => (
              <View
                key={feature.name}
                className="flex-row p-3"
                style={{
                  borderBottomWidth: index < PLAN_FEATURES.length - 1 ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <Text className="flex-1 text-sm" style={{ color: colors.foreground }}>
                  {feature.name}
                </Text>
                {(['free', 'pro', 'enterprise'] as const).map((plan) => (
                  <View key={plan} className="w-20 items-center">
                    {typeof feature[plan] === 'boolean' ? (
                      feature[plan] ? (
                        <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                      ) : (
                        <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
                      )
                    ) : (
                      <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                        {feature[plan]}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          onPress={handleUpgrade}
          className="rounded-xl py-4 items-center mb-8"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-lg">
            {selectedPlan === currentPlan
              ? 'Plan actuel'
              : `Passer au plan ${PLAN_NAMES[selectedPlan]}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
