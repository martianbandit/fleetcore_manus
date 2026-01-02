/**
 * FleetCore - Service de Diagnostic avec Perplexity API
 * 
 * Utilise l'API Perplexity (Sonar) pour:
 * - Analyser les défauts signalés
 * - Suggérer des diagnostics
 * - Estimer les coûts de réparation
 * - Fournir des recommandations de maintenance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONFIGURATION
// ============================================================================

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar-pro';

// Storage keys
const STORAGE_KEYS = {
  DIAGNOSTICS: '@fleetcore_diagnostics',
  DIAGNOSTIC_CACHE: '@fleetcore_diagnostic_cache',
};

// ============================================================================
// TYPES
// ============================================================================

export interface DiagnosticRequest {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    vin?: string;
    fleetNumber?: string;
  };
  defect: {
    category: string;
    severity: 'minor' | 'major' | 'critical';
    description: string;
    location: string;
    symptoms?: string[];
    photos?: string[];
  };
  context?: {
    recentRepairs?: string[];
    maintenanceHistory?: string;
    driverNotes?: string;
  };
}

export interface DiagnosticResult {
  id: string;
  requestId: string;
  createdAt: string;
  vehicleId: string;
  
  // Analyse principale
  probableCauses: {
    cause: string;
    probability: 'high' | 'medium' | 'low';
    explanation: string;
  }[];
  
  // Diagnostics recommandés
  recommendedDiagnostics: {
    test: string;
    priority: 'immediate' | 'soon' | 'routine';
    estimatedTime: string;
    tools?: string[];
  }[];
  
  // Urgence et risques
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  urgencyExplanation: string;
  risks: string[];
  
  // Estimation des coûts
  costEstimate: {
    laborMin: number;
    laborMax: number;
    partsMin: number;
    partsMax: number;
    totalMin: number;
    totalMax: number;
    currency: string;
  };
  
  // Pièces nécessaires
  likelyParts: {
    partName: string;
    partNumber?: string;
    estimatedCost: string;
    availability: 'common' | 'special_order' | 'dealer_only';
  }[];
  
  // Recommandations
  recommendations: string[];
  
  // Métadonnées
  sources?: string[];
  confidence: 'high' | 'medium' | 'low';
  rawResponse?: string;
}

export interface DiagnosticHistory {
  id: string;
  vehicleId: string;
  vehicleName: string;
  defectCategory: string;
  severity: string;
  createdAt: string;
  urgencyLevel: string;
  status: 'pending' | 'reviewed' | 'resolved';
  result?: DiagnosticResult;
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Effectue un diagnostic via l'API Perplexity
 */
export async function performDiagnostic(
  request: DiagnosticRequest,
  apiKey?: string
): Promise<DiagnosticResult> {
  const key = apiKey || process.env.SONAR_API_KEY;
  
  if (!key) {
    throw new Error('Clé API Perplexity non configurée. Veuillez configurer SONAR_API_KEY.');
  }

  const prompt = buildDiagnosticPrompt(request);
  
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en diagnostic de véhicules commerciaux (camions lourds, semi-remorques, autobus). 
Tu analyses les défauts signalés et fournis des diagnostics détaillés, des estimations de coûts et des recommandations.
Réponds toujours en français et structure ta réponse en JSON valide selon le format demandé.
Base tes estimations de coûts sur le marché canadien (CAD).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Perplexity: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Réponse vide de l\'API Perplexity');
    }

    // Parser la réponse JSON
    const result = parsePerplexityResponse(content, request);
    
    // Sauvegarder le diagnostic
    await saveDiagnostic(result);
    
    return result;
  } catch (error) {
    console.error('Erreur lors du diagnostic Perplexity:', error);
    throw error;
  }
}

/**
 * Construit le prompt pour l'API Perplexity
 */
