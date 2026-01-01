/**
 * Subscription Management Screen
 * Allows users to view and manage their Stripe subscription
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';

export default function ManageSubscriptionScreen() {
  const colors = useColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fetch subscription data
  const { data: subscription, isLoading: subLoading } = trpc.stripe.getSubscription.useQuery(undefined);
  const { data: invoices, isLoading: invoicesLoading } = trpc.stripe.getInvoices.useQuery({ limit: 10 });

  // Mutations
  const cancelMutation = trpc.stripe.cancelSubscription.useMutation();
  const portalMutation = trpc.stripe.createPortalSession.useMutation();

  const handleCancelSubscription = () => {
    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès jusqu\'à la fin de la période de facturation actuelle.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              if (!subscription?.id) return;
              await cancelMutation.mutateAsync({ subscriptionId: subscription.id });
              Alert.alert('Succès', 'Votre abonnement a été annulé');
              // Refresh data after cancellation
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'annuler l\'abonnement');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPortal = async () => {
    try {
      setLoading(true);
      const result = await portalMutation.mutateAsync({ returnUrl: window.location.href });
      await Linking.openURL(result.url);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'ouvrir le portail');
    } finally {
      setLoading(false);
    }
  };

  const handleModifySubscription = () => {
    router.push('/subscription/pricing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'trialing':
        return colors.primary;
      case 'past_due':
      case 'unpaid':
        return colors.warning;
      case 'canceled':
      case 'incomplete_expired':
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'trialing':
        return 'Période d\'essai';
      case 'past_due':
        return 'Paiement en retard';
      case 'unpaid':
        return 'Impayé';
      case 'canceled':
        return 'Annulé';
      case 'incomplete':
        return 'Incomplet';
      case 'incomplete_expired':
        return 'Expiré';
      default:
        return status;
    }
  };

  const getInvoiceStatusColor = (status: string | null) => {
    if (!status) return colors.muted;
    switch (status) {
      case 'paid':
        return colors.success;
      case 'open':
        return colors.primary;
      case 'void':
      case 'uncollectible':
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getInvoiceStatusLabel = (status: string | null) => {
    if (!status) return 'Inconnu';
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'open':
        return 'En attente';
      case 'void':
        return 'Annulée';
      case 'uncollectible':
        return 'Irrécouvrable';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  if (subLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">Chargement...</Text>
      </ScreenContainer>
    );
  }

  if (!subscription) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center">
          <IconSymbol name="creditcard" size={64} color={colors.muted} />
          <Text className="text-2xl font-bold mt-4" style={{ color: colors.foreground }}>
            Aucun abonnement
          </Text>
          <Text className="text-center mt-2 mb-6" style={{ color: colors.muted }}>
            Vous n'avez pas encore d'abonnement actif
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/subscription/pricing')}
            className="bg-primary px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-lg">Voir les plans</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            Mon abonnement
          </Text>
        </View>

        {/* Subscription Details */}
        <View className="px-4 mb-6">
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                Plan actuel
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getStatusColor(subscription.status) + '20' }}
              >
                <Text className="font-semibold" style={{ color: getStatusColor(subscription.status) }}>
                  {getStatusLabel(subscription.status)}
                </Text>
              </View>
            </View>

            {/* Subscription Items */}
            {subscription.items.map((item) => (
              <View key={item.id} className="mb-3">
                <Text className="font-semibold" style={{ color: colors.foreground }}>
                  Prix ID: {item.priceId}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Quantité: {item.quantity || 0}
                </Text>
              </View>
            ))}

            <View className="border-t border-border pt-4 mt-2">
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: colors.muted }}>Période actuelle</Text>
                <Text style={{ color: colors.foreground }}>
                  {format(new Date(subscription.currentPeriodStart), 'dd MMM yyyy')} -{' '}
                  {format(new Date(subscription.currentPeriodEnd), 'dd MMM yyyy')}
                </Text>
              </View>
              {subscription.cancelAtPeriodEnd && (
                <Text className="text-sm mt-2" style={{ color: colors.error }}>
                  ⚠️ L'abonnement sera annulé le {format(new Date(subscription.currentPeriodEnd), 'dd MMMM yyyy')}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            onPress={handleModifySubscription}
            disabled={loading}
            className="bg-primary py-4 rounded-xl mb-3 flex-row items-center justify-center"
          >
            <IconSymbol name="pencil" size={20} color="#fff" />
            <Text className="text-white font-semibold text-lg ml-2">Modifier l'abonnement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenPortal}
            disabled={loading}
            className="bg-surface py-4 rounded-xl mb-3 flex-row items-center justify-center border border-border"
          >
            <IconSymbol name="creditcard" size={20} color={colors.foreground} />
            <Text className="font-semibold text-lg ml-2" style={{ color: colors.foreground }}>
              Gérer les paiements
            </Text>
          </TouchableOpacity>

          {!subscription.cancelAtPeriodEnd && (
            <TouchableOpacity
              onPress={handleCancelSubscription}
              disabled={loading}
              className="py-4 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: colors.error + '20' }}
            >
              <IconSymbol name="xmark.circle" size={20} color={colors.error} />
              <Text className="font-semibold text-lg ml-2" style={{ color: colors.error }}>
                Annuler l'abonnement
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Invoices History */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
            Historique des factures
          </Text>

          {invoicesLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <View key={invoice.id} className="bg-surface rounded-xl p-4 mb-3 border border-border">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      Facture #{invoice.number || invoice.id.slice(-8)}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {format(new Date(invoice.created), 'dd MMMM yyyy')}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getInvoiceStatusColor(invoice.status) + '20' }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: getInvoiceStatusColor(invoice.status) }}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                    {(invoice.amountPaid / 100).toFixed(2)}$
                  </Text>
                  {invoice.pdfUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(invoice.pdfUrl!)}
                      className="flex-row items-center"
                    >
                      <IconSymbol name="arrow.down.circle" size={20} color={colors.primary} />
                      <Text className="ml-1 font-semibold" style={{ color: colors.primary }}>
                        Télécharger PDF
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-surface rounded-xl p-6 items-center">
              <IconSymbol name="doc.text" size={48} color={colors.muted} />
              <Text className="mt-2" style={{ color: colors.muted }}>
                Aucune facture disponible
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
