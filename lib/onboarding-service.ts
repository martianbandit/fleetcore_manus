/**
 * Service de gestion du tutoriel de première utilisation (Onboarding)
 * Gère l'état du tutoriel, les étapes et la progression
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'fleetcore_onboarding_completed',
  ONBOARDING_STEP: 'fleetcore_onboarding_step',
  DASHBOARD_TOUR_COMPLETED: 'fleetcore_dashboard_tour_completed',
  FIRST_VEHICLE_ADDED: 'fleetcore_first_vehicle_added',
  FIRST_INSPECTION_DONE: 'fleetcore_first_inspection_done',
};

// Types d'étapes d'onboarding
export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features?: string[];
};

export type TooltipStep = {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
};

export type OnboardingState = {
  welcomeSlidesCompleted: boolean;
  dashboardTourCompleted: boolean;
  currentStep: number;
  firstVehicleAdded: boolean;
  firstInspectionDone: boolean;
};

// Slides de bienvenue
export const WELCOME_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans FleetCore',
    description: 'Votre solution complète de gestion de flotte conforme aux exigences de la SAAQ.',
    icon: 'truck',
    color: '#00D4FF',
    features: [
      'Gestion de véhicules lourds',
      'Inspections conformes SAAQ',
      'Suivi en temps réel',
    ],
  },
  {
    id: 'fleet',
    title: 'Gérez votre flotte',
    description: 'Ajoutez vos véhicules, suivez leur état et gérez les documents importants.',
    icon: 'car',
    color: '#10B981',
    features: [
      'Fiches véhicules détaillées',
      'Documents et photos',
      'Historique de maintenance',
    ],
  },
  {
    id: 'inspections',
    title: 'Inspections & Conformité',
    description: 'Réalisez des rondes de sécurité et des fiches PEP conformes à la réglementation SAAQ.',
    icon: 'clipboard-check',
    color: '#F59E0B',
    features: [
      'Ronde de sécurité en 8 sections',
      'Fiches PEP SAAQ (formulaire 6609-30)',
      'Documentation des défauts avec photos',
    ],
  },
  {
    id: 'modules',
    title: 'Modules avancés',
    description: 'FleetCommand pour les bons de travail et FleetCrew pour la gestion de l\'inventaire.',
    icon: 'tools',
    color: '#8B5CF6',
    features: [
      'Bons de travail avec chronomètre',
      'Gestion du stock de pièces',
      'Affectation des techniciens',
    ],
  },
  {
    id: 'reminders',
    title: 'Rappels & Notifications',
    description: 'Ne manquez plus aucune échéance grâce aux rappels automatiques et notifications push.',
    icon: 'bell',
    color: '#EF4444',
    features: [
      'Rappels d\'inspection',
      'Alertes d\'expiration',
      'Synchronisation Google Calendar',
    ],
  },
];

// Étapes du tour du Dashboard
export const DASHBOARD_TOUR_STEPS: TooltipStep[] = [
  {
    id: 'kpi-vehicles',
    target: 'kpi-vehicles',
    title: 'Vos véhicules',
    description: 'Voyez d\'un coup d\'œil le nombre de véhicules actifs dans votre flotte.',
    position: 'bottom',
    order: 1,
  },
  {
    id: 'kpi-inspections',
    target: 'kpi-inspections',
    title: 'Inspections du jour',
    description: 'Suivez les inspections réalisées aujourd\'hui et leur statut.',
    position: 'bottom',
    order: 2,
  },
  {
    id: 'kpi-defects',
    target: 'kpi-defects',
    title: 'Défauts actifs',
    description: 'Identifiez rapidement les défauts majeurs nécessitant une attention immédiate.',
    position: 'bottom',
    order: 3,
  },
  {
    id: 'quick-actions',
    target: 'quick-actions',
    title: 'Actions rapides',
    description: 'Accédez aux fonctionnalités principales en un seul tap.',
    position: 'top',
    order: 4,
  },
  {
    id: 'modules',
    target: 'modules-section',
    title: 'Modules connexes',
    description: 'Explorez FleetCommand, FleetCrew et les autres modules avancés.',
    position: 'top',
    order: 5,
  },
];

// Vérifier si l'onboarding est complété
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch {
    return false;
  }
}

// Marquer l'onboarding comme complété
export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'état onboarding:', error);
  }
}

// Vérifier si les slides de bienvenue sont complétées
export async function areWelcomeSlidesCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch {
    return false;
  }
}

// Marquer les slides de bienvenue comme complétées
export async function completeWelcomeSlides(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
}

// Vérifier si le tour du Dashboard est complété
export async function isDashboardTourCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED);
    return value === 'true';
  } catch {
    return false;
  }
}

// Marquer le tour du Dashboard comme complété
export async function completeDashboardTour(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED, 'true');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
}

// Obtenir l'étape actuelle du tour
export async function getCurrentTourStep(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
    return value ? parseInt(value, 10) : 0;
  } catch {
    return 0;
  }
}

// Sauvegarder l'étape actuelle du tour
export async function setCurrentTourStep(step: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString());
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'étape:', error);
  }
}

// Marquer le premier véhicule comme ajouté
export async function markFirstVehicleAdded(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_VEHICLE_ADDED, 'true');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Vérifier si le premier véhicule a été ajouté
export async function isFirstVehicleAdded(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_VEHICLE_ADDED);
    return value === 'true';
  } catch {
    return false;
  }
}

// Marquer la première inspection comme faite
export async function markFirstInspectionDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_INSPECTION_DONE, 'true');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Vérifier si la première inspection a été faite
export async function isFirstInspectionDone(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_INSPECTION_DONE);
    return value === 'true';
  } catch {
    return false;
  }
}

// Obtenir l'état complet de l'onboarding
export async function getOnboardingState(): Promise<OnboardingState> {
  try {
    const [welcomeCompleted, dashboardCompleted, step, vehicleAdded, inspectionDone] = await Promise.all([
      isOnboardingCompleted(),
      isDashboardTourCompleted(),
      getCurrentTourStep(),
      isFirstVehicleAdded(),
      isFirstInspectionDone(),
    ]);

    return {
      welcomeSlidesCompleted: welcomeCompleted,
      dashboardTourCompleted: dashboardCompleted,
      currentStep: step,
      firstVehicleAdded: vehicleAdded,
      firstInspectionDone: inspectionDone,
    };
  } catch {
    return {
      welcomeSlidesCompleted: false,
      dashboardTourCompleted: false,
      currentStep: 0,
      firstVehicleAdded: false,
      firstInspectionDone: false,
    };
  }
}

// Réinitialiser l'onboarding (pour revoir le tutoriel)
export async function resetOnboarding(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
      AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_STEP),
      AsyncStorage.removeItem(STORAGE_KEYS.DASHBOARD_TOUR_COMPLETED),
    ]);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
  }
}

// Calculer le pourcentage de progression de l'onboarding
export async function getOnboardingProgress(): Promise<number> {
  const state = await getOnboardingState();
  let progress = 0;
  
  if (state.welcomeSlidesCompleted) progress += 40;
  if (state.dashboardTourCompleted) progress += 30;
  if (state.firstVehicleAdded) progress += 15;
  if (state.firstInspectionDone) progress += 15;
  
  return progress;
}

// Messages d'encouragement selon la progression
export function getProgressMessage(progress: number): string {
  if (progress === 0) return 'Commencez votre découverte de FleetCore !';
  if (progress < 40) return 'Continuez le tutoriel pour découvrir toutes les fonctionnalités.';
  if (progress < 70) return 'Excellent ! Explorez maintenant le Dashboard.';
  if (progress < 100) return 'Presque terminé ! Ajoutez votre premier véhicule.';
  return 'Félicitations ! Vous maîtrisez FleetCore !';
}

// Obtenir la prochaine action suggérée
export async function getNextSuggestedAction(): Promise<{
  action: string;
  route: string;
  description: string;
} | null> {
  const state = await getOnboardingState();

  if (!state.welcomeSlidesCompleted) {
    return {
      action: 'Découvrir FleetCore',
      route: '/onboarding',
      description: 'Commencez par le tutoriel de bienvenue',
    };
  }

  if (!state.dashboardTourCompleted) {
    return {
      action: 'Explorer le Dashboard',
      route: '/',
      description: 'Suivez le guide interactif du tableau de bord',
    };
  }

  if (!state.firstVehicleAdded) {
    return {
      action: 'Ajouter un véhicule',
      route: '/vehicle/add',
      description: 'Ajoutez votre premier véhicule à la flotte',
    };
  }

  if (!state.firstInspectionDone) {
    return {
      action: 'Faire une inspection',
      route: '/inspection/new',
      description: 'Réalisez votre première ronde de sécurité',
    };
  }

  return null;
}
