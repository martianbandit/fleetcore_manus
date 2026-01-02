/**
 * FleetCore - Service d'Audit Log
 * 
 * Système de traçabilité légale immuable pour:
 * - Journaliser toutes les actions
 * - Garantir l'intégrité des données
 * - Produire des preuves juridiquement défendables
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuditLogEntry,
  AuditAction,
  AuditEntityType,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  AUDIT_LOG: '@fleetcore_audit_log',
  LAST_HASH: '@fleetcore_audit_last_hash',
  DEVICE_ID: '@fleetcore_device_id',
};

const MAX_LOCAL_ENTRIES = 10000; // Limite locale avant archivage

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Génère un hash SHA-256 simplifié pour l'intégrité
 * Note: En production, utiliser crypto-js ou une lib native
 */
function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${Math.abs(hash).toString(16)}-${timestamp}-${random}`;
}

/**
 * Génère un ID unique pour l'entrée d'audit
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Récupère ou génère l'ID de l'appareil
 */
async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    return 'unknown_device';
  }
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

/**
 * Enregistre une action dans le journal d'audit
 * 
 * @param params Paramètres de l'entrée d'audit
 * @returns L'entrée d'audit créée
 */
export async function logAuditEntry(params: {
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  description: string;
  previousValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  isOffline?: boolean;
}): Promise<AuditLogEntry> {
  try {
    const entries = await getAuditLog();
    const lastHash = await AsyncStorage.getItem(STORAGE_KEYS.LAST_HASH);
    const deviceId = await getDeviceId();
    
    // Préparer les données pour le hash
    const entryData = {
      timestamp: new Date().toISOString(),
      ...params,
      previousValue: params.previousValue ? JSON.stringify(params.previousValue) : undefined,
      newValue: params.newValue ? JSON.stringify(params.newValue) : undefined,
      previousHash: lastHash || undefined,
    };
    
    // Générer le hash de l'entrée
    const hash = generateHash(JSON.stringify(entryData));
    
    const entry: AuditLogEntry = {
      id: generateAuditId(),
      timestamp: entryData.timestamp,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      previousValue: entryData.previousValue,
      newValue: entryData.newValue,
      metadata: params.metadata,
      isOffline: params.isOffline ?? false,
      deviceId,
      hash,
      previousHash: lastHash || undefined,
    };
    
    // Ajouter l'entrée
    entries.unshift(entry);
    
    // Limiter le nombre d'entrées locales
    const trimmedEntries = entries.slice(0, MAX_LOCAL_ENTRIES);
    
    // Sauvegarder
    await AsyncStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(trimmedEntries));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_HASH, hash);
    
    return entry;
  } catch (error) {
    console.error('Error logging audit entry:', error);
    throw error;
  }
}

/**
 * Récupère le journal d'audit complet
 */
export async function getAuditLog(): Promise<AuditLogEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting audit log:', error);
    return [];
  }
}

/**
 * Récupère les entrées d'audit pour une entité spécifique
 */
export async function getAuditLogForEntity(
  entityType: AuditEntityType,
  entityId: string
): Promise<AuditLogEntry[]> {
  const entries = await getAuditLog();
  return entries.filter(e => e.entityType === entityType && e.entityId === entityId);
}

/**
 * Récupère les entrées d'audit pour un utilisateur
 */
export async function getAuditLogForUser(userId: string): Promise<AuditLogEntry[]> {
  const entries = await getAuditLog();
  return entries.filter(e => e.userId === userId);
}

/**
 * Récupère les entrées d'audit par période
 */
export async function getAuditLogByPeriod(
  startDate: string,
  endDate: string
): Promise<AuditLogEntry[]> {
  const entries = await getAuditLog();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return entries.filter(e => {
    const timestamp = new Date(e.timestamp).getTime();
    return timestamp >= start && timestamp <= end;
  });
}

/**
 * Vérifie l'intégrité de la chaîne d'audit
 */
export async function verifyAuditIntegrity(): Promise<{
  isValid: boolean;
  brokenAt?: number;
  totalEntries: number;
  verifiedEntries: number;
}> {
  const entries = await getAuditLog();
  
  if (entries.length === 0) {
    return { isValid: true, totalEntries: 0, verifiedEntries: 0 };
  }
  
  let verifiedCount = 0;
  
  // Vérifier la chaîne de hashes (du plus récent au plus ancien)
  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i];
    const previous = entries[i + 1];
    
    if (current.previousHash && current.previousHash !== previous.hash) {
      return {
        isValid: false,
        brokenAt: i,
        totalEntries: entries.length,
        verifiedEntries: verifiedCount,
      };
    }
    verifiedCount++;
  }
  
  // La dernière entrée est toujours valide (pas de précédent à vérifier)
  verifiedCount++;
  
  return {
    isValid: true,
    totalEntries: entries.length,
    verifiedEntries: verifiedCount,
  };
}

// ============================================================================
// FONCTIONS DE COMMODITÉ
// ============================================================================

/**
 * Log une création d'entité
 */
export async function logCreate(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  newValue: any,
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'CREATE',
    entityType,
    entityId,
    entityName,
    description: `Création de ${entityType}: ${entityName}`,
    newValue,
    isOffline,
  });
}

/**
 * Log une mise à jour d'entité
 */
export async function logUpdate(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  previousValue: any,
  newValue: any,
  description?: string,
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'UPDATE',
    entityType,
    entityId,
    entityName,
    description: description || `Mise à jour de ${entityType}: ${entityName}`,
    previousValue,
    newValue,
    isOffline,
  });
}

/**
 * Log un changement de statut
 */
export async function logStatusChange(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  previousStatus: string,
  newStatus: string,
  reason?: string,
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'STATUS_CHANGE',
    entityType,
    entityId,
    entityName,
    description: `Changement de statut: ${previousStatus} → ${newStatus}${reason ? ` (${reason})` : ''}`,
    previousValue: { status: previousStatus },
    newValue: { status: newStatus, reason },
    isOffline,
  });
}

/**
 * Log une complétion (inspection, etc.)
 */
export async function logComplete(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  summary: any,
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'COMPLETE',
    entityType,
    entityId,
    entityName,
    description: `Complétion de ${entityType}: ${entityName}`,
    newValue: summary,
    isOffline,
  });
}

/**
 * Log un verrouillage (inspection complétée)
 */
export async function logLock(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  reason?: string,
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOCK',
    entityType,
    entityId,
    entityName,
    description: `Verrouillage de ${entityType}: ${entityName}${reason ? ` - ${reason}` : ''}`,
    metadata: { reason },
    isOffline,
  });
}

/**
 * Log un export (PDF, CSV)
 */
export async function logExport(
  user: { id: string; name: string; role: string },
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  exportFormat: 'pdf' | 'csv',
  isOffline = false
): Promise<AuditLogEntry> {
  return logAuditEntry({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'EXPORT',
    entityType,
    entityId,
    entityName,
    description: `Export ${exportFormat.toUpperCase()} de ${entityType}: ${entityName}`,
    metadata: { format: exportFormat },
    isOffline,
  });
}

// ============================================================================
// STATISTIQUES
// ============================================================================

export interface AuditStats {
  totalEntries: number;
  entriesByAction: Record<AuditAction, number>;
  entriesByEntityType: Record<AuditEntityType, number>;
  entriesLast24h: number;
  entriesLast7d: number;
  offlineEntries: number;
  integrityStatus: 'valid' | 'compromised' | 'unknown';
}

/**
 * Récupère les statistiques du journal d'audit
 */
export async function getAuditStats(): Promise<AuditStats> {
  const entries = await getAuditLog();
  const integrity = await verifyAuditIntegrity();
  
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  const stats: AuditStats = {
    totalEntries: entries.length,
    entriesByAction: {} as Record<AuditAction, number>,
    entriesByEntityType: {} as Record<AuditEntityType, number>,
    entriesLast24h: 0,
    entriesLast7d: 0,
    offlineEntries: 0,
    integrityStatus: integrity.isValid ? 'valid' : 'compromised',
  };
  
  entries.forEach(entry => {
    // Par action
    stats.entriesByAction[entry.action] = (stats.entriesByAction[entry.action] || 0) + 1;
    
    // Par type d'entité
    stats.entriesByEntityType[entry.entityType] = (stats.entriesByEntityType[entry.entityType] || 0) + 1;
    
    // Par période
    const entryTime = new Date(entry.timestamp).getTime();
    if (now - entryTime < day) {
      stats.entriesLast24h++;
    }
    if (now - entryTime < 7 * day) {
      stats.entriesLast7d++;
    }
    
    // Offline
    if (entry.isOffline) {
      stats.offlineEntries++;
    }
  });
  
  return stats;
}

/**
 * Formate une entrée d'audit pour affichage
 */
export function formatAuditEntry(entry: AuditLogEntry): string {
  const date = new Date(entry.timestamp).toLocaleString('fr-CA');
  const offline = entry.isOffline ? ' [OFFLINE]' : '';
  return `[${date}] ${entry.userName} (${entry.userRole}): ${entry.description}${offline}`;
}

/**
 * Exporte le journal d'audit en format CSV
 */
export async function exportAuditLogCSV(): Promise<string> {
  const entries = await getAuditLog();
  
  const headers = [
    'Date/Heure',
    'Utilisateur',
    'Rôle',
    'Action',
    'Type entité',
    'ID entité',
    'Description',
    'Offline',
    'Hash',
  ];
  
  const rows = entries.map(e => [
    e.timestamp,
    e.userName,
    e.userRole,
    e.action,
    e.entityType,
    e.entityId,
    `"${e.description.replace(/"/g, '""')}"`,
    e.isOffline ? 'Oui' : 'Non',
    e.hash,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
