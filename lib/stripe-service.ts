/**
 * Stripe Service - Gestion des paiements et abonnements
 * 
 * Modèle de tarification FleetCore:
 * 1. Pay-per-vehicle: 15$/mois (1-10), 12$/mois (11-30), 10$/mois (31-60), forfait 500$/mois (60+)
 * 2. Pay-per-employee: 25$/mois (1-5), 20$/mois (6-15), forfait 250$/mois (15+)
 * 3. Pay-per-feature: Métriques avancées (50$/mois), Export PDF premium (30$/mois), Sync cloud (40$/mois)
 * 4. Forfaits grandes flottes: Custom pricing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface StripePricing {
  vehicles: {
    tier1: { min: number; max: number; price: number }; // 1-10: 15$/mois
    tier2: { min: number; max: number; price: number }; // 11-30: 12$/mois
    tier3: { min: number; max: number; price: number }; // 31-60: 10$/mois
    enterprise: { min: number; price: number }; // 60+: 500$/mois forfait
  };
  employees: {
    tier1: { min: number; max: number; price: number }; // 1-5: 25$/mois
    tier2: { min: number; max: number; price: number }; // 6-15: 20$/mois
    enterprise: { min: number; price: number }; // 15+: 250$/mois forfait
  };
  features: {
    advancedMetrics: number; // 50$/mois
    premiumPdfExport: number; // 30$/mois
    cloudSync: number; // 40$/mois
  };
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  vehicleCount: number;
  employeeCount: number;
  enabledFeatures: string[];
  totalAmount: number; // en cents
  currency: string;
}

export interface UsageReport {
  vehicleCount: number;
  employeeCount: number;
  inspectionsCount: number;
  timestamp: string;
}

// Pricing configuration
export const STRIPE_PRICING: StripePricing = {
  vehicles: {
    tier1: { min: 1, max: 10, price: 15 },
    tier2: { min: 11, max: 30, price: 12 },
    tier3: { min: 31, max: 60, price: 10 },
    enterprise: { min: 61, price: 500 }, // forfait
  },
  employees: {
    tier1: { min: 1, max: 5, price: 25 },
    tier2: { min: 6, max: 15, price: 20 },
    enterprise: { min: 16, price: 250 }, // forfait
  },
  features: {
    advancedMetrics: 50,
    premiumPdfExport: 30,
    cloudSync: 40,
  },
};

// Product IDs (à créer dans Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  vehicles: 'prod_vehicles',
  employees: 'prod_employees',
  advancedMetrics: 'prod_advanced_metrics',
  premiumPdfExport: 'prod_premium_pdf',
  cloudSync: 'prod_cloud_sync',
};

/**
 * Calculate monthly price based on vehicle count
 */
export function calculateVehiclePrice(count: number): number {
  if (count <= 0) return 0;
  
  const { tier1, tier2, tier3, enterprise } = STRIPE_PRICING.vehicles;
  
  if (count >= enterprise.min) {
    return enterprise.price; // Forfait grande flotte
  }
  
  if (count >= tier3.min && count <= tier3.max) {
    return count * tier3.price;
  }
  
  if (count >= tier2.min && count <= tier2.max) {
    return count * tier2.price;
  }
  
  if (count >= tier1.min && count <= tier1.max) {
    return count * tier1.price;
  }
  
  return 0;
}

/**
 * Calculate monthly price based on employee count
 */
export function calculateEmployeePrice(count: number): number {
  if (count <= 0) return 0;
  
  const { tier1, tier2, enterprise } = STRIPE_PRICING.employees;
  
  if (count >= enterprise.min) {
    return enterprise.price; // Forfait grande équipe
  }
  
  if (count >= tier2.min && count <= tier2.max) {
    return count * tier2.price;
  }
  
  if (count >= tier1.min && count <= tier1.max) {
    return count * tier1.price;
  }
  
  return 0;
}

/**
 * Calculate total monthly price
 */
