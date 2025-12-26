import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVehicles, getInspections } from './data-service';

const SUBSCRIPTION_KEY = '@fleetcore/subscription';

// ============================================================================
// Types
// ============================================================================

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  maxVehicles: number;
  maxInspectionsPerMonth: number;
  cloudSync: boolean;
  advancedMetrics: boolean;
  pdfExport: boolean;
  documentManagement: boolean;
  multiUser: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  plan: PlanType;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  limits: PlanLimits;
}

export interface UsageStats {
  vehiclesCount: number;
  inspectionsThisMonth: number;
  percentVehicles: number;
  percentInspections: number;
}

// ============================================================================
// Plan Definitions
// ============================================================================

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxVehicles: 3,
    maxInspectionsPerMonth: 10,
    cloudSync: false,
    advancedMetrics: false,
    pdfExport: false,
    documentManagement: false,
    multiUser: false,
    prioritySupport: false,
  },
  pro: {
    maxVehicles: 25,
    maxInspectionsPerMonth: 999999, // Unlimited
    cloudSync: true,
    advancedMetrics: true,
    pdfExport: true,
    documentManagement: true,
    multiUser: false,
    prioritySupport: false,
  },
  enterprise: {
    maxVehicles: 999999, // Unlimited
    maxInspectionsPerMonth: 999999, // Unlimited
    cloudSync: true,
    advancedMetrics: true,
    pdfExport: true,
    documentManagement: true,
    multiUser: true,
    prioritySupport: true,
  },
};

export const PLAN_PRICES: Record<PlanType, { monthly: number; yearly: number; currency: string }> = {
  free: { monthly: 0, yearly: 0, currency: 'CAD' },
  pro: { monthly: 49, yearly: 490, currency: 'CAD' },
  enterprise: { monthly: 199, yearly: 1990, currency: 'CAD' },
};

export const PLAN_NAMES: Record<PlanType, string> = {
  free: 'Gratuit',
  pro: 'Professionnel',
  enterprise: 'Entreprise',
};

export const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  free: 'Pour essayer FleetCore',
  pro: 'Pour les petites et moyennes flottes',
  enterprise: 'Pour les grandes flottes',
};

// ============================================================================
// Subscription Operations
// ============================================================================

export async function getSubscription(): Promise<Subscription> {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading subscription:', error);
  }

  // Default to free plan
  const defaultSubscription: Subscription = {
    plan: 'free',
    startDate: new Date().toISOString(),
    autoRenew: false,
    limits: PLAN_LIMITS.free,
  };
  
  await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(defaultSubscription));
  return defaultSubscription;
}

export async function updateSubscription(plan: PlanType): Promise<Subscription> {
  const subscription: Subscription = {
    plan,
    startDate: new Date().toISOString(),
    endDate: plan === 'free' ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: plan !== 'free',
    limits: PLAN_LIMITS[plan],
  };

  await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  return subscription;
}

// ============================================================================
// Usage Tracking
// ============================================================================

export async function getUsageStats(): Promise<UsageStats> {
  const subscription = await getSubscription();
  const vehicles = await getVehicles();
  const inspections = await getInspections();

  // Count inspections this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const inspectionsThisMonth = inspections.filter(
    (i) => new Date(i.startedAt) >= firstDayOfMonth
  ).length;

  const vehiclesCount = vehicles.length;
  const maxVehicles = subscription.limits.maxVehicles;
  const maxInspections = subscription.limits.maxInspectionsPerMonth;

  return {
    vehiclesCount,
    inspectionsThisMonth,
    percentVehicles: maxVehicles === 999999 ? 0 : Math.round((vehiclesCount / maxVehicles) * 100),
    percentInspections: maxInspections === 999999 ? 0 : Math.round((inspectionsThisMonth / maxInspections) * 100),
  };
}

// ============================================================================
// Limit Checks
// ============================================================================

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}

export async function canAddVehicle(): Promise<LimitCheckResult> {
  const subscription = await getSubscription();
  const vehicles = await getVehicles();
  const currentCount = vehicles.length;
  const limit = subscription.limits.maxVehicles;

  if (limit === 999999) {
    return { allowed: true, currentCount, limit };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limit} véhicules pour le plan ${PLAN_NAMES[subscription.plan]}. Passez au plan supérieur pour ajouter plus de véhicules.`,
      currentCount,
      limit,
    };
  }

  return { allowed: true, currentCount, limit };
}

export async function canAddInspection(): Promise<LimitCheckResult> {
  const subscription = await getSubscription();
  const inspections = await getInspections();

  // Count inspections this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const inspectionsThisMonth = inspections.filter(
    (i) => new Date(i.startedAt) >= firstDayOfMonth
  );

  const currentCount = inspectionsThisMonth.length;
  const limit = subscription.limits.maxInspectionsPerMonth;

  if (limit === 999999) {
    return { allowed: true, currentCount, limit };
  }

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limit} inspections par mois pour le plan ${PLAN_NAMES[subscription.plan]}. Passez au plan supérieur pour des inspections illimitées.`,
      currentCount,
      limit,
    };
  }

  return { allowed: true, currentCount, limit };
}

export async function hasFeatureAccess(feature: keyof PlanLimits): Promise<boolean> {
  const subscription = await getSubscription();
  return subscription.limits[feature] as boolean;
}

// ============================================================================
// Plan Comparison
// ============================================================================

export interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export const PLAN_FEATURES: PlanFeature[] = [
  {
    name: 'Véhicules',
    free: '3',
    pro: '25',
    enterprise: 'Illimité',
  },
  {
    name: 'Inspections par mois',
    free: '10',
    pro: 'Illimité',
    enterprise: 'Illimité',
  },
  {
    name: 'Synchronisation cloud',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Métriques avancées',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Export PDF',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Gestion de documents',
    free: false,
    pro: true,
    enterprise: true,
  },
  {
    name: 'Multi-utilisateurs',
    free: false,
    pro: false,
    enterprise: true,
  },
  {
    name: 'Support prioritaire',
    free: false,
    pro: false,
    enterprise: true,
  },
];
