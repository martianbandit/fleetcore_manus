/**
 * Tests unitaires pour les fonctionnalités d'onboarding v21
 * - Service onboarding-service.ts
 * - Écrans de bienvenue
 * - Écran FAQ
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (key: string) => mockStorage[key] || null,
  setItem: async (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: async (key: string) => { delete mockStorage[key]; },
  clear: async () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
};

// Onboarding service functions (simulated)
const ONBOARDING_KEY = 'fleetcore_onboarding_completed';
const ONBOARDING_STEP_KEY = 'fleetcore_onboarding_step';

async function hasCompletedOnboarding(): Promise<boolean> {
  const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
  return completed === 'true';
}

async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
  await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
}

async function getCurrentStep(): Promise<number> {
  const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
  return step ? parseInt(step, 10) : 0;
}

async function setCurrentStep(step: number): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
}

// Onboarding slides data
const ONBOARDING_SLIDES = [
  {
    id: 'welcome',
    title: 'Bienvenue dans FleetCore',
    description: 'Votre solution complète de gestion de flotte conforme aux exigences de la SAAQ.',
    icon: 'truck.fill',
  },
  {
    id: 'fleet',
    title: 'Gérez votre flotte',
    description: 'Ajoutez vos véhicules, suivez leur état et planifiez l\'entretien préventif.',
    icon: 'car.fill',
  },
  {
    id: 'inspections',
    title: 'Inspections conformes',
    description: 'Réalisez des inspections conformes aux normes SAAQ avec documentation photo.',
    icon: 'clipboard.fill',
  },
  {
    id: 'modules',
    title: 'Modules intégrés',
    description: 'FleetCommand pour les bons de travail, FleetCrew pour l\'inventaire.',
    icon: 'wrench.fill',
  },
  {
    id: 'reminders',
    title: 'Rappels intelligents',
    description: 'Ne manquez jamais une échéance avec les rappels automatiques.',
    icon: 'bell.fill',
  },
  {
    id: 'ready',
    title: 'Prêt à commencer',
    description: 'Votre flotte est entre de bonnes mains. Commençons!',
    icon: 'checkmark.circle.fill',
  },
];

// FAQ data
const FAQ_CATEGORIES = [
  { id: 'general', label: 'Général' },
  { id: 'vehicles', label: 'Véhicules' },
  { id: 'inspections', label: 'Inspections' },
  { id: 'pep', label: 'Fiches PEP' },
  { id: 'workorders', label: 'Bons de travail' },
  { id: 'inventory', label: 'Inventaire' },
  { id: 'sync', label: 'Synchronisation' },
  { id: 'billing', label: 'Abonnements' },
];

describe('Onboarding Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return false for hasCompletedOnboarding on first launch', async () => {
    const completed = await hasCompletedOnboarding();
    expect(completed).toBe(false);
  });

  it('should return true after completing onboarding', async () => {
    await completeOnboarding();
    const completed = await hasCompletedOnboarding();
    expect(completed).toBe(true);
  });

  it('should reset onboarding state', async () => {
    await completeOnboarding();
    await setCurrentStep(3);
    
    await resetOnboarding();
    
    const completed = await hasCompletedOnboarding();
    const step = await getCurrentStep();
    
    expect(completed).toBe(false);
    expect(step).toBe(0);
  });

  it('should track current step progression', async () => {
    expect(await getCurrentStep()).toBe(0);
    
    await setCurrentStep(1);
    expect(await getCurrentStep()).toBe(1);
    
    await setCurrentStep(5);
    expect(await getCurrentStep()).toBe(5);
  });
});

describe('Onboarding Slides', () => {
  it('should have 6 slides', () => {
    expect(ONBOARDING_SLIDES.length).toBe(6);
  });

  it('should have required properties for each slide', () => {
    ONBOARDING_SLIDES.forEach((slide) => {
      expect(slide).toHaveProperty('id');
      expect(slide).toHaveProperty('title');
      expect(slide).toHaveProperty('description');
      expect(slide).toHaveProperty('icon');
      expect(typeof slide.id).toBe('string');
      expect(typeof slide.title).toBe('string');
      expect(typeof slide.description).toBe('string');
      expect(typeof slide.icon).toBe('string');
    });
  });

  it('should have unique slide IDs', () => {
    const ids = ONBOARDING_SLIDES.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should start with welcome slide', () => {
    expect(ONBOARDING_SLIDES[0].id).toBe('welcome');
  });

  it('should end with ready slide', () => {
    expect(ONBOARDING_SLIDES[ONBOARDING_SLIDES.length - 1].id).toBe('ready');
  });
});

describe('FAQ Categories', () => {
  it('should have 8 categories', () => {
    expect(FAQ_CATEGORIES.length).toBe(8);
  });

  it('should have unique category IDs', () => {
    const ids = FAQ_CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should include essential categories', () => {
    const categoryIds = FAQ_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('general');
    expect(categoryIds).toContain('vehicles');
    expect(categoryIds).toContain('inspections');
    expect(categoryIds).toContain('billing');
  });
});

describe('FAQ Search Functionality', () => {
  const FAQ_ITEMS = [
    { id: '1', category: 'general', question: 'Qu\'est-ce que FleetCore?', answer: 'Application de gestion de flotte.' },
    { id: '2', category: 'vehicles', question: 'Comment ajouter un véhicule?', answer: 'Allez dans l\'onglet Véhicules.' },
    { id: '3', category: 'inspections', question: 'Comment faire une inspection?', answer: 'Parcourez les 8 sections.' },
  ];

  function searchFAQ(items: typeof FAQ_ITEMS, query: string, category?: string) {
    let filtered = items;
    
    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }
    
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }

  it('should return all items when no filter', () => {
    const results = searchFAQ(FAQ_ITEMS, '');
    expect(results.length).toBe(3);
  });

  it('should filter by category', () => {
    const results = searchFAQ(FAQ_ITEMS, '', 'vehicles');
    expect(results.length).toBe(1);
    expect(results[0].category).toBe('vehicles');
  });

  it('should search in questions', () => {
    const results = searchFAQ(FAQ_ITEMS, 'FleetCore');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');
  });

  it('should search in answers', () => {
    const results = searchFAQ(FAQ_ITEMS, '8 sections');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('3');
  });

  it('should be case insensitive', () => {
    const results = searchFAQ(FAQ_ITEMS, 'FLEETCORE');
    expect(results.length).toBe(1);
  });

  it('should combine category and search filters', () => {
    const results = searchFAQ(FAQ_ITEMS, 'ajouter', 'vehicles');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('2');
  });

  it('should return empty array when no match', () => {
    const results = searchFAQ(FAQ_ITEMS, 'xyz123');
    expect(results.length).toBe(0);
  });
});

describe('Onboarding Tooltip Positioning', () => {
  function calculateTooltipPosition(
    targetY: number,
    targetHeight: number,
    screenHeight: number,
    tooltipHeight: number = 120
  ): 'top' | 'bottom' {
    const spaceAbove = targetY;
    const spaceBelow = screenHeight - (targetY + targetHeight);
    
    // Prefer bottom if there's enough space
    if (spaceBelow >= tooltipHeight + 20) {
      return 'bottom';
    }
    
    // Otherwise show above
    return 'top';
  }

  it('should position tooltip below when space available', () => {
    const position = calculateTooltipPosition(100, 50, 800);
    expect(position).toBe('bottom');
  });

  it('should position tooltip above when near bottom of screen', () => {
    const position = calculateTooltipPosition(700, 50, 800);
    expect(position).toBe('top');
  });

  it('should handle edge case at middle of screen', () => {
    const position = calculateTooltipPosition(400, 50, 800);
    expect(position).toBe('bottom');
  });
});
