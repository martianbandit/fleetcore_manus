/**
 * FleetCore - Service de Synchronisation Offline
 * 
 * Gestion du mode terrain et résilience:
 * - File d'actions en attente
 * - Synchronisation automatique
 * - Autosave et récupération
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// NetInfo sera importé dynamiquement pour éviter les erreurs de build
// import NetInfo from '@react-native-community/netinfo';
import type { PendingAction, SyncState, AuditEntityType } from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const STORAGE_KEYS = {
  PENDING_ACTIONS: '@fleetcore_pending_actions',
  SYNC_STATE: '@fleetcore_sync_state',
  AUTOSAVE_DATA: '@fleetcore_autosave',
  INTERRUPTED_INSPECTIONS: '@fleetcore_interrupted_inspections',
};

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 secondes

// ============================================================================
// ÉTAT DE SYNCHRONISATION
// ============================================================================

let syncInterval: ReturnType<typeof setInterval> | null = null;
let isOnline = true;

/**
 * Initialise le service de synchronisation
 */
export async function initSyncService(): Promise<void> {
  // Pour le web, on utilise navigator.onLine
  // Pour le natif, on utiliserait NetInfo
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      const wasOffline = !isOnline;
      isOnline = true;
      if (wasOffline) {
        console.log('[Sync] Connexion rétablie, synchronisation...');
        syncPendingActions();
      }
    });
    window.addEventListener('offline', () => {
      isOnline = false;
    });
    isOnline = navigator.onLine;
  }
  
  // Démarrer la synchronisation périodique
  startPeriodicSync();
}

/**
 * Démarre la synchronisation périodique
 */
export function startPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(async () => {
    if (isOnline) {
      await syncPendingActions();
    }
  }, SYNC_INTERVAL);
}

/**
 * Arrête la synchronisation périodique
 */
export function stopPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Récupère l'état de synchronisation
 */
export async function getSyncState(): Promise<SyncState> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_STATE);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error getting sync state:', error);
  }
  
  return {
    lastSyncAt: null,
    pendingActionsCount: 0,
    failedActionsCount: 0,
    isOnline,
    isSyncing: false,
  };
}

/**
 * Met à jour l'état de synchronisation
 */
async function updateSyncState(updates: Partial<SyncState>): Promise<void> {
  const current = await getSyncState();
  const newState = { ...current, ...updates, isOnline };
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(newState));
}

// ============================================================================
// FILE D'ACTIONS EN ATTENTE
// ============================================================================

/**
 * Ajoute une action à la file d'attente
 */
export async function queueAction(
  type: 'create' | 'update' | 'delete',
  entityType: AuditEntityType,
  entityId: string,
  payload: any
): Promise<PendingAction> {
  const actions = await getPendingActions();
  
  const action: PendingAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    entityType,
    entityId,
    payload: JSON.stringify(payload),
    status: 'pending',
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    createdAt: new Date().toISOString(),
  };
  
  actions.push(action);
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
  await updateSyncState({ pendingActionsCount: actions.length });
  
  // Si en ligne, tenter de synchroniser immédiatement
  if (isOnline) {
    syncPendingActions();
  }
  
  return action;
}

/**
 * Récupère toutes les actions en attente
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
}

/**
 * Synchronise les actions en attente
 */
export async function syncPendingActions(): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  if (!isOnline) {
    return { synced: 0, failed: 0, remaining: (await getPendingActions()).length };
  }
  
  await updateSyncState({ isSyncing: true });
  
  const actions = await getPendingActions();
  let synced = 0;
  let failed = 0;
  const remaining: PendingAction[] = [];
  
  for (const action of actions) {
    if (action.status === 'synced') {
      continue;
    }
    
    try {
      // Simuler l'envoi au serveur
      // En production, remplacer par un vrai appel API
      await simulateSyncAction(action);
      
      action.status = 'synced';
      action.syncedAt = new Date().toISOString();
      synced++;
    } catch (error) {
      action.retryCount++;
      action.lastAttemptAt = new Date().toISOString();
      action.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (action.retryCount >= action.maxRetries) {
        action.status = 'failed';
        failed++;
      } else {
        action.status = 'pending';
        remaining.push(action);
      }
    }
  }
  
  // Garder seulement les actions non synchronisées
  const unsyncedActions = actions.filter(a => a.status !== 'synced');
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(unsyncedActions));
  
  await updateSyncState({
    lastSyncAt: new Date().toISOString(),
    pendingActionsCount: remaining.length,
    failedActionsCount: failed,
    isSyncing: false,
  });
  
  return { synced, failed, remaining: remaining.length };
}

/**
 * Simule la synchronisation d'une action (à remplacer par l'API réelle)
 */
async function simulateSyncAction(action: PendingAction): Promise<void> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // En production, envoyer au serveur
  console.log(`[Sync] Action ${action.type} sur ${action.entityType}:${action.entityId}`);
}

/**
 * Réessaie les actions échouées
 */
export async function retryFailedActions(): Promise<number> {
  const actions = await getPendingActions();
  let resetCount = 0;
  
  for (const action of actions) {
    if (action.status === 'failed') {
      action.status = 'pending';
      action.retryCount = 0;
      action.errorMessage = undefined;
      resetCount++;
    }
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(actions));
  
  if (resetCount > 0 && isOnline) {
    syncPendingActions();
  }
  
  return resetCount;
}

