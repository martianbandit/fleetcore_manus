/**
 * FleetCore - Service d'intégration Jotform
 * 
 * Gère l'intégration avec les formulaires Jotform pour:
 * - Ronde de sécurité quotidienne
 * - Signalement de défauts
 * - Rapport d'incident
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONFIGURATION DES FORMULAIRES
// ============================================================================

export const JOTFORM_CONFIG = {
  // Formulaire de ronde de sécurité quotidienne
  DAILY_INSPECTION: {
    id: '260015116962046',
    url: 'https://form.jotform.com/260015116962046',
    name: 'Ronde de sécurité quotidienne',
    description: 'Inspection quotidienne du véhicule avant départ',
    icon: 'clipboard-outline',
  },
  // Formulaire de signalement de défauts
  DEFECT_REPORT: {
    id: '260015390984054',
    url: 'https://form.jotform.com/260015390984054',
    name: 'Signalement de défaut',
    description: 'Signaler un problème ou défaut sur le véhicule',
    icon: 'warning-outline',
  },
  // Formulaire de rapport d'incident
  INCIDENT_REPORT: {
    id: '260015304617042',
    url: 'https://form.jotform.com/260015304617042',
    name: 'Rapport d\'incident',
    description: 'Déclarer un accident ou incident',
    icon: 'alert-circle-outline',
  },
} as const;

export type JotformFormType = keyof typeof JOTFORM_CONFIG;

// ============================================================================
// TYPES
// ============================================================================

export interface JotformSubmission {
  id: string;
  formId: string;
  formType: JotformFormType;
  submittedAt: string;
  driverName: string;
  driverId: string;
  vehicleId: string;
  vehiclePlate: string;
  answers: Record<string, any>;
  status: 'pending' | 'processed' | 'archived';
  syncedAt?: string;
}

export interface DailyInspectionData {
  driverName: string;
  driverId: string;
  inspectionDate: string;
  vehicleNumber: string;
  licensePlate: string;
  odometerReading: number;
  exteriorItems: {
    item: string;
    status: 'pass' | 'fail';
    notes?: string;
  }[];
  interiorItems: {
    item: string;
    status: 'pass' | 'fail';
    notes?: string;
  }[];
  exteriorPhotos: string[];
  interiorPhotos: string[];
  additionalNotes?: string;
  signature: string;
  isVehicleSafe: boolean;
}

export interface DefectReportData {
  driverName: string;
  driverId: string;
  vehicleFleetNumber: string;
  vehiclePlate: string;
  defectCategory: 'engine' | 'brakes' | 'tires' | 'electrical' | 'body' | 'lights' | 'steering' | 'other';
  severityLevel: 'minor' | 'major' | 'critical';
  description: string;
  locationOnVehicle: string;
  photos: string[];
  dateTimeNoticed: string;
  isSafeToDrive: boolean;
  recommendedAction: string;
  signature: string;
}

export interface IncidentReportData {
  driverName: string;
  driverId: string;
  driverContact: string;
  incidentDateTime: string;
  incidentLocation: string;
  vehicleFleetNumber: string;
  vehiclePlate: string;
  incidentType: 'collision' | 'breakdown' | 'theft' | 'vandalism' | 'weather_damage' | 'other';
  description: string;
  wereThereInjuries: boolean;
  policeReportNumber?: string;
  witnessName?: string;
  witnessContact?: string;
  photos: string[];
  insuranceClaimFiled: boolean;
  driverStatement: string;
  signature: string;
  submissionDate: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  SUBMISSIONS: '@fleetcore_jotform_submissions',
  PENDING_SYNC: '@fleetcore_jotform_pending_sync',
  LAST_SYNC: '@fleetcore_jotform_last_sync',
};

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Génère un ID unique pour les soumissions locales
 */
function generateSubmissionId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Récupère l'URL du formulaire avec pré-remplissage
 */
export function getFormUrl(
  formType: JotformFormType,
  prefillData?: Record<string, string>
): string {
  const config = JOTFORM_CONFIG[formType];
  let url = config.url;

  if (prefillData && Object.keys(prefillData).length > 0) {
    const params = new URLSearchParams();
    Object.entries(prefillData).forEach(([key, value]) => {
      params.append(key, value);
    });
    url += `?${params.toString()}`;
  }

  return url;
}

