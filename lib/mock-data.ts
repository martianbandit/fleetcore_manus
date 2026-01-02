// FleetCore - Données mock pour le développement

import type {
  Vehicle,
  Inspection,
  ChecklistItem,
  DashboardStats,
  Alert,
  RecentActivity,
  ChecklistTemplate,
} from './types';

// Véhicules mock
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    vin: '1HGBH41JXMN109186',
    plate: 'ABC-1234',
    unit: 'U-001',
    vehicleClass: 'C',
    make: 'Kenworth',
    model: 'T680',
    year: 2022,
    companyId: 'c1',
    status: 'active',
    lastInspectionDate: '2024-12-20',
    lastInspectionStatus: 'COMPLETED',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
  },
  {
    id: 'v2',
    vin: '2HGBH41JXMN109187',
    plate: 'DEF-5678',
    unit: 'U-002',
    vehicleClass: 'B',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2021,
    companyId: 'c1',
    status: 'active',
    lastInspectionDate: '2024-12-18',
    lastInspectionStatus: 'BLOCKED',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
  },
  {
    id: 'v3',
    vin: '3HGBH41JXMN109188',
    plate: 'GHI-9012',
    unit: 'U-003',
    vehicleClass: 'D',
    make: 'Peterbilt',
    model: '579',
    year: 2023,
    companyId: 'c1',
    status: 'maintenance',
    lastInspectionDate: '2024-12-15',
    lastInspectionStatus: 'COMPLETED',
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
  },
  {
    id: 'v4',
    vin: '4HGBH41JXMN109189',
    plate: 'JKL-3456',
    unit: 'U-004',
    vehicleClass: 'C',
    make: 'Volvo',
    model: 'VNL 860',
    year: 2022,
    companyId: 'c1',
    status: 'active',
    lastInspectionDate: '2024-12-22',
    lastInspectionStatus: 'COMPLETED',
    createdAt: '2024-04-05T14:00:00Z',
    updatedAt: '2024-12-22T11:15:00Z',
  },
  {
    id: 'v5',
    vin: '5HGBH41JXMN109190',
    plate: 'MNO-7890',
    unit: 'U-005',
    vehicleClass: 'A',
    make: 'Mack',
    model: 'Anthem',
    year: 2020,
    companyId: 'c1',
    status: 'inactive',
    lastInspectionDate: '2024-11-30',
    lastInspectionStatus: 'COMPLETED',
    createdAt: '2024-05-12T09:45:00Z',
    updatedAt: '2024-11-30T15:30:00Z',
  },
];

// Inspections mock
export const mockInspections: Inspection[] = [
  {
    id: 'i1',
    vehicleId: 'v1',
    technicianId: 't1',
    technicianName: 'Jean Tremblay',
    type: 'periodic',
    status: 'COMPLETED',
    startedAt: '2024-12-20T08:00:00Z',
    completedAt: '2024-12-20T10:30:00Z',
    totalItems: 45,
    completedItems: 45,
    okCount: 43,
    minorDefectCount: 2,
    majorDefectCount: 0,
    notes: 'Inspection périodique complétée. Deux défauts mineurs identifiés.',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
  },
  {
    id: 'i2',
    vehicleId: 'v2',
    technicianId: 't1',
    technicianName: 'Jean Tremblay',
    type: 'pre_trip',
    status: 'BLOCKED',
    startedAt: '2024-12-18T14:00:00Z',
    completedAt: null,
    totalItems: 45,
    completedItems: 38,
    okCount: 35,
    minorDefectCount: 2,
    majorDefectCount: 1,
    notes: 'Défaut majeur sur le système de freinage.',
    createdAt: '2024-12-18T14:00:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
  },
  {
    id: 'i3',
    vehicleId: 'v4',
    technicianId: 't2',
    technicianName: 'Marie Lavoie',
    type: 'periodic',
    status: 'IN_PROGRESS',
    startedAt: '2024-12-25T09:00:00Z',
    completedAt: null,
    totalItems: 45,
    completedItems: 22,
    okCount: 20,
    minorDefectCount: 2,
    majorDefectCount: 0,
    notes: null,
    createdAt: '2024-12-25T09:00:00Z',
    updatedAt: '2024-12-25T11:00:00Z',
  },
  {
    id: 'i4',
    vehicleId: 'v3',
    technicianId: 't2',
    technicianName: 'Marie Lavoie',
    type: 'post_trip',
    status: 'COMPLETED',
    startedAt: '2024-12-15T16:00:00Z',
    completedAt: '2024-12-15T17:30:00Z',
    totalItems: 45,
    completedItems: 45,
    okCount: 45,
    minorDefectCount: 0,
    majorDefectCount: 0,
    notes: 'Véhicule en parfait état.',
    createdAt: '2024-12-15T16:00:00Z',
    updatedAt: '2024-12-15T17:30:00Z',
  },
  {
    id: 'i5',
    vehicleId: 'v1',
    technicianId: 't1',
    technicianName: 'Jean Tremblay',
    type: 'pre_trip',
    status: 'DRAFT',
    startedAt: '2024-12-25T07:00:00Z',
    completedAt: null,
    totalItems: 45,
    completedItems: 0,
    okCount: 0,
    minorDefectCount: 0,
    majorDefectCount: 0,
    notes: null,
    createdAt: '2024-12-25T07:00:00Z',
    updatedAt: '2024-12-25T07:00:00Z',
  },
];

