/**
 * FleetCore - Service de Rapports et Métriques
 * 
 * Génération de rapports:
 * - Historique inspections par véhicule
 * - Taux de conformité (6/12 mois)
 * - Temps immobilisé cumulé
 * - Coûts de maintenance
 * - Exports PDF et CSV
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Vehicle,
  Inspection,
  ComplianceReport,
  VehicleMetrics,
} from './types';
import { getVehicles, getInspections } from './data-service';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  REPORTS: '@fleetcore_reports',
  METRICS_CACHE: '@fleetcore_metrics_cache',
};

// ============================================================================
// RAPPORTS DE CONFORMITÉ
// ============================================================================

/**
 * Génère un rapport de conformité pour une période
 */
export async function generateComplianceReport(
  companyId: string,
  periodStart: string,
  periodEnd: string,
  vehicleId?: string
): Promise<ComplianceReport> {
  const vehicles = await getVehicles();
  const inspections = await getInspections();
  
  // Filtrer par période
  const startDate = new Date(periodStart).getTime();
  const endDate = new Date(periodEnd).getTime();
  
  let filteredInspections = inspections.filter(i => {
    const inspDate = new Date(i.startedAt).getTime();
    return inspDate >= startDate && inspDate <= endDate;
  });
  
  // Filtrer par véhicule si spécifié
  if (vehicleId) {
    filteredInspections = filteredInspections.filter(i => i.vehicleId === vehicleId);
  }
  
  // Calculer les métriques
  const totalInspections = filteredInspections.length;
  const completedInspections = filteredInspections.filter(i => i.status === 'COMPLETED').length;
  const blockedInspections = filteredInspections.filter(i => i.status === 'BLOCKED').length;
  
  // Calculer les défauts
  let totalDefects = 0;
  let minorDefects = 0;
  let majorDefects = 0;
  let blockingDefects = 0;
  
  filteredInspections.forEach(i => {
    minorDefects += i.minorDefectCount || 0;
    majorDefects += i.majorDefectCount || 0;
    blockingDefects += i.blockingDefectCount || 0;
  });
  totalDefects = minorDefects + majorDefects + blockingDefects;
  
  // Calculer le taux de conformité
  const complianceRate = totalInspections > 0
    ? Math.round((completedInspections / totalInspections) * 100)
    : 100;
  
  // Calculer le temps d'immobilisation (estimation basée sur les inspections bloquées)
  const avgDowntimePerBlocked = 24; // heures estimées
  const totalDowntimeHours = blockedInspections * avgDowntimePerBlocked;
  
  // Temps moyen d'inspection
  const completedWithTime = filteredInspections.filter(i => i.completedAt);
  const avgInspectionTime = completedWithTime.length > 0
    ? completedWithTime.reduce((sum, i) => {
        const start = new Date(i.startedAt).getTime();
        const end = new Date(i.completedAt!).getTime();
        return sum + (end - start) / (1000 * 60); // minutes
      }, 0) / completedWithTime.length
    : 0;
  
  const report: ComplianceReport = {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    vehicleId,
    companyId,
    periodStart,
    periodEnd,
    totalInspections,
    completedInspections,
    blockedInspections,
    complianceRate,
    totalDefects,
    minorDefects,
    majorDefects,
    blockingDefects,
    resolvedDefects: Math.round(totalDefects * 0.7), // Estimation
    totalDowntimeHours,
    averageInspectionTime: Math.round(avgInspectionTime),
    totalMaintenanceCost: 0, // À calculer avec les bons de travail
    currency: 'CAD',
    generatedAt: new Date().toISOString(),
    generatedBy: 'system',
  };
  
  // Sauvegarder le rapport
  await saveReport(report);
  
  return report;
}

/**
 * Sauvegarde un rapport
 */
async function saveReport(report: ComplianceReport): Promise<void> {
  try {
    const reports = await getReports();
    reports.unshift(report);
    
    // Limiter à 100 rapports
    const trimmed = reports.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving report:', error);
  }
}

/**
 * Récupère tous les rapports
 */
export async function getReports(): Promise<ComplianceReport[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
}

/**
 * Récupère un rapport par ID
 */
export async function getReport(id: string): Promise<ComplianceReport | null> {
  const reports = await getReports();
  return reports.find(r => r.id === id) || null;
}

// ============================================================================
// MÉTRIQUES PAR VÉHICULE
// ============================================================================

/**
 * Calcule les métriques pour un véhicule
 */
