/**
 * Service PEP - Fiche d'entretien préventif SAAQ
 * Formulaire officiel 6609 30 (2025-01)
 * Réservé aux plans Plus, Pro et Entreprise
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type DefectType = 'Mineure' | 'Majeure';
export type ComponentStatus = 'SO' | 'C' | 'Min' | 'Maj';

export interface PEPComponent {
  code: number;
  name: string;
  status: ComponentStatus;
  defectCode?: string;
  measure?: number;
  measureUnit?: string;
  location?: number; // Position sur le diagramme
}

export interface PEPSection {
  id: string;
  title: string;
  components: PEPComponent[];
}

export interface PEPVehicleInfo {
  plateNumber: string;
  pnbv: number; // kg
  make: string;
  year: number;
  reason: string;
  vin: string;
  model: string;
  odometer: number;
  odometerUnit: 'km' | 'mi';
}

export interface PEPForm {
  id: string;
  vehicleId: string;
  vehicleInfo: PEPVehicleInfo;
  sections: PEPSection[];
  remarks: string;
  mechanicSignature?: string;
  mechanicNumber: string;
  mechanicName: string;
  inspectionDate: string;
  nextMaintenanceDate: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'signed';
  totalMinorDefects: number;
  totalMajorDefects: number;
}

export interface PEPDefect {
  component: string;
  description: string;
  type: DefectType;
}

export interface PEPDefectSection {
  title: string;
  id: string;
  defects: PEPDefect[];
}

// Constantes
const PEP_FORMS_KEY = 'fleetcore_pep_forms';

// Structure des sections PEP selon le formulaire SAAQ
export const PEP_SECTIONS: Omit<PEPSection, 'components'>[] = [
  { id: 'eclairage', title: 'Éclairage et signalisation' },
  { id: 'suspension', title: 'Suspension' },
  { id: 'pneus', title: 'Pneus - Roues' },
  { id: 'freins', title: 'Freins' },
  { id: 'attelage', title: 'Dispositif d\'attelage' },
  { id: 'cadre', title: 'Cadre/Dessous de caisse' },
  { id: 'carburant', title: 'Alimentation en carburant' },
  { id: 'carrosserie', title: 'Carrosserie' },
  { id: 'vitrage', title: 'Vitrage et rétroviseurs' },
  { id: 'chargement', title: 'Espace de chargement' },
  { id: 'direction', title: 'Direction' },
  { id: 'echappement', title: 'Échappement' },
  { id: 'accessoires', title: 'Accessoires' },
];

// Composants par section avec codes officiels SAAQ
export const PEP_COMPONENTS: Record<string, { code: number; name: string }[]> = {
  eclairage: [
    { code: 24, name: 'Batterie' },
    { code: 21, name: 'Câble électrique' },
    { code: 23, name: 'Couvercle du coffre à batterie' },
    { code: 7, name: 'Feu changement de direction' },
    { code: 10, name: 'Feu d\'identification' },
    { code: 12, name: 'Feu de détresse' },
    { code: 11, name: 'Feu de freinage' },
    { code: 9, name: 'Feu de gabarit' },
    { code: 3, name: 'Feu de jour' },
    { code: 15, name: 'Feu de plaque d\'immatriculation' },
    { code: 6, name: 'Feu de position' },
    { code: 14, name: 'Feu de recul' },
    { code: 25, name: 'Fiche/Raccord/Prise de courant' },
    { code: 19, name: 'Interrupteur' },
    { code: 5, name: 'Lampe témoin' },
    { code: 22, name: 'Lentille' },
    { code: 16, name: 'Lumière d\'éclairage du tableau de bord' },
    { code: 20, name: 'Matériau réfléchissant' },
    { code: 2, name: 'Phare de croisement' },
    { code: 1, name: 'Phare de route' },
    { code: 8, name: 'Réflecteur' },
  ],
  suspension: [
    { code: 77, name: 'Amortisseur' },
    { code: 86, name: 'Ancrage' },
    { code: 103, name: 'Bague d\'ancrage (coussinet)' },
    { code: 87, name: 'Balancier' },
    { code: 88, name: 'Ballon de suspension' },
    { code: 78, name: 'Barre de torsion' },
    { code: 79, name: 'Barre stabilisatrice' },
    { code: 82, name: 'Bielle de réaction' },
    { code: 76, name: 'Biellette de raccordement' },
    { code: 80, name: 'Bras de suspension' },
    { code: 90, name: 'Bride de fixation' },
    { code: 96, name: 'Butée de débattement' },
    { code: 105, name: 'Canalisation' },
    { code: 91, name: 'Châsse de balancier' },
    { code: 85, name: 'Coussin de caoutchouc' },
    { code: 94, name: 'Élément de fixation' },
    { code: 81, name: 'Essieu' },
    { code: 102, name: 'Étrier de lames' },
    { code: 98, name: 'Jambe de force (MacPherson)' },
    { code: 92, name: 'Jumelles' },
    { code: 83, name: 'Lame de ressort' },
    { code: 104, name: 'Lame en composite' },
    { code: 93, name: 'Lame maîtresse' },
    { code: 106, name: 'Raccord' },
    { code: 75, name: 'Ressort hélicoïdal' },
    { code: 97, name: 'Soupape de niveau' },
    { code: 95, name: 'Support de ressort à lames' },
    { code: 74, name: 'Suspension' },
    { code: 84, name: 'Suspension pneumatique' },
  ],
  pneus: [
    { code: 273, name: 'Boulon/Goujon/Écrou' },
    { code: 279, name: 'Cerceau de fixation (roue multipièces)' },
    { code: 270, name: 'Chapeau de moyeu' },
    { code: 280, name: 'Entretoise' },
    { code: 281, name: 'Jante' },
    { code: 277, name: 'Pièces de fixation' },
    { code: 275, name: 'Pneu' },
    { code: 272, name: 'Roue' },
    { code: 274, name: 'Roue de secours' },
    { code: 271, name: 'Roulement de roue' },
    { code: 278, name: 'Valve' },
  ],
  freins: [
    { code: 126, name: 'Arbre à came/Rouleau' },
    { code: 140, name: 'Avertisseur sonore/visuel' },
    { code: 158, name: 'Câble (frein de stationnement)' },
    { code: 118, name: 'Canalisation' },
    { code: 136, name: 'Commandes de freins' },
    { code: 128, name: 'Compresseur' },
    { code: 137, name: 'Courroie' },
    { code: 157, name: 'Course de la tige de commande' },
    { code: 121, name: 'Cylindre de roue/Piston' },
    { code: 124, name: 'Disque' },
    { code: 149, name: 'Élément de fixation' },
    { code: 122, name: 'Étrier' },
    { code: 119, name: 'Filtre' },
    { code: 134, name: 'Frein d\'urgence/de travail' },
    { code: 133, name: 'Frein de service' },
    { code: 135, name: 'Frein de stationnement' },
    { code: 125, name: 'Garniture' },
    { code: 127, name: 'Levier de frein' },
    { code: 132, name: 'Liquide de frein' },
    { code: 116, name: 'Maître-cylindre' },
    { code: 138, name: 'Manomètre' },
    { code: 130, name: 'Pédale de frein' },
    { code: 139, name: 'Pompe électrique (à dépression)' },
    { code: 129, name: 'Poulie du compresseur' },
    { code: 143, name: 'Raccord' },
    { code: 141, name: 'Récepteur de freinage' },
    { code: 148, name: 'Régulateur de pression' },
    { code: 120, name: 'Réservoir' },
    { code: 147, name: 'Robinet de purge' },
    { code: 115, name: 'Segment/Rivet/Boulon (garniture)' },
    { code: 117, name: 'Servofrein' },
    { code: 144, name: 'Soupape' },
    { code: 145, name: 'Système de freinage ABS' },
    { code: 123, name: 'Tambour' },
    { code: 131, name: 'Tête d\'accouplement (glad hand)' },
    { code: 142, name: 'Valve de protection du tracteur' },
  ],
  attelage: [
    { code: 178, name: 'Boule d\'accouplement' },
    { code: 184, name: 'Butée' },
    { code: 186, name: 'Compensateur de jeu' },
    { code: 180, name: 'Crochet d\'attelage' },
    { code: 170, name: 'Dispositif d\'attelage' },
    { code: 171, name: 'Élément de fixation' },
    { code: 183, name: 'Goupille de blocage' },
    { code: 174, name: 'Sellette d\'attelage/Plateau d\'accouplement' },
    { code: 176, name: 'Support du plateau d\'accouplement' },
    { code: 181, name: 'Système de verrouillage' },
  ],
  cadre: [
    { code: 200, name: 'Arbre de transmission' },
    { code: 198, name: 'Attache de carrosserie' },
    { code: 203, name: 'Élément de fixation' },
    { code: 202, name: 'Joint coulissant (arbre de transmission)' },
    { code: 208, name: 'Joint universel (arbre de transmission)' },
    { code: 196, name: 'Longeron' },
    { code: 193, name: 'Membrure' },
    { code: 205, name: 'Palier intermédiaire' },
    { code: 207, name: 'Protège-arbre de transmission' },
    { code: 206, name: 'Solive/Soliveau' },
    { code: 199, name: 'Support de moteur' },
    { code: 204, name: 'Support de transmission' },
    { code: 197, name: 'Traverse' },
  ],
  carburant: [
    { code: 293, name: 'Bouchon du réservoir' },
    { code: 291, name: 'Canalisation' },
    { code: 299, name: 'Commande de l\'accélérateur' },
    { code: 290, name: 'Dispositif d\'arrêt (moteur)' },
    { code: 294, name: 'Élément de fixation' },
    { code: 296, name: 'Jauge' },
    { code: 298, name: 'Raccord' },
    { code: 292, name: 'Réservoir à carburant' },
    { code: 295, name: 'Système d\'alimentation' },
    { code: 297, name: 'Vignette (GNC/GPL)' },
  ],
  carrosserie: [
    { code: 239, name: 'Aile' },
    { code: 334, name: 'Appui-tête' },
    { code: 250, name: 'Attache de pare-chocs' },
    { code: 333, name: 'Banquette/Siège' },
    { code: 241, name: 'Cabine/Habitacle' },
    { code: 237, name: 'Capot' },
    { code: 236, name: 'Carrosserie' },
    { code: 324, name: 'Ceinture de sécurité' },
    { code: 247, name: 'Charnière' },
    { code: 335, name: 'Coussin/Sac gonflable' },
    { code: 248, name: 'Dispositif de verrouillage/de retenue' },
    { code: 251, name: 'Garde-boue' },
    { code: 249, name: 'Marchepied' },
    { code: 240, name: 'Pare-chocs' },
    { code: 245, name: 'Plancher (habitacle)' },
    { code: 235, name: 'Porte/Couvercle' },
    { code: 238, name: 'Portière' },
  ],
  vitrage: [
    { code: 260, name: 'Lunette arrière' },
    { code: 256, name: 'Pare-brise' },
    { code: 258, name: 'Rétroviseur extérieur' },
    { code: 257, name: 'Rétroviseur intérieur' },
    { code: 259, name: 'Vitre latérale' },
  ],
  chargement: [
    { code: 219, name: 'Arceau de toit' },
    { code: 226, name: 'Butée' },
    { code: 224, name: 'Élément de fixation' },
    { code: 221, name: 'Panneau' },
    { code: 246, name: 'Plancher' },
    { code: 223, name: 'Plateforme' },
    { code: 220, name: 'Poteau/Potelet' },
    { code: 222, name: 'Ridelle' },
    { code: 225, name: 'Support' },
  ],
  direction: [
    { code: 37, name: 'Articulation/Joint à croisillon' },
    { code: 45, name: 'Barre d\'accouplement' },
    { code: 44, name: 'Bielle d\'accouplement' },
    { code: 40, name: 'Boîtier de direction' },
    { code: 50, name: 'Bras de renvoi' },
    { code: 56, name: 'Butée de direction' },
    { code: 38, name: 'Colonne de direction (ancrage)' },
    { code: 55, name: 'Conduit/Raccord' },
    { code: 53, name: 'Courroie de la pompe' },
    { code: 57, name: 'Crémaillère' },
    { code: 54, name: 'Cylindre auxiliaire' },
    { code: 33, name: 'Direction' },
    { code: 34, name: 'Élément de fixation' },
    { code: 43, name: 'Embout' },
    { code: 39, name: 'Joint coulissant' },
    { code: 47, name: 'Levier de commande' },
    { code: 48, name: 'Levier de direction' },
    { code: 49, name: 'Levier de fusée' },
    { code: 51, name: 'Manchon' },
    { code: 52, name: 'Pivot/Support de fusée' },
    { code: 42, name: 'Pompe de servodirection' },
    { code: 46, name: 'Rotule' },
    { code: 41, name: 'Servodirection' },
    { code: 31, name: 'Soufflet' },
    { code: 35, name: 'Volant' },
    { code: 36, name: 'Volant ajustable' },
  ],
  echappement: [
    { code: 313, name: 'Catalyseur' },
    { code: 307, name: 'Collecteur/Raccord' },
    { code: 308, name: 'Élément de fixation' },
    { code: 312, name: 'Résonateur' },
    { code: 310, name: 'Silencieux' },
    { code: 309, name: 'Structure protectrice' },
    { code: 306, name: 'Système d\'échappement' },
    { code: 311, name: 'Tuyau d\'échappement' },
  ],
  accessoires: [
    { code: 319, name: 'Balai d\'essuie-glace' },
    { code: 329, name: 'Commande d\'embrayage' },
    { code: 323, name: 'Dégivrage/Chauffage' },
    { code: 331, name: 'Essuie-glace' },
    { code: 339, name: 'Extincteur chimique' },
    { code: 326, name: 'Indicateur de vitesse' },
    { code: 321, name: 'Klaxon' },
    { code: 332, name: 'Lave-glace' },
    { code: 330, name: 'Neutralisation du démarreur' },
    { code: 325, name: 'Odomètre (totalisateur)' },
    { code: 255, name: 'Pare-soleil extérieur' },
    { code: 327, name: 'Pare-soleil intérieur' },
  ],
};

// Positions du diagramme véhicule (pneus et freins)
export const VEHICLE_POSITIONS = {
  front: {
    left: { pneu: 40, frein: 20 },
    center: { pneu: 5, frein: 30 },
    right: { pneu: 50, frein: null },
  },
  axle2: {
    left: { pneu: 41, frein: 21 },
    center: { pneu: null, frein: 31 },
    right: { pneu: 51, frein: null },
  },
  axle3: {
    left: { pneu: 42, frein: 22 },
    center: { pneu: null, frein: 32 },
    right: { pneu: 52, frein: null },
  },
  // Positions intermédiaires
  positions: [
    { id: 1, label: 'Avant centre' },
    { id: 2, label: 'Avant gauche' },
    { id: 3, label: 'Avant droit' },
    { id: 4, label: 'Côté gauche avant' },
    { id: 6, label: 'Côté gauche milieu' },
    { id: 8, label: 'Côté gauche arrière' },
    { id: 14, label: 'Côté droit avant' },
    { id: 16, label: 'Côté droit milieu' },
    { id: 18, label: 'Côté droit arrière' },
    { id: 9, label: 'Arrière centre' },
    { id: 10, label: 'Arrière gauche' },
    { id: 11, label: 'Arrière centre gauche' },
    { id: 12, label: 'Arrière centre droit' },
    { id: 19, label: 'Arrière droit' },
  ],
};

// Codes de défectuosité SAAQ
export const DEFECT_CODES: Record<string, string> = {
  'A': 'Absent/Manquant',
  'CC': 'Non solidement fixé',
  'DD': 'Mauvais emplacement',
  'F': 'Cassé',
  'GG': 'Ne fonctionne pas',
  'HH': 'Ne s\'allume pas',
  'IN': 'Inadéquat',
  'J': 'Décoloré',
  'LL': 'Lumière masquée/réduite',
  'MM': 'Peinturé',
  'N': 'Endommagé',
  'Q': 'Fissuré',
  'R': 'Ne reste pas en position',
  'W': 'Non conforme aux normes',
  'WW': 'Usé/Éraillé',
  'X': 'Mauvaise couleur/Non conforme',
};

// Fonctions du service

export async function getPEPForms(): Promise<PEPForm[]> {
  const data = await AsyncStorage.getItem(PEP_FORMS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getPEPFormById(id: string): Promise<PEPForm | null> {
  const forms = await getPEPForms();
  return forms.find(f => f.id === id) || null;
}

export async function getPEPFormsByVehicle(vehicleId: string): Promise<PEPForm[]> {
  const forms = await getPEPForms();
  return forms.filter(f => f.vehicleId === vehicleId).sort(
    (a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  );
}

export function createEmptyPEPForm(vehicleId: string, vehicleInfo: PEPVehicleInfo): PEPForm {
  const sections: PEPSection[] = PEP_SECTIONS.map(section => ({
    ...section,
    components: (PEP_COMPONENTS[section.id] || []).map(comp => ({
      ...comp,
      status: 'SO' as ComponentStatus,
    })),
  }));

  const now = new Date().toISOString();
  const nextMaintenance = calculateNextMaintenanceDate(vehicleInfo.pnbv);

  return {
    id: `pep_${Date.now()}`,
    vehicleId,
    vehicleInfo,
    sections,
    remarks: '',
    mechanicNumber: '',
    mechanicName: '',
    inspectionDate: now.split('T')[0],
    nextMaintenanceDate: nextMaintenance,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    totalMinorDefects: 0,
    totalMajorDefects: 0,
  };
}

export async function savePEPForm(form: PEPForm): Promise<PEPForm> {
  const forms = await getPEPForms();
  const index = forms.findIndex(f => f.id === form.id);
  
  // Calculer les totaux de défauts
  let minorCount = 0;
  let majorCount = 0;
  
  form.sections.forEach(section => {
    section.components.forEach(comp => {
      if (comp.status === 'Min') minorCount++;
      if (comp.status === 'Maj') majorCount++;
    });
  });
  
  form.totalMinorDefects = minorCount;
  form.totalMajorDefects = majorCount;
  form.updatedAt = new Date().toISOString();
  
  if (index !== -1) {
    forms[index] = form;
  } else {
    forms.push(form);
  }
  
  await AsyncStorage.setItem(PEP_FORMS_KEY, JSON.stringify(forms));
  return form;
}

export async function deletePEPForm(id: string): Promise<boolean> {
  const forms = await getPEPForms();
  const filtered = forms.filter(f => f.id !== id);
  if (filtered.length === forms.length) return false;
  await AsyncStorage.setItem(PEP_FORMS_KEY, JSON.stringify(filtered));
  return true;
}

export async function completePEPForm(id: string, mechanicSignature: string): Promise<PEPForm | null> {
  const form = await getPEPFormById(id);
  if (!form) return null;
  
  form.status = 'signed';
  form.mechanicSignature = mechanicSignature;
  form.updatedAt = new Date().toISOString();
  
  return savePEPForm(form);
}

// Calcul de la prochaine date d'entretien selon les règles SAAQ
export function calculateNextMaintenanceDate(pnbv: number, annualKm?: number): string {
  const now = new Date();
  let monthsToAdd = 3; // Par défaut: 3 mois pour PNBV >= 4500 kg
  
  if (pnbv >= 4500) {
    // Si kilométrage annuel < 20 000 km, peut être 6 mois
    if (annualKm && annualKm < 20000) {
      monthsToAdd = 6;
    }
  } else {
    // Véhicules plus légers: 6 mois
    monthsToAdd = 6;
  }
  
  const nextDate = new Date(now);
  nextDate.setMonth(nextDate.getMonth() + monthsToAdd);
  
  return nextDate.toISOString().split('T')[0];
}

// Vérifier si un véhicule a des défauts majeurs non résolus
export async function hasUnresolvedMajorDefects(vehicleId: string): Promise<boolean> {
  const forms = await getPEPFormsByVehicle(vehicleId);
  if (forms.length === 0) return false;
  
  const latestForm = forms[0];
  return latestForm.totalMajorDefects > 0 && latestForm.status !== 'signed';
}

// Obtenir les statistiques PEP pour un véhicule
export async function getPEPStats(vehicleId: string): Promise<{
  totalInspections: number;
  lastInspection: string | null;
  nextDue: string | null;
  totalMinorDefects: number;
  totalMajorDefects: number;
  complianceRate: number;
}> {
  const forms = await getPEPFormsByVehicle(vehicleId);
  
  if (forms.length === 0) {
    return {
      totalInspections: 0,
      lastInspection: null,
      nextDue: null,
      totalMinorDefects: 0,
      totalMajorDefects: 0,
      complianceRate: 100,
    };
  }
  
  const latestForm = forms[0];
  const totalComponents = latestForm.sections.reduce(
    (sum, section) => sum + section.components.length,
    0
  );
  const conformComponents = latestForm.sections.reduce(
    (sum, section) => sum + section.components.filter(c => c.status === 'C').length,
    0
  );
  
  return {
    totalInspections: forms.length,
    lastInspection: latestForm.inspectionDate,
    nextDue: latestForm.nextMaintenanceDate,
    totalMinorDefects: latestForm.totalMinorDefects,
    totalMajorDefects: latestForm.totalMajorDefects,
    complianceRate: totalComponents > 0 
      ? Math.round((conformComponents / totalComponents) * 100) 
      : 100,
  };
}

// Vérifier si le plan permet l'accès à PEP
export function isPEPAccessAllowed(plan: string): boolean {
  const allowedPlans = ['plus', 'pro', 'enterprise', 'entreprise'];
  return allowedPlans.includes(plan.toLowerCase());
}

// Générer les données pour le rapport PDF
export function generatePEPReportData(form: PEPForm): {
  header: Record<string, string>;
  sections: { title: string; rows: Record<string, string>[] }[];
  summary: Record<string, string | number>;
} {
  return {
    header: {
      'Numéro de plaque': form.vehicleInfo.plateNumber,
      'PNBV (kg)': form.vehicleInfo.pnbv.toString(),
      'Marque': form.vehicleInfo.make,
      'Année': form.vehicleInfo.year.toString(),
      'Raison': form.vehicleInfo.reason,
      'NIV': form.vehicleInfo.vin,
      'Modèle': form.vehicleInfo.model,
      'Odomètre': `${form.vehicleInfo.odometer} ${form.vehicleInfo.odometerUnit}`,
    },
    sections: form.sections.map(section => ({
      title: section.title,
      rows: section.components.map(comp => ({
        'Code': comp.code.toString(),
        'Composant': comp.name,
        'S/O': comp.status === 'SO' ? '✓' : '',
        'C': comp.status === 'C' ? '✓' : '',
        'Min': comp.status === 'Min' ? '✓' : '',
        'Maj': comp.status === 'Maj' ? '✓' : '',
        'Déf': comp.defectCode || '',
        'Mesure': comp.measure ? `${comp.measure} ${comp.measureUnit || ''}` : '',
      })),
    })),
    summary: {
      'Date d\'inspection': form.inspectionDate,
      'Mécanicien': form.mechanicName,
      'Numéro': form.mechanicNumber,
      'Défauts mineurs': form.totalMinorDefects,
      'Défauts majeurs': form.totalMajorDefects,
      'Prochain entretien': form.nextMaintenanceDate,
    },
  };
}


// Alias pour getPEPFormById
export const getPEPForm = getPEPFormById;

// Générer le PDF de la fiche PEP
export async function generatePEPPDF(form: PEPForm): Promise<string> {
  // Simulation de génération PDF
  // Dans une vraie implémentation, utiliser une bibliothèque comme react-native-pdf-lib
  const pdfPath = `/documents/pep_${form.id}_${Date.now()}.pdf`;
  
  // Sauvegarder le chemin du PDF dans le formulaire
  const updatedForm = {
    ...form,
    pdfPath,
  };
  await savePEPForm(updatedForm);
  
  return pdfPath;
}




// Obtenir les statistiques PEP globales pour le Dashboard
export async function getGlobalPEPStats(): Promise<{
  totalForms: number;
  completedThisMonth: number;
  pendingForms: number;
  upcomingDue: number;
}> {
  const allForms = await getPEPForms();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const completedThisMonth = allForms.filter((f: PEPForm) => 
    f.status === 'signed' && 
    new Date(f.inspectionDate) >= startOfMonth
  ).length;
  
  const pendingForms = allForms.filter((f: PEPForm) => f.status === 'draft').length;
  
  const upcomingDue = allForms.filter((f: PEPForm) => {
    if (!f.nextMaintenanceDate) return false;
    const dueDate = new Date(f.nextMaintenanceDate);
    return dueDate <= nextWeek && dueDate >= now;
  }).length;
  
  return {
    totalForms: allForms.length,
    completedThisMonth,
    pendingForms,
    upcomingDue,
  };
}