// Statistiques du tableau de bord
export const mockDashboardStats: DashboardStats = {
  totalVehicles: 5,
  activeVehicles: 3,
  todayInspections: 2,
  pendingInspections: 1,
  activeDefects: 5,
  minorDefects: 4,
  majorDefects: 1,
  complianceScore: 87,
  inspectionsThisWeek: 8,
  inspectionsLastWeek: 12,
};

// Alertes
export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'major_defect',
    severity: 'critical',
    title: 'Défaut majeur - Freinage',
    message: 'Véhicule U-002 (DEF-5678) - Système de freinage défaillant',
    vehicleId: 'v2',
    inspectionId: 'i2',
    createdAt: '2024-12-18T16:45:00Z',
  },
  {
    id: 'a2',
    type: 'blocked_inspection',
    severity: 'critical',
    title: 'Inspection bloquée',
    message: 'L\'inspection du véhicule U-002 est bloquée en raison d\'un défaut majeur',
    vehicleId: 'v2',
    inspectionId: 'i2',
    createdAt: '2024-12-18T16:45:00Z',
  },
  {
    id: 'a3',
    type: 'maintenance_due',
    severity: 'warning',
    title: 'Maintenance requise',
    message: 'Véhicule U-003 (GHI-9012) - Maintenance préventive à planifier',
    vehicleId: 'v3',
    createdAt: '2024-12-20T08:00:00Z',
  },
];

// Activité récente
export const mockRecentActivity: RecentActivity[] = [
  {
    id: 'ra1',
    type: 'inspection_started',
    title: 'Inspection démarrée',
    description: 'Inspection périodique - U-004 (JKL-3456)',
    timestamp: '2024-12-25T09:00:00Z',
    vehicleId: 'v4',
    inspectionId: 'i3',
  },
  {
    id: 'ra2',
    type: 'defect_found',
    title: 'Défaut majeur détecté',
    description: 'Système de freinage - U-002 (DEF-5678)',
    timestamp: '2024-12-18T16:45:00Z',
    vehicleId: 'v2',
    inspectionId: 'i2',
  },
  {
    id: 'ra3',
    type: 'inspection_completed',
    title: 'Inspection complétée',
    description: 'Inspection périodique - U-001 (ABC-1234)',
    timestamp: '2024-12-20T10:30:00Z',
    vehicleId: 'v1',
    inspectionId: 'i1',
  },
  {
    id: 'ra4',
    type: 'inspection_completed',
    title: 'Inspection complétée',
    description: 'Inspection post-trajet - U-003 (GHI-9012)',
    timestamp: '2024-12-15T17:30:00Z',
    vehicleId: 'v3',
    inspectionId: 'i4',
  },
  {
    id: 'ra5',
    type: 'vehicle_added',
    title: 'Nouveau véhicule',
    description: 'Volvo VNL 860 ajouté à la flotte',
    timestamp: '2024-04-05T14:00:00Z',
    vehicleId: 'v4',
  },
];

