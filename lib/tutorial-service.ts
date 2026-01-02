/**
 * Service de tutoriel interactif
 * Guide les nouveaux utilisateurs à travers les fonctionnalités de l'application
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés de stockage
const TUTORIAL_STATE_KEY = '@fleetcore_tutorial_state';
const TUTORIAL_COMPLETED_KEY = '@fleetcore_tutorial_completed';

/**
 * Étape du tutoriel
 */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  screen: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'center';
  action?: 'tap' | 'swipe' | 'scroll' | 'input';
  actionLabel?: string;
  order: number;
  completed: boolean;
}

/**
 * Parcours de tutoriel
 */
export interface TutorialPath {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  estimatedMinutes: number;
  icon: string;
}

/**
 * État du tutoriel
 */
export interface TutorialState {
  currentPathId: string | null;
  currentStepIndex: number;
  completedPaths: string[];
  completedSteps: string[];
  skippedPaths: string[];
  startedAt: string | null;
  lastActivityAt: string | null;
}

// Parcours de tutoriel prédéfinis
export const TUTORIAL_PATHS: TutorialPath[] = [
  {
    id: 'getting_started',
    name: 'Premiers pas',
    description: 'Découvrez les fonctionnalités de base de FleetCore',
    estimatedMinutes: 3,
    icon: 'rocket',
    steps: [
      {
        id: 'welcome',
        title: 'Bienvenue dans FleetCore',
        description: 'FleetCore vous aide à gérer les inspections de votre flotte de véhicules lourds conformément aux normes SAAQ.',
        screen: 'index',
        position: 'center',
        order: 1,
        completed: false,
      },
      {
        id: 'dashboard_overview',
        title: 'Tableau de bord',
        description: 'Voici votre tableau de bord. Il affiche un aperçu de l\'état de votre flotte : véhicules, inspections et défauts.',
        screen: 'index',
        targetElement: 'stats-section',
        position: 'bottom',
        order: 2,
        completed: false,
      },
      {
        id: 'compliance_score',
        title: 'Score de conformité',
        description: 'Ce score indique le pourcentage de véhicules conformes aux normes SAAQ. Visez 100% !',
        screen: 'index',
        targetElement: 'compliance-ring',
        position: 'bottom',
        order: 3,
        completed: false,
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Utilisez la barre de navigation en bas pour accéder aux différentes sections : Véhicules, Inspections et Paramètres.',
        screen: 'index',
        targetElement: 'tab-bar',
        position: 'top',
        order: 4,
        completed: false,
      },
    ],
  },
  {
    id: 'add_vehicle',
    name: 'Ajouter un véhicule',
    description: 'Apprenez à ajouter votre premier véhicule',
    estimatedMinutes: 2,
    icon: 'truck',
    steps: [
      {
        id: 'go_to_vehicles',
        title: 'Accéder aux véhicules',
        description: 'Appuyez sur l\'onglet "Véhicules" pour voir la liste de vos véhicules.',
        screen: 'index',
        targetElement: 'tab-vehicles',
        position: 'top',
        action: 'tap',
        actionLabel: 'Appuyer sur Véhicules',
        order: 1,
        completed: false,
      },
      {
        id: 'add_vehicle_button',
        title: 'Ajouter un véhicule',
        description: 'Appuyez sur le bouton "+" pour ajouter un nouveau véhicule à votre flotte.',
        screen: 'vehicles',
        targetElement: 'add-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Appuyer sur +',
        order: 2,
        completed: false,
      },
      {
        id: 'fill_vehicle_info',
        title: 'Informations du véhicule',
        description: 'Remplissez les informations obligatoires : numéro d\'unité, plaque d\'immatriculation, NIV, marque et modèle.',
        screen: 'add-vehicle',
        position: 'center',
        action: 'input',
        actionLabel: 'Remplir le formulaire',
        order: 3,
        completed: false,
      },
      {
        id: 'save_vehicle',
        title: 'Enregistrer',
        description: 'Appuyez sur "Enregistrer" pour sauvegarder le véhicule.',
        screen: 'add-vehicle',
        targetElement: 'save-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Appuyer sur Enregistrer',
        order: 4,
        completed: false,
      },
    ],
  },
  {
    id: 'first_inspection',
    name: 'Première inspection',
    description: 'Effectuez votre première inspection complète',
    estimatedMinutes: 5,
    icon: 'clipboard-check',
    steps: [
      {
        id: 'go_to_inspections',
        title: 'Accéder aux inspections',
        description: 'Appuyez sur l\'onglet "Inspections" pour voir la liste des inspections.',
        screen: 'index',
        targetElement: 'tab-inspections',
        position: 'top',
        action: 'tap',
        actionLabel: 'Appuyer sur Inspections',
        order: 1,
        completed: false,
      },
      {
        id: 'new_inspection',
        title: 'Nouvelle inspection',
        description: 'Appuyez sur "Nouvelle inspection" pour démarrer une inspection.',
        screen: 'inspections',
        targetElement: 'new-inspection-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Appuyer sur Nouvelle inspection',
        order: 2,
        completed: false,
      },
      {
        id: 'select_vehicle',
        title: 'Sélectionner un véhicule',
        description: 'Choisissez le véhicule à inspecter dans la liste.',
        screen: 'new-inspection',
        position: 'center',
        action: 'tap',
        actionLabel: 'Sélectionner un véhicule',
        order: 3,
        completed: false,
      },
      {
        id: 'select_type',
        title: 'Type d\'inspection',
        description: 'Sélectionnez le type d\'inspection : Périodique, Pré-départ ou Post-trajet.',
        screen: 'new-inspection',
        position: 'center',
        action: 'tap',
        actionLabel: 'Sélectionner le type',
        order: 4,
        completed: false,
      },
      {
        id: 'start_checklist',
        title: 'Démarrer la checklist',
        description: 'Appuyez sur "Démarrer l\'inspection" pour commencer la checklist SAAQ.',
        screen: 'new-inspection',
        targetElement: 'start-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Démarrer',
        order: 5,
        completed: false,
      },
      {
        id: 'complete_items',
        title: 'Compléter les items',
        description: 'Pour chaque item, indiquez s\'il est conforme (✓) ou s\'il présente un défaut (✗). Ajoutez des photos si nécessaire.',
        screen: 'checklist',
        position: 'center',
        order: 6,
        completed: false,
      },
      {
        id: 'finish_inspection',
        title: 'Terminer l\'inspection',
        description: 'Une fois tous les items vérifiés, appuyez sur "Terminer" pour finaliser l\'inspection.',
        screen: 'checklist',
        targetElement: 'finish-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Terminer',
        order: 7,
        completed: false,
      },
    ],
  },
  {
    id: 'reports',
    name: 'Rapports et exports',
    description: 'Générez des rapports PDF et consultez les statistiques',
    estimatedMinutes: 2,
    icon: 'file-text',
    steps: [
      {
        id: 'view_inspection',
        title: 'Voir une inspection',
        description: 'Appuyez sur une inspection complétée pour voir ses détails.',
        screen: 'inspections',
        position: 'center',
        action: 'tap',
        actionLabel: 'Sélectionner une inspection',
        order: 1,
        completed: false,
      },
      {
        id: 'generate_pdf',
        title: 'Générer le PDF',
        description: 'Appuyez sur "Générer le rapport PDF" pour créer un rapport conforme SAAQ.',
        screen: 'inspection-detail',
        targetElement: 'pdf-button',
        position: 'top',
        action: 'tap',
        actionLabel: 'Générer PDF',
        order: 2,
        completed: false,
      },
      {
        id: 'view_reports',
        title: 'Consulter les rapports',
        description: 'Accédez à l\'écran Rapports depuis les paramètres pour voir les statistiques de votre flotte.',
        screen: 'settings',
        position: 'center',
        order: 3,
        completed: false,
      },
    ],
  },
];