/**
 * Récupère la configuration d'un formulaire
 */
export function getFormConfig(formType: JotformFormType) {
  return JOTFORM_CONFIG[formType];
}

/**
 * Récupère tous les formulaires disponibles
 */
export function getAllForms() {
  return Object.entries(JOTFORM_CONFIG).map(([key, config]) => ({
    type: key as JotformFormType,
    ...config,
  }));
}

// ============================================================================
// GESTION DES SOUMISSIONS LOCALES
// ============================================================================

/**
 * Sauvegarde une soumission localement
 */
export async function saveSubmissionLocally(
  formType: JotformFormType,
  data: DailyInspectionData | DefectReportData | IncidentReportData
): Promise<JotformSubmission> {
  try {
    const submissions = await getLocalSubmissions();
    
    const newSubmission: JotformSubmission = {
      id: generateSubmissionId(),
      formId: JOTFORM_CONFIG[formType].id,
      formType,
      submittedAt: new Date().toISOString(),
      driverName: 'driverName' in data ? data.driverName : '',
      driverId: 'driverId' in data ? data.driverId : '',
      vehicleId: 'vehicleFleetNumber' in data ? data.vehicleFleetNumber : 
                 'vehicleNumber' in data ? (data as DailyInspectionData).vehicleNumber : '',
      vehiclePlate: 'vehiclePlate' in data ? data.vehiclePlate : 
                    'licensePlate' in data ? (data as DailyInspectionData).licensePlate : '',
      answers: data,
      status: 'pending',
    };

    submissions.push(newSubmission);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    // Ajouter à la liste de sync en attente
    await addToPendingSync(newSubmission.id);

    return newSubmission;
  } catch (error) {
    console.error('Error saving submission locally:', error);
    throw error;
  }
}

/**
 * Récupère toutes les soumissions locales
 */
export async function getLocalSubmissions(): Promise<JotformSubmission[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting local submissions:', error);
    return [];
  }
}

/**
 * Récupère les soumissions par type de formulaire
 */
export async function getSubmissionsByType(formType: JotformFormType): Promise<JotformSubmission[]> {
  const submissions = await getLocalSubmissions();
  return submissions.filter(s => s.formType === formType);
}

/**
 * Récupère les soumissions par véhicule
 */
export async function getSubmissionsByVehicle(vehicleId: string): Promise<JotformSubmission[]> {
  const submissions = await getLocalSubmissions();
  return submissions.filter(s => s.vehicleId === vehicleId);
}

/**
 * Récupère les soumissions par chauffeur
 */
export async function getSubmissionsByDriver(driverId: string): Promise<JotformSubmission[]> {
  const submissions = await getLocalSubmissions();
  return submissions.filter(s => s.driverId === driverId);
}

/**
 * Met à jour le statut d'une soumission
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: JotformSubmission['status']
): Promise<void> {
  try {
    const submissions = await getLocalSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    
    if (index !== -1) {
      submissions[index].status = status;
      if (status === 'processed') {
        submissions[index].syncedAt = new Date().toISOString();
      }
      await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw error;
  }
}

// ============================================================================
// GESTION DE LA SYNCHRONISATION
// ============================================================================

/**
 * Ajoute une soumission à la liste de sync en attente
 */
async function addToPendingSync(submissionId: string): Promise<void> {
  try {
    const pending = await getPendingSync();
    if (!pending.includes(submissionId)) {
      pending.push(submissionId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    }
  } catch (error) {
    console.error('Error adding to pending sync:', error);
  }
}

/**
 * Récupère la liste des soumissions en attente de sync
 */
export async function getPendingSync(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending sync:', error);
    return [];
  }
}

/**
 * Retire une soumission de la liste de sync en attente
 */
export async function removeFromPendingSync(submissionId: string): Promise<void> {
  try {
    const pending = await getPendingSync();
    const filtered = pending.filter(id => id !== submissionId);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from pending sync:', error);
  }
}

/**
 * Récupère la date de dernière synchronisation
 */
export async function getLastSyncDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error getting last sync date:', error);
    return null;
  }
}

/**
 * Met à jour la date de dernière synchronisation
 */
export async function updateLastSyncDate(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last sync date:', error);
  }
}

// ============================================================================
// STATISTIQUES
// ============================================================================