function buildDiagnosticPrompt(request: DiagnosticRequest): string {
  const { vehicleInfo, defect, context } = request;
  
  let prompt = `Analyse ce défaut sur un véhicule commercial et fournis un diagnostic détaillé.

## Informations du véhicule
- Marque: ${vehicleInfo.make}
- Modèle: ${vehicleInfo.model}
- Année: ${vehicleInfo.year}
- Kilométrage: ${vehicleInfo.mileage.toLocaleString()} km
${vehicleInfo.vin ? `- VIN: ${vehicleInfo.vin}` : ''}

## Défaut signalé
- Catégorie: ${defect.category}
- Sévérité signalée: ${defect.severity}
- Description: ${defect.description}
- Localisation: ${defect.location}
${defect.symptoms?.length ? `- Symptômes: ${defect.symptoms.join(', ')}` : ''}`;

  if (context) {
    if (context.recentRepairs?.length) {
      prompt += `\n\n## Réparations récentes\n${context.recentRepairs.join('\n')}`;
    }
    if (context.maintenanceHistory) {
      prompt += `\n\n## Historique de maintenance\n${context.maintenanceHistory}`;
    }
    if (context.driverNotes) {
      prompt += `\n\n## Notes du chauffeur\n${context.driverNotes}`;
    }
  }

  prompt += `

## Format de réponse attendu (JSON)
{
  "probableCauses": [
    {"cause": "...", "probability": "high|medium|low", "explanation": "..."}
  ],
  "recommendedDiagnostics": [
    {"test": "...", "priority": "immediate|soon|routine", "estimatedTime": "...", "tools": ["..."]}
  ],
  "urgencyLevel": "critical|high|medium|low",
  "urgencyExplanation": "...",
  "risks": ["..."],
  "costEstimate": {
    "laborMin": 0, "laborMax": 0,
    "partsMin": 0, "partsMax": 0,
    "totalMin": 0, "totalMax": 0,
    "currency": "CAD"
  },
  "likelyParts": [
    {"partName": "...", "partNumber": "...", "estimatedCost": "...", "availability": "common|special_order|dealer_only"}
  ],
  "recommendations": ["..."],
  "confidence": "high|medium|low"
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

  return prompt;
}

/**
 * Parse la réponse de Perplexity et crée un DiagnosticResult
 */
function parsePerplexityResponse(
  content: string,
  request: DiagnosticRequest
): DiagnosticResult {
  // Essayer d'extraire le JSON de la réponse
  let jsonContent = content;
  
  // Chercher un bloc JSON dans la réponse
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonContent = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonContent);
    
    return {
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      vehicleId: request.vehicleInfo.fleetNumber || request.vehicleInfo.vin || 'unknown',
      
      probableCauses: parsed.probableCauses || [],
      recommendedDiagnostics: parsed.recommendedDiagnostics || [],
      urgencyLevel: parsed.urgencyLevel || 'medium',
      urgencyExplanation: parsed.urgencyExplanation || '',
      risks: parsed.risks || [],
      costEstimate: parsed.costEstimate || {
        laborMin: 0, laborMax: 0,
        partsMin: 0, partsMax: 0,
        totalMin: 0, totalMax: 0,
        currency: 'CAD'
      },
      likelyParts: parsed.likelyParts || [],
      recommendations: parsed.recommendations || [],
      confidence: parsed.confidence || 'medium',
      rawResponse: content,
    };
  } catch (parseError) {
    console.error('Erreur de parsing JSON:', parseError);
    
    // Retourner un résultat par défaut avec la réponse brute
    return {
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      vehicleId: request.vehicleInfo.fleetNumber || 'unknown',
      
      probableCauses: [{
        cause: 'Analyse manuelle requise',
        probability: 'medium',
        explanation: content
      }],
      recommendedDiagnostics: [{
        test: 'Inspection visuelle complète',
        priority: 'soon',
        estimatedTime: '30-60 minutes'
      }],
      urgencyLevel: request.defect.severity === 'critical' ? 'critical' : 
                    request.defect.severity === 'major' ? 'high' : 'medium',
      urgencyExplanation: 'Basé sur la sévérité signalée par le chauffeur',
      risks: ['Évaluation manuelle nécessaire'],
      costEstimate: {
        laborMin: 100, laborMax: 500,
        partsMin: 0, partsMax: 1000,
        totalMin: 100, totalMax: 1500,
        currency: 'CAD'
      },
      likelyParts: [],
      recommendations: ['Faire inspecter par un technicien qualifié'],
      confidence: 'low',
      rawResponse: content,
    };
  }
}

// ============================================================================
// STOCKAGE ET HISTORIQUE
// ============================================================================

/**
 * Sauvegarde un diagnostic
 */
async function saveDiagnostic(result: DiagnosticResult): Promise<void> {
  try {
    const diagnostics = await getDiagnostics();
    diagnostics.unshift(result);
    
    // Garder seulement les 100 derniers diagnostics
    const trimmed = diagnostics.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.DIAGNOSTICS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Erreur sauvegarde diagnostic:', error);
  }
}

/**
 * Récupère tous les diagnostics
 */
export async function getDiagnostics(): Promise<DiagnosticResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DIAGNOSTICS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur récupération diagnostics:', error);
    return [];
  }
}

/**
 * Récupère les diagnostics pour un véhicule
 */
export async function getDiagnosticsByVehicle(vehicleId: string): Promise<DiagnosticResult[]> {
  const diagnostics = await getDiagnostics();
  return diagnostics.filter(d => d.vehicleId === vehicleId);
}

/**
 * Récupère un diagnostic par ID
 */
export async function getDiagnosticById(id: string): Promise<DiagnosticResult | null> {
  const diagnostics = await getDiagnostics();
  return diagnostics.find(d => d.id === id) || null;
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Formate le coût estimé pour l'affichage
 */
export function formatCostEstimate(estimate: DiagnosticResult['costEstimate']): string {
  const { totalMin, totalMax, currency } = estimate;
  if (totalMin === totalMax) {
    return `${totalMin.toLocaleString()} ${currency}`;
  }
  return `${totalMin.toLocaleString()} - ${totalMax.toLocaleString()} ${currency}`;
}

/**
 * Retourne la couleur associée au niveau d'urgence
 */
export function getUrgencyColor(level: DiagnosticResult['urgencyLevel']): string {
  switch (level) {
    case 'critical': return '#DC2626'; // Rouge
    case 'high': return '#F59E0B'; // Orange
    case 'medium': return '#3B82F6'; // Bleu
    case 'low': return '#10B981'; // Vert
    default: return '#6B7280'; // Gris
  }
}

/**
 * Retourne le libellé français du niveau d'urgence
 */
export function getUrgencyLabel(level: DiagnosticResult['urgencyLevel']): string {
  switch (level) {
    case 'critical': return 'Critique';
    case 'high': return 'Élevée';
    case 'medium': return 'Moyenne';
    case 'low': return 'Faible';
    default: return 'Inconnue';
  }
}

/**
 * Génère un résumé du diagnostic pour affichage rapide
 */
export function generateDiagnosticSummary(result: DiagnosticResult): string {
  const mainCause = result.probableCauses[0];
  const urgency = getUrgencyLabel(result.urgencyLevel);
  const cost = formatCostEstimate(result.costEstimate);
  
  let summary = `Urgence: ${urgency}. `;
  if (mainCause) {
    summary += `Cause probable: ${mainCause.cause}. `;
  }
  summary += `Coût estimé: ${cost}.`;
  
  return summary;
}

// ============================================================================
// DIAGNOSTIC RAPIDE (SANS API)
// ============================================================================

/**
 * Effectue un diagnostic rapide basé sur des règles locales
 * Utilisé quand l'API n'est pas disponible
 */
export function quickDiagnostic(
  category: string,
  severity: string,
  description: string
): Partial<DiagnosticResult> {
  const rules: Record<string, any> = {
    brakes: {
      probableCauses: [
        { cause: 'Usure des plaquettes de frein', probability: 'high', explanation: 'Cause la plus fréquente' },
        { cause: 'Disques de frein usés ou déformés', probability: 'medium', explanation: 'À vérifier si plaquettes OK' },
        { cause: 'Fuite de liquide de frein', probability: 'medium', explanation: 'Vérifier le niveau et les conduites' },
      ],
      urgencyLevel: severity === 'critical' ? 'critical' : 'high',
      risks: ['Perte de capacité de freinage', 'Accident potentiel', 'Non-conformité SAAQ'],
      costEstimate: { laborMin: 150, laborMax: 400, partsMin: 100, partsMax: 800, totalMin: 250, totalMax: 1200, currency: 'CAD' },
    },
    engine: {
      probableCauses: [
        { cause: 'Problème d\'injection', probability: 'medium', explanation: 'Commun sur moteurs diesel' },
        { cause: 'Filtre à air encrassé', probability: 'high', explanation: 'Vérification simple' },
        { cause: 'Problème de turbo', probability: 'low', explanation: 'Si perte de puissance' },
      ],
      urgencyLevel: severity === 'critical' ? 'high' : 'medium',
      risks: ['Panne en route', 'Dommages moteur', 'Consommation excessive'],
      costEstimate: { laborMin: 200, laborMax: 1000, partsMin: 50, partsMax: 3000, totalMin: 250, totalMax: 4000, currency: 'CAD' },
    },
    tires: {
      probableCauses: [
        { cause: 'Usure inégale', probability: 'high', explanation: 'Problème d\'alignement possible' },
        { cause: 'Pression incorrecte', probability: 'high', explanation: 'Vérifier toutes les roues' },
        { cause: 'Dommage structurel', probability: 'medium', explanation: 'Inspection visuelle nécessaire' },
      ],
      urgencyLevel: severity === 'critical' ? 'critical' : 'medium',
      risks: ['Éclatement', 'Perte de contrôle', 'Usure prématurée'],
      costEstimate: { laborMin: 50, laborMax: 200, partsMin: 300, partsMax: 1500, totalMin: 350, totalMax: 1700, currency: 'CAD' },
    },
    electrical: {
      probableCauses: [
        { cause: 'Batterie faible', probability: 'high', explanation: 'Tester la charge' },
        { cause: 'Alternateur défaillant', probability: 'medium', explanation: 'Si batterie OK' },
        { cause: 'Connexion corrodée', probability: 'medium', explanation: 'Inspecter les bornes' },
      ],
      urgencyLevel: 'medium',
      risks: ['Panne de démarrage', 'Perte d\'éclairage', 'Défaillance systèmes'],
      costEstimate: { laborMin: 100, laborMax: 300, partsMin: 150, partsMax: 600, totalMin: 250, totalMax: 900, currency: 'CAD' },
    },
  };

  const categoryRules = rules[category.toLowerCase()] || {
    probableCauses: [{ cause: 'Inspection requise', probability: 'medium', explanation: 'Diagnostic manuel nécessaire' }],
    urgencyLevel: severity === 'critical' ? 'high' : 'medium',
    risks: ['À évaluer par un technicien'],
    costEstimate: { laborMin: 100, laborMax: 500, partsMin: 0, partsMax: 1000, totalMin: 100, totalMax: 1500, currency: 'CAD' },
  };

  return {
    ...categoryRules,
    recommendations: [
      'Faire inspecter par un technicien qualifié',
      'Ne pas utiliser le véhicule si défaut critique',
      'Documenter avec photos si possible',
    ],
    confidence: 'medium',
  };
}