export async function calculateVehicleMetrics(
  vehicleId: string,
  period: '30d' | '90d' | '6m' | '12m' = '30d'
): Promise<VehicleMetrics> {
  const inspections = await getInspections();
  
  // Calculer la date de début selon la période
  const now = Date.now();
  const periodMs: Record<string, number> = {
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
    '12m': 365 * 24 * 60 * 60 * 1000,
  };
  
  const startDate = now - periodMs[period];
  
  // Filtrer les inspections
  const vehicleInspections = inspections.filter(i => {
    const inspDate = new Date(i.startedAt).getTime();
    return i.vehicleId === vehicleId && inspDate >= startDate;
  });
  
  // Calculer les métriques
  const inspectionCount = vehicleInspections.length;
  const defectCount = vehicleInspections.reduce(
    (sum, i) => sum + (i.minorDefectCount || 0) + (i.majorDefectCount || 0),
    0
  );
  
  const completedCount = vehicleInspections.filter(i => i.status === 'COMPLETED').length;
  const complianceRate = inspectionCount > 0
    ? Math.round((completedCount / inspectionCount) * 100)
    : 100;
  
  // Estimation du temps d'arrêt
  const blockedCount = vehicleInspections.filter(i => i.status === 'BLOCKED').length;
  const downtimeHours = blockedCount * 24;
  
  // Tendances (comparaison avec période précédente)
  const previousStart = startDate - periodMs[period];
  const previousInspections = inspections.filter(i => {
    const inspDate = new Date(i.startedAt).getTime();
    return i.vehicleId === vehicleId && inspDate >= previousStart && inspDate < startDate;
  });
  
  const previousDefects = previousInspections.reduce(
    (sum, i) => sum + (i.minorDefectCount || 0) + (i.majorDefectCount || 0),
    0
  );
  
  let defectTrend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (defectCount < previousDefects * 0.8) defectTrend = 'improving';
  else if (defectCount > previousDefects * 1.2) defectTrend = 'worsening';
  
  // Niveau de risque basé sur les défauts récents
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const recentMajorDefects = vehicleInspections.reduce(
    (sum, i) => sum + (i.majorDefectCount || 0),
    0
  );
  if (recentMajorDefects > 2) riskLevel = 'high';
  else if (recentMajorDefects > 0 || defectCount > 5) riskLevel = 'medium';
  
  return {
    vehicleId,
    period,
    inspectionCount,
    defectCount,
    complianceRate,
    downtimeHours,
    maintenanceCost: 0, // À calculer avec les bons de travail
    defectTrend,
    costTrend: 'stable',
    riskLevel,
    confidenceLevel: inspectionCount > 3 ? 80 : 50,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calcule les métriques pour tous les véhicules
 */
export async function calculateFleetMetrics(
  period: '30d' | '90d' | '6m' | '12m' = '30d'
): Promise<{
  totalVehicles: number;
  activeVehicles: number;
  averageComplianceRate: number;
  totalInspections: number;
  totalDefects: number;
  totalDowntimeHours: number;
  vehiclesAtRisk: number;
  metrics: VehicleMetrics[];
}> {
  const vehicles = await getVehicles();
  const metrics: VehicleMetrics[] = [];
  
  for (const vehicle of vehicles) {
    const vehicleMetrics = await calculateVehicleMetrics(vehicle.id, period);
    metrics.push(vehicleMetrics);
  }
  
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const averageComplianceRate = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.complianceRate, 0) / metrics.length)
    : 100;
  
  return {
    totalVehicles: vehicles.length,
    activeVehicles,
    averageComplianceRate,
    totalInspections: metrics.reduce((sum, m) => sum + m.inspectionCount, 0),
    totalDefects: metrics.reduce((sum, m) => sum + m.defectCount, 0),
    totalDowntimeHours: metrics.reduce((sum, m) => sum + m.downtimeHours, 0),
    vehiclesAtRisk: metrics.filter(m => m.riskLevel === 'high').length,
    metrics,
  };
}

// ============================================================================
// HISTORIQUE DES INSPECTIONS
// ============================================================================

/**
 * Récupère l'historique des inspections pour un véhicule
 */
