/**
 * FleetCore - Types et interfaces
 * 
 * Définitions des types pour la gestion de flotte v1.0
 */

// ============================================================================
// VÉHICULES
// ============================================================================

export type VehicleClass = 'A' | 'B' | 'C' | 'D' | 'E';

/**
 * États avancés des véhicules selon FleetCore v1.0
 */
export type VehicleStatus = 
  | 'active'              // Actif - en circulation
  | 'maintenance'         // En maintenance planifiée
  | 'legally_immobilized' // Immobilisé légalement (défaut bloquant)
  | 'circulation_banned'  // Interdit de circuler (SAAQ)
  | 'retired'             // Retiré de flotte
  | 'inactive';           // Inactif temporairement

/**
 * Types de documents liés aux véhicules
 */
export type VehicleDocumentType = 
  | 'registration'    // Immatriculation
  | 'insurance'       // Assurance
  | 'inspection'      // Rapport d'inspection
  | 'invoice'         // Facture de réparation
  | 'permit'          // Permis spécial
  | 'other';          // Autre document

/**
 * Document lié à un véhicule
 */
export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  localUri?: string;
  mimeType: string;
  fileSize: number;
  expiryDate?: string;
  isExpired?: boolean;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Image de la galerie véhicule
 */
export interface VehicleImage {
  id: string;
  vehicleId: string;
  uri: string;
  localUri?: string;
  thumbnail?: string;
  caption?: string;
  location?: string;
  takenAt: string;
  uploadedBy: string;
  isPrimary: boolean;
}

/**
 * Véhicule avec toutes les informations
 */
export interface Vehicle {
  id: string;
  vin: string;
  plate: string;
  unit: string;
  vehicleClass: VehicleClass;
  make: string;
  model: string;
  year: number;
  companyId: string;
  status: VehicleStatus;
  statusReason?: string;           // Raison du statut (ex: "Défaut freins bloquant")
  statusChangedAt?: string;        // Date du changement de statut
  statusChangedBy?: string;        // Qui a changé le statut
  
  // Informations supplémentaires
  mileage?: number;
  fuelType?: 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'propane' | 'natural_gas';
  color?: string;
  engineType?: string;
  grossWeight?: number;            // PNBV en kg
  
  // Dates importantes
  lastInspectionDate: string | null;
  lastInspectionStatus: InspectionStatus | null;
  nextInspectionDue?: string;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  
  // Galerie et documents (IDs référencés)
  primaryImageId?: string;
  imageCount?: number;
  documentCount?: number;
  
  // Métadonnées
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INSPECTIONS
// ============================================================================

export type InspectionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'INTERRUPTED';
export type InspectionType = 'periodic' | 'pre_trip' | 'post_trip' | 'incident';

/**
 * Version d'une inspection (pour traçabilité légale)
 */
export interface InspectionVersion {
  version: number;
  createdAt: string;
  createdBy: string;
  reason?: string;
  pdfHash?: string;
  pdfUrl?: string;
  snapshot: string; // JSON stringifié de l'état de l'inspection
}

/**
 * Inspection complète avec versioning
 */
export interface Inspection {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  technicianId: string;
  technicianName: string;
  type: InspectionType;
  status: InspectionStatus;
  
  // Versioning pour traçabilité légale
  currentVersion?: number;
  versions?: InspectionVersion[];
  isLocked?: boolean;              // Verrouillé après complétion
  lockedAt?: string;
  lockedBy?: string;
  
  // Progression
  startedAt: string;
  completedAt: string | null;
  interruptedAt?: string;         // Si inspection interrompue
  interruptReason?: string;
  totalItems: number;
  completedItems: number;
  
  // Résultats
  okCount: number;
  minorDefectCount: number;
  majorDefectCount: number;
  blockingDefectCount?: number;   // Défauts bloquants
  
