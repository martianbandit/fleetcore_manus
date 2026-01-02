/**
 * Tests unitaires pour les services Jotform et Perplexity
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import {
  JOTFORM_CONFIG,
  getFormUrl,
  getAllForms,
  getFormConfig,
} from '../lib/jotform-service';

import {
  quickDiagnostic,
  getUrgencyColor,
  getUrgencyLabel,
  formatCostEstimate,
  generateDiagnosticSummary,
} from '../lib/perplexity-service';

describe('Jotform Service', () => {
  describe('JOTFORM_CONFIG', () => {
    it('should have all required form configurations', () => {
      expect(JOTFORM_CONFIG.DAILY_INSPECTION).toBeDefined();
      expect(JOTFORM_CONFIG.DEFECT_REPORT).toBeDefined();
      expect(JOTFORM_CONFIG.INCIDENT_REPORT).toBeDefined();
    });

    it('should have valid form IDs', () => {
      expect(JOTFORM_CONFIG.DAILY_INSPECTION.id).toBe('260015116962046');
      expect(JOTFORM_CONFIG.DEFECT_REPORT.id).toBe('260015390984054');
      expect(JOTFORM_CONFIG.INCIDENT_REPORT.id).toBe('260015304617042');
    });

    it('should have valid URLs', () => {
      expect(JOTFORM_CONFIG.DAILY_INSPECTION.url).toContain('jotform.com');
      expect(JOTFORM_CONFIG.DEFECT_REPORT.url).toContain('jotform.com');
      expect(JOTFORM_CONFIG.INCIDENT_REPORT.url).toContain('jotform.com');
    });
  });

  describe('getFormUrl', () => {
    it('should return base URL without prefill data', () => {
      const url = getFormUrl('DAILY_INSPECTION');
      expect(url).toBe(JOTFORM_CONFIG.DAILY_INSPECTION.url);
    });

    it('should append prefill parameters to URL', () => {
      const url = getFormUrl('DEFECT_REPORT', {
        driverName: 'Jean Dupont',
        vehiclePlate: 'ABC-123',
      });
      expect(url).toContain('driverName=Jean');
      expect(url).toContain('vehiclePlate=ABC-123');
    });
  });

  describe('getAllForms', () => {
    it('should return all three forms', () => {
      const forms = getAllForms();
      expect(forms).toHaveLength(3);
    });

    it('should include form type in each form', () => {
      const forms = getAllForms();
      const types = forms.map(f => f.type);
      expect(types).toContain('DAILY_INSPECTION');
      expect(types).toContain('DEFECT_REPORT');
      expect(types).toContain('INCIDENT_REPORT');
    });
  });

  describe('getFormConfig', () => {
    it('should return correct config for each form type', () => {
      const dailyConfig = getFormConfig('DAILY_INSPECTION');
      expect(dailyConfig.name).toBe('Ronde de sécurité quotidienne');

      const defectConfig = getFormConfig('DEFECT_REPORT');
      expect(defectConfig.name).toBe('Signalement de défaut');

      const incidentConfig = getFormConfig('INCIDENT_REPORT');
      expect(incidentConfig.name).toBe("Rapport d'incident");
    });
  });
});

describe('Perplexity Service', () => {
  describe('quickDiagnostic', () => {
    it('should return diagnostic for brakes category', () => {
      const result = quickDiagnostic('brakes', 'critical', 'Freins qui grincent');
      
      expect(result.probableCauses).toBeDefined();
      expect(result.probableCauses!.length).toBeGreaterThan(0);
      expect(result.urgencyLevel).toBe('critical');
      expect(result.risks).toBeDefined();
      expect(result.costEstimate).toBeDefined();
    });

    it('should return diagnostic for engine category', () => {
      const result = quickDiagnostic('engine', 'major', 'Moteur qui cale');
      
      expect(result.probableCauses).toBeDefined();
      // Engine with major severity returns medium urgency per service logic
      expect(result.urgencyLevel).toBe('medium');
    });

    it('should return diagnostic for tires category', () => {
      const result = quickDiagnostic('tires', 'minor', 'Usure inégale');
      
      expect(result.probableCauses).toBeDefined();
      expect(result.urgencyLevel).toBe('medium');
    });

    it('should return default diagnostic for unknown category', () => {
      const result = quickDiagnostic('unknown', 'minor', 'Problème inconnu');
      
      expect(result.probableCauses).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should include cost estimates in CAD', () => {
      const result = quickDiagnostic('electrical', 'minor', 'Batterie faible');
      
      expect(result.costEstimate).toBeDefined();
      expect(result.costEstimate!.currency).toBe('CAD');
      expect(result.costEstimate!.totalMin).toBeGreaterThan(0);
      expect(result.costEstimate!.totalMax).toBeGreaterThanOrEqual(result.costEstimate!.totalMin);
    });
  });

  describe('getUrgencyColor', () => {
    it('should return red for critical urgency', () => {
      expect(getUrgencyColor('critical')).toBe('#DC2626');
    });

    it('should return orange for high urgency', () => {
      expect(getUrgencyColor('high')).toBe('#F59E0B');
    });

    it('should return blue for medium urgency', () => {
      expect(getUrgencyColor('medium')).toBe('#3B82F6');
    });

    it('should return green for low urgency', () => {
      expect(getUrgencyColor('low')).toBe('#10B981');
    });
  });

  describe('getUrgencyLabel', () => {
    it('should return French labels for urgency levels', () => {
      expect(getUrgencyLabel('critical')).toBe('Critique');
      expect(getUrgencyLabel('high')).toBe('Élevée');
      expect(getUrgencyLabel('medium')).toBe('Moyenne');
      expect(getUrgencyLabel('low')).toBe('Faible');
    });
  });

  describe('formatCostEstimate', () => {
    it('should format cost range correctly', () => {
      const estimate = {
        laborMin: 100,
        laborMax: 200,
        partsMin: 50,
        partsMax: 100,
        totalMin: 150,
        totalMax: 300,
        currency: 'CAD',
      };
      
      const formatted = formatCostEstimate(estimate);
      expect(formatted).toBe('150 - 300 CAD');
    });

    it('should format single cost when min equals max', () => {
      const estimate = {
        laborMin: 100,
        laborMax: 100,
        partsMin: 50,
        partsMax: 50,
        totalMin: 150,
        totalMax: 150,
        currency: 'CAD',
      };
      
      const formatted = formatCostEstimate(estimate);
      expect(formatted).toBe('150 CAD');
    });
  });

  describe('generateDiagnosticSummary', () => {
    it('should generate a summary with urgency, cause, and cost', () => {
      const result = {
        id: 'test',
        requestId: 'req',
        createdAt: new Date().toISOString(),
        vehicleId: 'V001',
        probableCauses: [
          { cause: 'Usure des plaquettes', probability: 'high' as const, explanation: 'Test' },
        ],
        recommendedDiagnostics: [],
        urgencyLevel: 'high' as const,
        urgencyExplanation: 'Test',
        risks: [],
        costEstimate: {
          laborMin: 100,
          laborMax: 200,
          partsMin: 50,
          partsMax: 100,
          totalMin: 150,
          totalMax: 300,
          currency: 'CAD',
        },
        likelyParts: [],
        recommendations: [],
        confidence: 'high' as const,
      };
      
      const summary = generateDiagnosticSummary(result);
      expect(summary).toContain('Urgence: Élevée');
      expect(summary).toContain('Usure des plaquettes');
      expect(summary).toContain('150 - 300 CAD');
    });
  });
});

describe('Integration: Jotform + Perplexity', () => {
  it('should be able to use diagnostic data with form data', () => {
    // Simulate a defect report scenario
    const defectCategory = 'brakes';
    const severity = 'major';
    const description = 'Les freins font un bruit de grincement';
    
    // Get diagnostic
    const diagnostic = quickDiagnostic(defectCategory, severity, description);
    
    // Verify diagnostic can be used with form
    expect(diagnostic.probableCauses).toBeDefined();
    expect(diagnostic.costEstimate).toBeDefined();
    
    // Verify form URL can be generated
    const formUrl = getFormUrl('DEFECT_REPORT', {
      defectCategory,
      severity,
    });
    expect(formUrl).toContain('jotform.com');
  });
});
