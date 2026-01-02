/**
 * Hook pour gérer l'abonnement utilisateur
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'enterprise';

export interface Subscription {
  plan: SubscriptionPlan;
  expiresAt: string | null;
  features: string[];
}

const SUBSCRIPTION_KEY = 'fleetcore_subscription';

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  free: [
    'Gestion de 5 véhicules',
    'Inspections de base',
    'Rappels manuels',
  ],
  plus: [
    'Gestion de 25 véhicules',
    'Inspections complètes',
    'Fiche PEP SAAQ',
    'Rappels automatiques',
    'Export PDF',
  ],
  pro: [
    'Gestion de 100 véhicules',
    'Toutes les fonctionnalités Plus',
    'FleetCommand (bons de travail)',
    'FleetCrew (inventaire)',
    'Analytics avancés',
    'Support prioritaire',
  ],
  enterprise: [
    'Véhicules illimités',
    'Toutes les fonctionnalités Pro',
    'Multi-sites',
    'API personnalisée',
    'Formation dédiée',
    'Support 24/7',
  ],
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (data) {
        setSubscription(JSON.parse(data));
      } else {
        // Plan gratuit par défaut
        const defaultSub: Subscription = {
          plan: 'free',
          expiresAt: null,
          features: PLAN_FEATURES.free,
        };
        setSubscription(defaultSub);
        await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(defaultSub));
      }
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (plan: SubscriptionPlan) => {
    const newSub: Subscription = {
      plan,
      expiresAt: plan === 'free' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features: PLAN_FEATURES[plan],
    };
    setSubscription(newSub);
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSub));
  };

  const isPremium = subscription?.plan !== 'free';
  
  const canAccessFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    const premiumFeatures = [
      'pep',
      'fleetcommand',
      'fleetcrew',
      'analytics',
      'export_pdf',
      'auto_reminders',
    ];
    
    if (premiumFeatures.includes(feature.toLowerCase())) {
      return subscription.plan !== 'free';
    }
    
    return true;
  };

  return {
    subscription,
    loading,
    isPremium,
    updatePlan,
    canAccessFeature,
    planFeatures: PLAN_FEATURES,
  };
}

export { PLAN_FEATURES };