export interface JotformStats {
  totalSubmissions: number;
  pendingSync: number;
  byFormType: Record<JotformFormType, number>;
  byStatus: Record<JotformSubmission['status'], number>;
  todaySubmissions: number;
  weekSubmissions: number;
}

/**
 * Récupère les statistiques des soumissions
 */
export async function getJotformStats(): Promise<JotformStats> {
  const submissions = await getLocalSubmissions();
  const pending = await getPendingSync();
  
  const today = new Date().toDateString();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats: JotformStats = {
    totalSubmissions: submissions.length,
    pendingSync: pending.length,
    byFormType: {
      DAILY_INSPECTION: 0,
      DEFECT_REPORT: 0,
      INCIDENT_REPORT: 0,
    },
    byStatus: {
      pending: 0,
      processed: 0,
      archived: 0,
    },
    todaySubmissions: 0,
    weekSubmissions: 0,
  };

  submissions.forEach(s => {
    stats.byFormType[s.formType]++;
    stats.byStatus[s.status]++;
    
    const submissionDate = new Date(s.submittedAt);
    if (submissionDate.toDateString() === today) {
      stats.todaySubmissions++;
    }
    if (submissionDate >= weekAgo) {
      stats.weekSubmissions++;
    }
  });

  return stats;
}

// ============================================================================
// EXTRACTION DE DONNÉES POUR DIAGNOSTIC
// ============================================================================

/**
 * Extrait les données pertinentes pour le diagnostic d'un véhicule
 */
export async function extractDiagnosticData(vehicleId: string): Promise<{
  recentDefects: DefectReportData[];
  recentIncidents: IncidentReportData[];
  inspectionHistory: DailyInspectionData[];
  summary: string;
}> {
  const submissions = await getSubmissionsByVehicle(vehicleId);
  
  const defects = submissions
    .filter(s => s.formType === 'DEFECT_REPORT')
    .map(s => s.answers as DefectReportData)
    .sort((a, b) => new Date(b.dateTimeNoticed).getTime() - new Date(a.dateTimeNoticed).getTime());

  const incidents = submissions
    .filter(s => s.formType === 'INCIDENT_REPORT')
    .map(s => s.answers as IncidentReportData)
    .sort((a, b) => new Date(b.incidentDateTime).getTime() - new Date(a.incidentDateTime).getTime());

  const inspections = submissions
    .filter(s => s.formType === 'DAILY_INSPECTION')
    .map(s => s.answers as DailyInspectionData)
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());

  // Générer un résumé pour le diagnostic
  const criticalDefects = defects.filter(d => d.severityLevel === 'critical');
  const majorDefects = defects.filter(d => d.severityLevel === 'major');
  const failedInspections = inspections.filter(i => !i.isVehicleSafe);

  let summary = `Véhicule ${vehicleId}: `;
  summary += `${defects.length} défauts signalés (${criticalDefects.length} critiques, ${majorDefects.length} majeurs), `;
  summary += `${incidents.length} incidents, `;
  summary += `${inspections.length} inspections (${failedInspections.length} avec problèmes). `;

  if (criticalDefects.length > 0) {
    summary += `Défauts critiques: ${criticalDefects.map(d => d.defectCategory).join(', ')}. `;
  }

  return {
    recentDefects: defects.slice(0, 10),
    recentIncidents: incidents.slice(0, 5),
    inspectionHistory: inspections.slice(0, 20),
    summary,
  };
}

/**
 * Génère un prompt pour l'API Perplexity basé sur les données collectées
 */
export function generateDiagnosticPrompt(
  vehicleInfo: { make: string; model: string; year: number; mileage: number },
  defectData: DefectReportData
): string {
  return `Analyser le défaut suivant sur un véhicule commercial:

Véhicule: ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}
Kilométrage: ${vehicleInfo.mileage} km

Catégorie du défaut: ${defectData.defectCategory}
Sévérité: ${defectData.severityLevel}
Description: ${defectData.description}
Localisation: ${defectData.locationOnVehicle}
Action recommandée par le chauffeur: ${defectData.recommendedAction}

Questions:
1. Quelles sont les causes probables de ce défaut?
2. Quels diagnostics supplémentaires sont recommandés?
3. Quelle est l'urgence de la réparation?
4. Quels sont les risques si non réparé?
5. Estimation du coût de réparation (fourchette)?
6. Pièces de rechange probablement nécessaires?`;
}