  // Métadonnées
  notes: string | null;
  offlineCreated?: boolean;       // Créé en mode offline
  syncedAt?: string;              // Date de synchronisation
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CHECKLIST ET PREUVES
// ============================================================================

export type ItemStatus = 'pending' | 'ok' | 'minor_defect' | 'major_defect' | 'blocking_defect';

export interface ChecklistItem {
  id: string;
  inspectionId: string;
  sectionId: string;
  sectionName: string;
  itemNumber: number;
  title: string;
  description: string;
  vmrsCode?: string;
  saaqCode?: string;
  locationCode?: string;
  status: ItemStatus;
  notes: string | null;
  mediaUrls: string[];
  proofs?: Proof[];
  minorDefects?: string[];
  majorDefects?: string[];
  blockingDefects?: string[];     // Défauts bloquants
  isRequired: boolean;
  requiresProofIfDefect?: boolean; // Photo obligatoire si défaut
  createdAt: string;
  updatedAt: string;
}

export interface Proof {
  id: string;
  checklistItemId: string;
  type: 'photo' | 'video';
  uri: string;
  localUri?: string;
  thumbnail?: string;
  timestamp: string;
  location?: string;
  notes?: string;
  hash?: string;                  // Hash pour intégrité
  geoLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

// ============================================================================
// AUDIT LOG (TRAÇABILITÉ LÉGALE)
// ============================================================================

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'COMPLETE'
  | 'LOCK'
  | 'UNLOCK'
  | 'APPROVE'
  | 'REJECT'
  | 'EXPORT'
  | 'SYNC'
  | 'STATUS_CHANGE';

export type AuditEntityType = 
  | 'vehicle'
  | 'inspection'
  | 'checklist_item'
  | 'proof'
  | 'document'
  | 'user'
  | 'work_order'
  | 'report';

/**
 * Entrée du journal d'audit immuable
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  
  // Qui
  userId: string;
  userName: string;
  userRole: string;
  
  // Quoi
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  
  // Détails
  description: string;
  previousValue?: string;         // JSON de l'état précédent
  newValue?: string;              // JSON du nouvel état
  metadata?: Record<string, any>;
  
  // Contexte
  isOffline: boolean;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Intégrité
  hash: string;                   // Hash de l'entrée pour intégrité
  previousHash?: string;          // Hash de l'entrée précédente (chaînage)
}

// ============================================================================
// NOTIFICATIONS MÉTIER
// ============================================================================

export type NotificationType = 
  | 'inspection_overdue'          // Inspection en retard
  | 'blocking_defect_unresolved'  // Défaut bloquant non réparé
  | 'vehicle_used_while_blocked'  // Véhicule utilisé malgré blocage
  | 'payment_failed'              // Paiement échoué
  | 'plan_limit_approaching'      // Limite de plan proche
  | 'document_expiring'           // Document qui expire
  | 'maintenance_due'             // Maintenance due
  | 'work_order_assigned'         // Bon de travail assigné
  | 'inspection_completed';       // Inspection terminée

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface BusinessNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  
  // Cible
  userId?: string;
  roleTargets?: string[];         // Rôles ciblés
  
  // Référence
  entityType?: AuditEntityType;
  entityId?: string;
  
  // État
  isRead: boolean;
  readAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  
  createdAt: string;
  expiresAt?: string;
}

// ============================================================================
// RAPPORTS ET MÉTRIQUES
// ============================================================================

export interface ComplianceReport {
  id: string;
  vehicleId?: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  
  // Métriques
  totalInspections: number;
  completedInspections: number;
  blockedInspections: number;
  complianceRate: number;         // Pourcentage 0-100
  
  // Défauts
  totalDefects: number;
  minorDefects: number;
  majorDefects: number;
  blockingDefects: number;
  resolvedDefects: number;
  
  // Temps
  totalDowntimeHours: number;
  averageInspectionTime: number;
  
  // Coûts
  totalMaintenanceCost: number;
  currency: string;
  
  generatedAt: string;
  generatedBy: string;
  pdfUrl?: string;
}

export interface VehicleMetrics {
  vehicleId: string;
  period: '30d' | '90d' | '6m' | '12m';
  
  inspectionCount: number;
  defectCount: number;
  complianceRate: number;
  downtimeHours: number;
  maintenanceCost: number;
  
  // Tendances
  defectTrend: 'improving' | 'stable' | 'worsening';
  costTrend: 'decreasing' | 'stable' | 'increasing';
  
  // Prédictions (IA v1.0)
  predictedNextIssue?: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceLevel: number;        // 0-100
  
  lastUpdated: string;
}

// ============================================================================
// SYNCHRONISATION OFFLINE
// ============================================================================

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: AuditEntityType;
  entityId: string;
  payload: string;                // JSON des données
  
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  
  createdAt: string;
  lastAttemptAt?: string;
  syncedAt?: string;
  errorMessage?: string;
}

export interface SyncState {
  lastSyncAt: string | null;
  pendingActionsCount: number;
  failedActionsCount: number;
  isOnline: boolean;
  isSyncing: boolean;
}

// Fin du fichier types.ts


// ============================================================================
// TYPES ADDITIONNELS (compatibilité)
// ============================================================================

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalInspections?: number;
  inspectionsToday?: number;
  todayInspections?: number;
  pendingInspections?: number;
  inspectionsThisWeek?: number;
  inspectionsLastWeek?: number;
  activeDefects: number;
  minorDefects?: number;
  majorDefects: number;
  complianceScore: number;
  pendingWorkOrders?: number;
  totalMaintenanceCost?: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success' | 'major_defect' | 'blocked_inspection' | 'maintenance_due';
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'warning';
  title: string;
  message: string;
  vehicleId?: string;
  inspectionId?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'inspection' | 'defect' | 'maintenance' | 'document' | 'inspection_started' | 'defect_found' | 'inspection_completed' | 'vehicle_added';
  title: string;
  description: string;
  vehicleId?: string;
  inspectionId?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  vehicleClasses: VehicleClass[];
  sections: ChecklistSection[];
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  items: ChecklistTemplateItem[];
}

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  description: string;
  vmrsCode?: string;
  saaqCode?: string;
  locationCode?: string;
  status?: ItemStatus;
  isRequired: boolean;
  requiresProofIfDefect?: boolean;
  minorDefects?: string[];
  majorDefects?: string[];
  blockingDefects?: string[];
}
