import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPANY_KEY = '@fleetcore/company';
const ONBOARDING_KEY = '@fleetcore/onboarding_completed';

// ============================================================================
// Types
// ============================================================================

export type CompanySize = '1-5' | '6-20' | '21-50' | '51-200' | '200+';
export type FleetType = 'heavy_trucks' | 'semi_trailers' | 'buses' | 'mixed' | 'other';

export interface CompanyProfile {
  id: string;
  name: string;
  logo?: string;
  size: CompanySize;
  estimatedVehicles: number;
  fleetType: FleetType;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export const companySizeLabels: Record<CompanySize, string> = {
  '1-5': '1-5 employés',
  '6-20': '6-20 employés',
  '21-50': '21-50 employés',
  '51-200': '51-200 employés',
  '200+': 'Plus de 200 employés',
};

export const fleetTypeLabels: Record<FleetType, string> = {
  heavy_trucks: 'Camions lourds',
  semi_trailers: 'Semi-remorques',
  buses: 'Autobus',
  mixed: 'Flotte mixte',
  other: 'Autre',
};

// ============================================================================
// Company Profile Operations
// ============================================================================

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const data = await AsyncStorage.getItem(COMPANY_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading company profile:', error);
    return null;
  }
}

export async function createCompanyProfile(
  profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CompanyProfile> {
  const newProfile: CompanyProfile = {
    ...profile,
    id: `company-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(COMPANY_KEY, JSON.stringify(newProfile));
  return newProfile;
}

export async function updateCompanyProfile(
  updates: Partial<Omit<CompanyProfile, 'id' | 'createdAt'>>
): Promise<CompanyProfile | null> {
  try {
    const current = await getCompanyProfile();
    if (!current) return null;

    const updated: CompanyProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(COMPANY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating company profile:', error);
    return null;
  }
}

// ============================================================================
// Onboarding Status
// ============================================================================

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean = true): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, completed.toString());
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    await AsyncStorage.removeItem(COMPANY_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}