// ============================================================================
// AUTOSAVE ET RÉCUPÉRATION
// ============================================================================

interface AutosaveData {
  id: string;
  type: 'inspection' | 'work_order' | 'vehicle';
  data: any;
  savedAt: string;
  isRecoverable: boolean;
}

/**
 * Sauvegarde automatique des données
 */
export async function autosave(
  type: 'inspection' | 'work_order' | 'vehicle',
  id: string,
  data: any
): Promise<void> {
  try {
    const autosaves = await getAutosaveData();
    
    const existingIndex = autosaves.findIndex(a => a.id === id && a.type === type);
    const autosaveEntry: AutosaveData = {
      id,
      type,
      data,
      savedAt: new Date().toISOString(),
      isRecoverable: true,
    };
    
    if (existingIndex >= 0) {
      autosaves[existingIndex] = autosaveEntry;
    } else {
      autosaves.push(autosaveEntry);
    }
    
    // Limiter à 50 autosaves
    const trimmed = autosaves.slice(-50);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTOSAVE_DATA, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error autosaving:', error);
  }
}

/**
 * Récupère les données autosauvegardées
 */
export async function getAutosaveData(): Promise<AutosaveData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTOSAVE_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting autosave data:', error);
    return [];
  }
}

/**
 * Récupère une sauvegarde spécifique
 */
export async function getAutosave(
  type: 'inspection' | 'work_order' | 'vehicle',
  id: string
): Promise<AutosaveData | null> {
  const autosaves = await getAutosaveData();
  return autosaves.find(a => a.id === id && a.type === type) || null;
}

/**
 * Supprime une sauvegarde
 */
export async function clearAutosave(
  type: 'inspection' | 'work_order' | 'vehicle',
  id: string
): Promise<void> {
  const autosaves = await getAutosaveData();
  const filtered = autosaves.filter(a => !(a.id === id && a.type === type));
  await AsyncStorage.setItem(STORAGE_KEYS.AUTOSAVE_DATA, JSON.stringify(filtered));
}

// ============================================================================
// INSPECTIONS INTERROMPUES
// ============================================================================

interface InterruptedInspection {
  inspectionId: string;
  vehicleId: string;
  vehiclePlate: string;
  progress: number;
  interruptedAt: string;
  reason?: string;
  canResume: boolean;
}

/**
 * Marque une inspection comme interrompue
 */
export async function markInspectionInterrupted(
  inspectionId: string,
  vehicleId: string,
  vehiclePlate: string,
  progress: number,
  reason?: string
): Promise<void> {
  const interrupted = await getInterruptedInspections();
  
  const entry: InterruptedInspection = {
    inspectionId,
    vehicleId,
    vehiclePlate,
    progress,
    interruptedAt: new Date().toISOString(),
    reason,
    canResume: true,
  };
  
  // Remplacer si existe déjà
  const existingIndex = interrupted.findIndex(i => i.inspectionId === inspectionId);
  if (existingIndex >= 0) {
    interrupted[existingIndex] = entry;
  } else {
    interrupted.push(entry);
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.INTERRUPTED_INSPECTIONS, JSON.stringify(interrupted));
}

/**
 * Récupère les inspections interrompues
 */
export async function getInterruptedInspections(): Promise<InterruptedInspection[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INTERRUPTED_INSPECTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting interrupted inspections:', error);
    return [];
  }
}

/**
 * Marque une inspection comme reprise
 */
export async function markInspectionResumed(inspectionId: string): Promise<void> {
  const interrupted = await getInterruptedInspections();
  const filtered = interrupted.filter(i => i.inspectionId !== inspectionId);
  await AsyncStorage.setItem(STORAGE_KEYS.INTERRUPTED_INSPECTIONS, JSON.stringify(filtered));
}

/**
 * Vérifie si une inspection est interrompue
 */
export async function isInspectionInterrupted(inspectionId: string): Promise<boolean> {
  const interrupted = await getInterruptedInspections();
  return interrupted.some(i => i.inspectionId === inspectionId);
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Vérifie si l'appareil est en ligne
 */
export function isDeviceOnline(): boolean {
  return isOnline;
}

/**
 * Force une vérification de connectivité
 */
export async function checkConnectivity(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    isOnline = navigator.onLine;
  }
  return isOnline;
}

/**
 * Nettoie les anciennes données de synchronisation
 */
export async function cleanupOldSyncData(daysOld: number = 30): Promise<number> {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  let cleaned = 0;
  
  // Nettoyer les autosaves
  const autosaves = await getAutosaveData();
  const recentAutosaves = autosaves.filter(a => {
    const savedAt = new Date(a.savedAt).getTime();
    if (savedAt < cutoff) {
      cleaned++;
      return false;
    }
    return true;
  });
  await AsyncStorage.setItem(STORAGE_KEYS.AUTOSAVE_DATA, JSON.stringify(recentAutosaves));
  
  // Nettoyer les actions synchronisées
  const actions = await getPendingActions();
  const recentActions = actions.filter(a => {
    if (a.status === 'synced' && a.syncedAt) {
      const syncedAt = new Date(a.syncedAt).getTime();
      if (syncedAt < cutoff) {
        cleaned++;
        return false;
      }
    }
    return true;
  });
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(recentActions));
  
  return cleaned;
}