export function calculateTotalPrice(
  vehicleCount: number,
  employeeCount: number,
  enabledFeatures: string[] = []
): { subtotal: number; features: number; total: number; breakdown: any } {
  const vehiclePrice = calculateVehiclePrice(vehicleCount);
  const employeePrice = calculateEmployeePrice(employeeCount);
  
  let featuresPrice = 0;
  const featuresBreakdown: any = {};
  
  enabledFeatures.forEach((feature) => {
    if (feature === 'advancedMetrics') {
      featuresPrice += STRIPE_PRICING.features.advancedMetrics;
      featuresBreakdown.advancedMetrics = STRIPE_PRICING.features.advancedMetrics;
    } else if (feature === 'premiumPdfExport') {
      featuresPrice += STRIPE_PRICING.features.premiumPdfExport;
      featuresBreakdown.premiumPdfExport = STRIPE_PRICING.features.premiumPdfExport;
    } else if (feature === 'cloudSync') {
      featuresPrice += STRIPE_PRICING.features.cloudSync;
      featuresBreakdown.cloudSync = STRIPE_PRICING.features.cloudSync;
    }
  });
  
  const subtotal = vehiclePrice + employeePrice;
  const total = subtotal + featuresPrice;
  
  return {
    subtotal,
    features: featuresPrice,
    total,
    breakdown: {
      vehicles: { count: vehicleCount, price: vehiclePrice },
      employees: { count: employeeCount, price: employeePrice },
      features: featuresBreakdown,
    },
  };
}

/**
 * Get current subscription from local storage
 */
export async function getStripeSubscription(): Promise<StripeSubscription | null> {
  try {
    const data = await AsyncStorage.getItem('stripe_subscription');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting Stripe subscription:', error);
    return null;
  }
}

/**
 * Save subscription to local storage
 */
export async function saveStripeSubscription(subscription: StripeSubscription): Promise<void> {
  try {
    await AsyncStorage.setItem('stripe_subscription', JSON.stringify(subscription));
  } catch (error) {
    console.error('Error saving Stripe subscription:', error);
  }
}

/**
 * Report usage to Stripe (metered billing)
 * This should be called monthly or when usage changes
 */
export async function reportUsageToStripe(usage: UsageReport): Promise<void> {
  try {
    // TODO: Call backend API to report usage to Stripe
    // POST /api/stripe/report-usage
    console.log('Reporting usage to Stripe:', usage);
    
    // For now, just save locally
    await AsyncStorage.setItem('last_usage_report', JSON.stringify(usage));
  } catch (error) {
    console.error('Error reporting usage to Stripe:', error);
  }
}

/**
 * Get pricing tier name for display
 */
export function getVehicleTierName(count: number): string {
  if (count >= 61) return 'Grande flotte (forfait)';
  if (count >= 31) return 'Flotte moyenne (31-60)';
  if (count >= 11) return 'Petite flotte (11-30)';
  if (count >= 1) return 'Micro flotte (1-10)';
  return 'Aucun véhicule';
}

export function getEmployeeTierName(count: number): string {
  if (count >= 16) return 'Grande équipe (forfait)';
  if (count >= 6) return 'Équipe moyenne (6-15)';
  if (count >= 1) return 'Petite équipe (1-5)';
  return 'Aucun employé';
}

/**
 * Check if user qualifies for enterprise pricing
 */
export function qualifiesForEnterprise(vehicleCount: number, employeeCount: number): boolean {
  return vehicleCount >= 61 || employeeCount >= 16;
}

/**
 * Get recommended plan based on usage
 */
export function getRecommendedPlan(
  vehicleCount: number,
  employeeCount: number
): { name: string; description: string; price: number } {
  if (qualifiesForEnterprise(vehicleCount, employeeCount)) {
    return {
      name: 'Enterprise',
      description: 'Forfait personnalisé pour grandes flottes',
      price: calculateTotalPrice(vehicleCount, employeeCount, ['advancedMetrics', 'premiumPdfExport', 'cloudSync']).total,
    };
  }
  
  if (vehicleCount >= 11 || employeeCount >= 6) {
    return {
      name: 'Pro',
      description: 'Pour flottes en croissance',
      price: calculateTotalPrice(vehicleCount, employeeCount, ['cloudSync']).total,
    };
  }
  
  return {
    name: 'Starter',
    description: 'Pour petites flottes',
    price: calculateTotalPrice(vehicleCount, employeeCount).total,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get trial end date (14 days from now)
 */
export function getTrialEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

/**
 * Check if subscription is in trial period
 */
export function isInTrialPeriod(subscription: StripeSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'trialing';
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: StripeSubscription | null): number {
  if (!subscription || subscription.status !== 'trialing') return 0;
  
  const endDate = new Date(subscription.currentPeriodEnd);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, days);
}