export async function getInspectionHistory(
  vehicleId: string,
  limit: number = 50
): Promise<{
  inspections: Inspection[];
  summary: {
    total: number;
    completed: number;
    blocked: number;
    averageDefects: number;
    lastInspection: string | null;
  };
}> {
  const inspections = await getInspections();
  
  const vehicleInspections = inspections
    .filter(i => i.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
  
  const completed = vehicleInspections.filter(i => i.status === 'COMPLETED').length;
  const blocked = vehicleInspections.filter(i => i.status === 'BLOCKED').length;
  const totalDefects = vehicleInspections.reduce(
    (sum, i) => sum + (i.minorDefectCount || 0) + (i.majorDefectCount || 0),
    0
  );
  
  return {
    inspections: vehicleInspections,
    summary: {
      total: vehicleInspections.length,
      completed,
      blocked,
      averageDefects: vehicleInspections.length > 0
        ? Math.round(totalDefects / vehicleInspections.length * 10) / 10
        : 0,
      lastInspection: vehicleInspections[0]?.startedAt || null,
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Exporte un rapport en CSV
 */
export function exportReportToCSV(report: ComplianceReport): string {
  const headers = [
    'Période',
    'Inspections totales',
    'Inspections complétées',
    'Inspections bloquées',
    'Taux de conformité (%)',
    'Défauts totaux',
    'Défauts mineurs',
    'Défauts majeurs',
    'Défauts bloquants',
    'Temps d\'arrêt (heures)',
    'Coût maintenance',
  ];
  
  const values = [
    `${report.periodStart} - ${report.periodEnd}`,
    report.totalInspections,
    report.completedInspections,
    report.blockedInspections,
    report.complianceRate,
    report.totalDefects,
    report.minorDefects,
    report.majorDefects,
    report.blockingDefects,
    report.totalDowntimeHours,
    `${report.totalMaintenanceCost} ${report.currency}`,
  ];
  
  return `${headers.join(',')}\n${values.join(',')}`;
}

/**
 * Exporte les métriques de flotte en CSV
 */
export function exportFleetMetricsToCSV(
  metrics: VehicleMetrics[],
  vehicles: Vehicle[]
): string {
  const headers = [
    'Véhicule',
    'Plaque',
    'Période',
    'Inspections',
    'Défauts',
    'Conformité (%)',
    'Temps d\'arrêt (h)',
    'Tendance défauts',
    'Niveau de risque',
  ];
  
  const rows = metrics.map(m => {
    const vehicle = vehicles.find(v => v.id === m.vehicleId);
    return [
      vehicle?.unit || m.vehicleId,
      vehicle?.plate || '',
      m.period,
      m.inspectionCount,
      m.defectCount,
      m.complianceRate,
      m.downtimeHours,
      m.defectTrend,
      m.riskLevel,
    ].join(',');
  });
  
  return `${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Exporte l'historique des inspections en CSV
 */
export function exportInspectionHistoryToCSV(
  inspections: Inspection[],
  vehicle: Vehicle
): string {
  const headers = [
    'Date',
    'Type',
    'Statut',
    'Technicien',
    'Défauts mineurs',
    'Défauts majeurs',
    'Durée (min)',
  ];
  
  const rows = inspections.map(i => {
    const duration = i.completedAt
      ? Math.round((new Date(i.completedAt).getTime() - new Date(i.startedAt).getTime()) / 60000)
      : '';
    
    return [
      new Date(i.startedAt).toLocaleDateString('fr-CA'),
      i.type,
      i.status,
      i.technicianName,
      i.minorDefectCount || 0,
      i.majorDefectCount || 0,
      duration,
    ].join(',');
  });
  
  const header = `Historique des inspections - ${vehicle.unit} (${vehicle.plate})\n`;
  return `${header}${headers.join(',')}\n${rows.join('\n')}`;
}

// ============================================================================
// ANALYSE IA (v1.0 - Règles simples)
// ============================================================================

/**
 * Analyse la récurrence des défauts
 */
export async function analyzeDefectRecurrence(
  vehicleId: string
): Promise<{
  recurringDefects: Array<{
    category: string;
    count: number;
    lastOccurrence: string;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  recommendations: string[];
  confidence: number;
}> {
  const { inspections } = await getInspectionHistory(vehicleId, 20);
  
  // Simuler l'analyse (en production, analyser les vrais défauts)
  const hasFrequentIssues = inspections.filter(i => 
    (i.majorDefectCount || 0) > 0
  ).length > 3;
  
  const recommendations: string[] = [];
  if (hasFrequentIssues) {
    recommendations.push('Inspection approfondie du système de freinage recommandée');
    recommendations.push('Vérifier l\'historique de maintenance préventive');
  }
  
  return {
    recurringDefects: hasFrequentIssues ? [
      {
        category: 'Freinage',
        count: 3,
        lastOccurrence: inspections[0]?.startedAt || new Date().toISOString(),
        trend: 'stable',
      },
    ] : [],
    recommendations,
    confidence: inspections.length > 5 ? 75 : 50,
  };
}

/**
 * Estime la durée d'une inspection basée sur l'historique
 */
export async function estimateInspectionDuration(
  vehicleId: string,
  inspectionType: string
): Promise<{
  estimatedMinutes: number;
  confidence: number;
  basedOn: number;
  source: string;
}> {
  const { inspections } = await getInspectionHistory(vehicleId, 10);
  
  const sameTypeInspections = inspections.filter(i => 
    i.type === inspectionType && i.completedAt
  );
  
  if (sameTypeInspections.length === 0) {
    return {
      estimatedMinutes: 45, // Valeur par défaut
      confidence: 30,
      basedOn: 0,
      source: 'Estimation par défaut',
    };
  }
  
  const durations = sameTypeInspections.map(i => {
    const start = new Date(i.startedAt).getTime();
    const end = new Date(i.completedAt!).getTime();
    return (end - start) / 60000;
  });
  
  const avgDuration = Math.round(
    durations.reduce((a, b) => a + b, 0) / durations.length
  );
  
  return {
    estimatedMinutes: avgDuration,
    confidence: Math.min(90, 50 + sameTypeInspections.length * 10),
    basedOn: sameTypeInspections.length,
    source: `Historique de ${sameTypeInspections.length} inspections similaires`,
  };
}