/**
 * Obtenir l'état initial du tutoriel
 */
function getInitialState(): TutorialState {
  return {
    currentPathId: null,
    currentStepIndex: 0,
    completedPaths: [],
    completedSteps: [],
    skippedPaths: [],
    startedAt: null,
    lastActivityAt: null,
  };
}

/**
 * Charger l'état du tutoriel
 */
export async function loadTutorialState(): Promise<TutorialState> {
  try {
    const stateJson = await AsyncStorage.getItem(TUTORIAL_STATE_KEY);
    if (stateJson) {
      return JSON.parse(stateJson);
    }
    return getInitialState();
  } catch {
    return getInitialState();
  }
}

/**
 * Sauvegarder l'état du tutoriel
 */
export async function saveTutorialState(state: TutorialState): Promise<void> {
  try {
    await AsyncStorage.setItem(TUTORIAL_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'état du tutoriel:', error);
  }
}

/**
 * Démarrer un parcours de tutoriel
 */
export async function startTutorialPath(pathId: string): Promise<TutorialState> {
  const state = await loadTutorialState();
  
  state.currentPathId = pathId;
  state.currentStepIndex = 0;
  state.startedAt = new Date().toISOString();
  state.lastActivityAt = new Date().toISOString();
  
  await saveTutorialState(state);
  return state;
}