// Charger la checklist complète depuis le fichier JSON généré
import checklistData from '../data/checklist-complete.json';

/**
 * Checklist d'inspection Pré-SAAQ complète
 * 
 * Générée depuis le guide officiel de vérification mécanique SAAQ
 * - 9 sections
 * - 305 composants à vérifier
 * - 420 défauts répertoriés (mineurs et majeurs)
 */
export const INSPECTION_CHECKLIST: ChecklistItem[] = (checklistData as any[]).map((item: any) => ({
  id: item.id,
  inspectionId: '',
  sectionId: item.section.toLowerCase().replace(/ /g, '-'),
  sectionName: item.section,
  itemNumber: parseInt(item.id.split('-')[1]),
  title: item.component,
  description: item.description,
  status: 'pending' as const,
  notes: null,
  mediaUrls: [],
  isRequired: true,
  minorDefects: item.minorDefects || [],
  majorDefects: item.majorDefects || [],
  vmrsCode: item.vmrsCode || '',
  locationCode: item.locationCode || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * Obtenir les items de checklist par section
 */
export function getChecklistBySection(section: string): ChecklistItem[] {
  return INSPECTION_CHECKLIST.filter(item => item.sectionName === section);
}

/**
 * Obtenir toutes les sections uniques
 */
export function getAllSections(): string[] {
  const sections = new Set(INSPECTION_CHECKLIST.map(item => item.sectionName));
  return Array.from(sections);
}

/**
 * Statistiques de la checklist
 */
export const CHECKLIST_STATS = {
  totalItems: INSPECTION_CHECKLIST.length,
  sections: getAllSections().length,
  totalMinorDefects: INSPECTION_CHECKLIST.reduce((sum, item) => sum + ((item.minorDefects as any[])?.length || 0), 0),
  totalMajorDefects: INSPECTION_CHECKLIST.reduce((sum, item) => sum + ((item.majorDefects as any[])?.length || 0), 0),
};

console.log('📋 Checklist SAAQ chargée:', CHECKLIST_STATS);

// Template de checklist SAAQ (conservé pour compatibilité)
export const mockChecklistTemplate: ChecklistTemplate = {
  id: 'ct1',
  name: 'Inspection SAAQ - Véhicule lourd',
  vehicleClasses: ['A', 'B', 'C', 'D', 'E'],
  sections: [
    {
      id: 's1',
      name: 'Système de freinage',
      order: 1,
      items: [
        { id: 's1i1', title: 'Pédale de frein', description: 'Vérifier la course et la résistance de la pédale', isRequired: true },
        { id: 's1i2', title: 'Frein de stationnement', description: 'Vérifier le fonctionnement du frein de stationnement', isRequired: true },
        { id: 's1i3', title: 'Plaquettes de frein', description: 'Vérifier l\'usure des plaquettes', isRequired: true },
        { id: 's1i4', title: 'Disques de frein', description: 'Vérifier l\'état des disques', isRequired: true },
        { id: 's1i5', title: 'Flexibles de frein', description: 'Vérifier l\'état des flexibles', isRequired: true },
      ],
    },
    {
      id: 's2',
      name: 'Direction',
      order: 2,
      items: [
        { id: 's2i1', title: 'Volant', description: 'Vérifier le jeu du volant', isRequired: true },
        { id: 's2i2', title: 'Colonne de direction', description: 'Vérifier la fixation et l\'état', isRequired: true },
        { id: 's2i3', title: 'Biellettes', description: 'Vérifier l\'état des biellettes de direction', isRequired: true },
        { id: 's2i4', title: 'Rotules', description: 'Vérifier l\'état des rotules', isRequired: true },
      ],
    },
    {
      id: 's3',
      name: 'Éclairage',
      order: 3,
      items: [
        { id: 's3i1', title: 'Phares avant', description: 'Vérifier le fonctionnement des phares', isRequired: true },
        { id: 's3i2', title: 'Feux arrière', description: 'Vérifier le fonctionnement des feux arrière', isRequired: true },
        { id: 's3i3', title: 'Clignotants', description: 'Vérifier tous les clignotants', isRequired: true },
        { id: 's3i4', title: 'Feux de freinage', description: 'Vérifier les feux de freinage', isRequired: true },
        { id: 's3i5', title: 'Feux de gabarit', description: 'Vérifier les feux de gabarit', isRequired: true },
      ],
    },
    {
      id: 's4',
      name: 'Pneumatiques',
      order: 4,
      items: [
        { id: 's4i1', title: 'Pression des pneus', description: 'Vérifier la pression de tous les pneus', isRequired: true },
        { id: 's4i2', title: 'Usure des pneus', description: 'Vérifier l\'usure et la profondeur des sculptures', isRequired: true },
        { id: 's4i3', title: 'État des flancs', description: 'Vérifier l\'absence de coupures ou hernies', isRequired: true },
        { id: 's4i4', title: 'Roue de secours', description: 'Vérifier la présence et l\'état de la roue de secours', isRequired: false },
      ],
    },
    {
      id: 's5',
      name: 'Suspension',
      order: 5,
      items: [
        { id: 's5i1', title: 'Amortisseurs', description: 'Vérifier l\'état des amortisseurs', isRequired: true },
        { id: 's5i2', title: 'Ressorts', description: 'Vérifier l\'état des ressorts', isRequired: true },
        { id: 's5i3', title: 'Silentblocs', description: 'Vérifier l\'état des silentblocs', isRequired: true },
      ],
    },
    {
      id: 's6',
      name: 'Moteur et transmission',
      order: 6,
      items: [
        { id: 's6i1', title: 'Niveau d\'huile moteur', description: 'Vérifier le niveau d\'huile', isRequired: true },
        { id: 's6i2', title: 'Niveau de liquide de refroidissement', description: 'Vérifier le niveau de liquide', isRequired: true },
        { id: 's6i3', title: 'Courroies', description: 'Vérifier l\'état et la tension des courroies', isRequired: true },
        { id: 's6i4', title: 'Fuites', description: 'Vérifier l\'absence de fuites', isRequired: true },
      ],
    },
    {
      id: 's7',
      name: 'Carrosserie et châssis',
      order: 7,
      items: [
        { id: 's7i1', title: 'État de la carrosserie', description: 'Vérifier l\'état général de la carrosserie', isRequired: true },
        { id: 's7i2', title: 'Rétroviseurs', description: 'Vérifier l\'état et le réglage des rétroviseurs', isRequired: true },
        { id: 's7i3', title: 'Pare-brise', description: 'Vérifier l\'état du pare-brise', isRequired: true },
        { id: 's7i4', title: 'Essuie-glaces', description: 'Vérifier le fonctionnement des essuie-glaces', isRequired: true },
      ],
    },
    {
      id: 's8',
      name: 'Équipements de sécurité',
      order: 8,
      items: [
        { id: 's8i1', title: 'Extincteur', description: 'Vérifier la présence et la validité de l\'extincteur', isRequired: true },
        { id: 's8i2', title: 'Triangle de signalisation', description: 'Vérifier la présence des triangles', isRequired: true },
        { id: 's8i3', title: 'Trousse de premiers soins', description: 'Vérifier la présence de la trousse', isRequired: true },
        { id: 's8i4', title: 'Ceintures de sécurité', description: 'Vérifier l\'état des ceintures', isRequired: true },
      ],
    },
  ],
};

// Items de checklist pour une inspection en cours
export const mockChecklistItems: ChecklistItem[] = mockChecklistTemplate.sections.flatMap((section, sectionIndex) =>
  section.items.map((item, itemIndex) => ({
    id: `cli-${section.id}-${item.id}`,
    inspectionId: 'i3',
    sectionId: section.id,
    sectionName: section.name,
    itemNumber: sectionIndex * 10 + itemIndex + 1,
    title: item.title,
    description: item.description,
    status: itemIndex < 3 && sectionIndex < 3 ? 'ok' : 'pending',
    notes: null,
    mediaUrls: [],
    isRequired: item.isRequired,
    createdAt: '2024-12-25T09:00:00Z',
    updatedAt: '2024-12-25T09:00:00Z',
  }))
);
