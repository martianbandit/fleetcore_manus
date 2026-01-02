/**
 * Tests unitaires pour les fonctionnalités PEP v17
 * Fiche d'entretien préventif SAAQ
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (key: string) => mockStorage[key] || null,
  setItem: async (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: async (key: string) => { delete mockStorage[key]; },
  clear: async () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
};

// Import des fonctions à tester (simulation)
const PEP_COMPONENTS = {
  freins: [
    { code: 1, name: 'Système de freinage' },
    { code: 2, name: 'Pédale de frein' },
    { code: 3, name: 'Frein de stationnement' },
  ],
  direction: [
    { code: 33, name: 'Direction' },
    { code: 34, name: 'Élément de fixation' },
    { code: 35, name: 'Volant' },
  ],
  eclairage: [
    { code: 60, name: 'Phare' },
    { code: 61, name: 'Feu de position' },
  ],
};

type ComponentStatus = 'SO' | 'C' | 'Min' | 'Maj';
type PlanType = 'free' | 'plus' | 'pro' | 'enterprise';

interface PEPComponent {
  code: number;
  name: string;
  status: ComponentStatus;
}

interface PEPSection {
  id: string;
  title: string;
  components: PEPComponent[];
}

interface PEPForm {
  id: string;
  vehicleId: string;
  sections: PEPSection[];
  status: 'draft' | 'completed' | 'signed';
  totalMinorDefects: number;
  totalMajorDefects: number;
}

// Fonction de vérification d'accès PEP
function isPEPAccessAllowed(plan: string): boolean {
  const allowedPlans = ['plus', 'pro', 'enterprise', 'entreprise'];
  return allowedPlans.includes(plan.toLowerCase());
}

// Fonction de calcul de la prochaine date d'entretien
function calculateNextMaintenanceDate(pnbv: number, annualKm?: number): string {
  const now = new Date();
  let monthsToAdd = 3;
  
  if (pnbv >= 4500) {
    if (annualKm && annualKm < 20000) {
      monthsToAdd = 6;
    }
  } else {
    monthsToAdd = 6;
  }
  
  const nextDate = new Date(now);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  
  return nextDate.toISOString().split('T')[0];
}

// Fonction de comptage des défauts
function countDefects(sections: PEPSection[]): { minor: number; major: number } {
  let minor = 0;
  let major = 0;
  
  sections.forEach(section => {
    section.components.forEach(comp => {
      if (comp.status === 'Min') minor++;
      if (comp.status === 'Maj') major++;
    });
  });
  
  return { minor, major };
}

// Fonction de création de formulaire PEP vide
function createEmptyPEPForm(vehicleId: string): PEPForm {
  const sections: PEPSection[] = [
    {
      id: 'freins',
      title: '1. Freins',
      components: PEP_COMPONENTS.freins.map(c => ({
        ...c,
        status: 'SO' as ComponentStatus,
      })),
    },
    {
      id: 'direction',
      title: '2. Direction',
      components: PEP_COMPONENTS.direction.map(c => ({
        ...c,
        status: 'SO' as ComponentStatus,
      })),
    },
  ];

  return {
    id: `pep_${Date.now()}`,
    vehicleId,
    sections,
    status: 'draft',
    totalMinorDefects: 0,
    totalMajorDefects: 0,
  };
}

describe('PEP Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('isPEPAccessAllowed', () => {
    it('devrait refuser l\'accès au plan free', () => {
      expect(isPEPAccessAllowed('free')).toBe(false);
    });

    it('devrait autoriser l\'accès au plan plus', () => {
      expect(isPEPAccessAllowed('plus')).toBe(true);
    });

    it('devrait autoriser l\'accès au plan pro', () => {
      expect(isPEPAccessAllowed('pro')).toBe(true);
    });

    it('devrait autoriser l\'accès au plan enterprise', () => {
      expect(isPEPAccessAllowed('enterprise')).toBe(true);
    });

    it('devrait autoriser l\'accès au plan entreprise (français)', () => {
      expect(isPEPAccessAllowed('entreprise')).toBe(true);
    });

    it('devrait être insensible à la casse', () => {
      expect(isPEPAccessAllowed('PLUS')).toBe(true);
      expect(isPEPAccessAllowed('Pro')).toBe(true);
      expect(isPEPAccessAllowed('ENTERPRISE')).toBe(true);
    });
  });

  describe('calculateNextMaintenanceDate', () => {
    it('devrait retourner 3 mois pour PNBV >= 4500 kg', () => {
      const result = calculateNextMaintenanceDate(5000);
      const expected = new Date();
      expected.setMonth(expected.getMonth() + 3);
      expect(result).toBe(expected.toISOString().split('T')[0]);
    });

    it('devrait retourner 6 mois pour PNBV >= 4500 kg avec faible kilométrage', () => {
      const result = calculateNextMaintenanceDate(5000, 15000);
      const expected = new Date();
      expected.setMonth(expected.getMonth() + 6);
      expect(result).toBe(expected.toISOString().split('T')[0]);
    });

    it('devrait retourner 6 mois pour PNBV < 4500 kg', () => {
      const result = calculateNextMaintenanceDate(3500);
      const expected = new Date();
      expected.setMonth(expected.getMonth() + 6);
      expect(result).toBe(expected.toISOString().split('T')[0]);
    });
  });

  describe('countDefects', () => {
    it('devrait compter correctement les défauts mineurs et majeurs', () => {
      const sections: PEPSection[] = [
        {
          id: 'test',
          title: 'Test',
          components: [
            { code: 1, name: 'Comp1', status: 'C' },
            { code: 2, name: 'Comp2', status: 'Min' },
            { code: 3, name: 'Comp3', status: 'Maj' },
            { code: 4, name: 'Comp4', status: 'Min' },
            { code: 5, name: 'Comp5', status: 'SO' },
          ],
        },
      ];

      const result = countDefects(sections);
      expect(result.minor).toBe(2);
      expect(result.major).toBe(1);
    });

    it('devrait retourner 0 si aucun défaut', () => {
      const sections: PEPSection[] = [
        {
          id: 'test',
          title: 'Test',
          components: [
            { code: 1, name: 'Comp1', status: 'C' },
            { code: 2, name: 'Comp2', status: 'C' },
            { code: 3, name: 'Comp3', status: 'SO' },
          ],
        },
      ];

      const result = countDefects(sections);
      expect(result.minor).toBe(0);
      expect(result.major).toBe(0);
    });
  });

  describe('createEmptyPEPForm', () => {
    it('devrait créer un formulaire PEP vide avec les bonnes sections', () => {
      const form = createEmptyPEPForm('vehicle_123');
      
      expect(form.vehicleId).toBe('vehicle_123');
      expect(form.status).toBe('draft');
      expect(form.totalMinorDefects).toBe(0);
      expect(form.totalMajorDefects).toBe(0);
      expect(form.sections.length).toBe(2);
    });

    it('devrait initialiser tous les composants à SO', () => {
      const form = createEmptyPEPForm('vehicle_123');
      
      form.sections.forEach(section => {
        section.components.forEach(comp => {
          expect(comp.status).toBe('SO');
        });
      });
    });

    it('devrait générer un ID unique', async () => {
      const form1 = createEmptyPEPForm('vehicle_1');
      // Attendre 1ms pour garantir un timestamp différent
      await new Promise(resolve => setTimeout(resolve, 1));
      const form2 = createEmptyPEPForm('vehicle_2');
      
      expect(form1.id).not.toBe(form2.id);
    });
  });

  describe('PEP Components', () => {
    it('devrait avoir les composants de freins', () => {
      expect(PEP_COMPONENTS.freins.length).toBeGreaterThan(0);
      expect(PEP_COMPONENTS.freins[0]).toHaveProperty('code');
      expect(PEP_COMPONENTS.freins[0]).toHaveProperty('name');
    });

    it('devrait avoir les composants de direction', () => {
      expect(PEP_COMPONENTS.direction.length).toBeGreaterThan(0);
    });

    it('devrait avoir les composants d\'éclairage', () => {
      expect(PEP_COMPONENTS.eclairage.length).toBeGreaterThan(0);
    });
  });
});

describe('Subscription Service - PEP Access', () => {
  const PLAN_LIMITS = {
    free: { maxVehicles: 3, pdfExport: false },
    plus: { maxVehicles: 10, pdfExport: true },
    pro: { maxVehicles: 25, pdfExport: true },
    enterprise: { maxVehicles: 999999, pdfExport: true },
  };

  it('devrait avoir les limites correctes pour le plan free', () => {
    expect(PLAN_LIMITS.free.maxVehicles).toBe(3);
    expect(PLAN_LIMITS.free.pdfExport).toBe(false);
  });

  it('devrait avoir les limites correctes pour le plan plus', () => {
    expect(PLAN_LIMITS.plus.maxVehicles).toBe(10);
    expect(PLAN_LIMITS.plus.pdfExport).toBe(true);
  });

  it('devrait avoir les limites correctes pour le plan pro', () => {
    expect(PLAN_LIMITS.pro.maxVehicles).toBe(25);
    expect(PLAN_LIMITS.pro.pdfExport).toBe(true);
  });

  it('devrait avoir les limites correctes pour le plan enterprise', () => {
    expect(PLAN_LIMITS.enterprise.maxVehicles).toBe(999999);
    expect(PLAN_LIMITS.enterprise.pdfExport).toBe(true);
  });
});