/**
 * Passer à l'étape suivante
 */
export async function nextTutorialStep(): Promise<TutorialState> {
  const state = await loadTutorialState();
  
  if (!state.currentPathId) {
    return state;
  }
  
  const path = TUTORIAL_PATHS.find(p => p.id === state.currentPathId);
  if (!path) {
    return state;
  }
  
  // Marquer l'étape actuelle comme complétée
  const currentStep = path.steps[state.currentStepIndex];
  if (currentStep && !state.completedSteps.includes(currentStep.id)) {
    state.completedSteps.push(currentStep.id);
  }
  
  // Passer à l'étape suivante
  if (state.currentStepIndex < path.steps.length - 1) {
    state.currentStepIndex++;
  } else {
    // Parcours terminé
    if (!state.completedPaths.includes(state.currentPathId)) {
      state.completedPaths.push(state.currentPathId);
    }
    state.currentPathId = null;
    state.currentStepIndex = 0;
  }
  
  state.lastActivityAt = new Date().toISOString();
  await saveTutorialState(state);
  return state;
}

/**
 * Passer à l'étape précédente
 */
export async function previousTutorialStep(): Promise<TutorialState> {
  const state = await loadTutorialState();
  
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    state.lastActivityAt = new Date().toISOString();
    await saveTutorialState(state);
  }
  
  return state;
}

/**
 * Ignorer le parcours actuel
 */
export async function skipTutorialPath(): Promise<TutorialState> {
  const state = await loadTutorialState();
  
  if (state.currentPathId && !state.skippedPaths.includes(state.currentPathId)) {
    state.skippedPaths.push(state.currentPathId);
  }
  
  state.currentPathId = null;
  state.currentStepIndex = 0;
  state.lastActivityAt = new Date().toISOString();
  
  await saveTutorialState(state);
  return state;
}

/**
 * Obtenir l'étape actuelle
 */
export async function getCurrentStep(): Promise<TutorialStep | null> {
  const state = await loadTutorialState();
  
  if (!state.currentPathId) {
    return null;
  }
  
  const path = TUTORIAL_PATHS.find(p => p.id === state.currentPathId);
  if (!path || state.currentStepIndex >= path.steps.length) {
    return null;
  }
  
  return path.steps[state.currentStepIndex];
}

/**
 * Obtenir le parcours actuel
 */
export async function getCurrentPath(): Promise<TutorialPath | null> {
  const state = await loadTutorialState();
  
  if (!state.currentPathId) {
    return null;
  }
  
  return TUTORIAL_PATHS.find(p => p.id === state.currentPathId) || null;
}

/**
 * Vérifier si le tutoriel a été complété
 */
export async function isTutorialCompleted(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
    return completed === 'true';
  } catch {
    return false;
  }
}

/**
 * Marquer le tutoriel comme complété
 */
export async function markTutorialCompleted(): Promise<void> {
  await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
}

/**
 * Réinitialiser le tutoriel
 */
export async function resetTutorial(): Promise<void> {
  await AsyncStorage.multiRemove([TUTORIAL_STATE_KEY, TUTORIAL_COMPLETED_KEY]);
}

/**
 * Obtenir la progression globale du tutoriel
 */
export async function getTutorialProgress(): Promise<{
  totalPaths: number;
  completedPaths: number;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
}> {
  const state = await loadTutorialState();
  
  const totalPaths = TUTORIAL_PATHS.length;
  const completedPaths = state.completedPaths.length;
  
  const totalSteps = TUTORIAL_PATHS.reduce((sum, path) => sum + path.steps.length, 0);
  const completedSteps = state.completedSteps.length;
  
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  return {
    totalPaths,
    completedPaths,
    totalSteps,
    completedSteps,
    progressPercent,
  };
}

/**
 * Obtenir les parcours disponibles avec leur statut
 */
export async function getAvailablePaths(): Promise<Array<TutorialPath & { status: 'available' | 'in_progress' | 'completed' | 'skipped' }>> {
  const state = await loadTutorialState();
  
  return TUTORIAL_PATHS.map(path => {
    let status: 'available' | 'in_progress' | 'completed' | 'skipped' = 'available';
    
    if (state.completedPaths.includes(path.id)) {
      status = 'completed';
    } else if (state.skippedPaths.includes(path.id)) {
      status = 'skipped';
    } else if (state.currentPathId === path.id) {
      status = 'in_progress';
    }
    
    return { ...path, status };
  });
}
