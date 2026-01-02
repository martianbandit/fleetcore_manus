/**
 * FleetCore - Service d'internationalisation (i18n)
 * 
 * Gestion des traductions français/anglais
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type Language = 'fr' | 'en';

export interface TranslationKeys {
  // Navigation
  'nav.dashboard': string;
  'nav.vehicles': string;
  'nav.inspections': string;
  'nav.settings': string;
  'nav.notifications': string;
  'nav.reports': string;
  'nav.team': string;
  
  // Dashboard
  'dashboard.title': string;
  'dashboard.subtitle': string;
  'dashboard.compliance': string;
  'dashboard.complianceDesc': string;
  'dashboard.overview': string;
  'dashboard.quickActions': string;
  'dashboard.recentActivity': string;
  'dashboard.alerts': string;
  'dashboard.noAlerts': string;
  'dashboard.viewReport': string;
  'dashboard.synced': string;
  'dashboard.syncPending': string;
  'dashboard.offline': string;
  
  // Véhicules
  'vehicles.title': string;
  'vehicles.add': string;
  'vehicles.search': string;
  'vehicles.noVehicles': string;
  'vehicles.noVehiclesDesc': string;
  'vehicles.active': string;
  'vehicles.maintenance': string;
  'vehicles.inactive': string;
  'vehicles.blocked': string;
  'vehicles.all': string;
  'vehicles.details': string;
  'vehicles.edit': string;
  'vehicles.delete': string;
  'vehicles.deleteConfirm': string;
  'vehicles.plate': string;
  'vehicles.vin': string;
  'vehicles.make': string;
  'vehicles.model': string;
  'vehicles.year': string;
  'vehicles.mileage': string;
  'vehicles.lastInspection': string;
  'vehicles.nextInspection': string;
  'vehicles.documents': string;
  'vehicles.history': string;
  
  // Inspections
  'inspections.title': string;
  'inspections.new': string;
  'inspections.search': string;
  'inspections.noInspections': string;
  'inspections.noInspectionsDesc': string;
  'inspections.draft': string;
  'inspections.inProgress': string;
  'inspections.completed': string;
  'inspections.blocked': string;
  'inspections.all': string;
  'inspections.details': string;
  'inspections.continue': string;
  'inspections.generatePdf': string;
  'inspections.defects': string;
  'inspections.noDefects': string;
  'inspections.majorDefects': string;
  'inspections.minorDefects': string;
  'inspections.photos': string;
  'inspections.notes': string;
  'inspections.signature': string;
  'inspections.complete': string;
  'inspections.checklist': string;
  'inspections.section': string;
  'inspections.pass': string;
  'inspections.fail': string;
  'inspections.na': string;
  
  // Équipe
  'team.title': string;
  'team.add': string;
  'team.noMembers': string;
  'team.noMembersDesc': string;
  'team.technician': string;
  'team.driver': string;
  'team.manager': string;
  'team.admin': string;
  'team.inspections': string;
  'team.avgTime': string;
  'team.defectsFound': string;
  
  // Paramètres
  'settings.title': string;
  'settings.profile': string;
  'settings.company': string;
  'settings.notifications': string;
  'settings.appearance': string;
  'settings.language': string;
  'settings.dateFormat': string;
  'settings.units': string;
  'settings.darkMode': string;
  'settings.primaryColor': string;
  'settings.subscription': string;
  'settings.logout': string;
  'settings.about': string;
  'settings.version': string;
  'settings.support': string;
  'settings.privacy': string;
  'settings.terms': string;
  
  // Notifications
  'notifications.title': string;
  'notifications.empty': string;
  'notifications.emptyDesc': string;
  'notifications.markAllRead': string;
  'notifications.settings': string;
  'notifications.enabled': string;
  'notifications.inspectionReminders': string;
  'notifications.defectAlerts': string;
  'notifications.maintenanceAlerts': string;
  'notifications.paymentAlerts': string;
  'notifications.teamUpdates': string;
  'notifications.quietHours': string;
  
  // Rapports
  'reports.title': string;
  'reports.compliance': string;
  'reports.costs': string;
  'reports.trends': string;
  'reports.export': string;
  'reports.exportPdf': string;
  'reports.exportCsv': string;
  'reports.period': string;
  'reports.lastMonth': string;
  'reports.last3Months': string;
  'reports.last6Months': string;
  'reports.lastYear': string;
  
  // Actions communes
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  'common.refresh': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.confirm': string;
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.done': string;
  'common.close': string;
  'common.retry': string;
  'common.today': string;
  'common.yesterday': string;
  'common.thisWeek': string;
  'common.thisMonth': string;
  'common.all': string;
  'common.none': string;
  'common.km': string;
  'common.mi': string;
  
  // Statuts
  'status.active': string;
  'status.inactive': string;
  'status.maintenance': string;
  'status.blocked': string;
  'status.draft': string;
  'status.inProgress': string;
  'status.completed': string;
  'status.pending': string;
  'status.failed': string;
  'status.synced': string;
  
  // Erreurs
  'error.generic': string;
  'error.network': string;
  'error.notFound': string;
  'error.unauthorized': string;
  'error.validation': string;
  'error.required': string;
  'error.invalidFormat': string;
  
  // Temps
  'time.justNow': string;
  'time.minutesAgo': string;
  'time.hoursAgo': string;
  'time.daysAgo': string;
  'time.weeksAgo': string;
  'time.monthsAgo': string;
}

// Traductions françaises
const fr: TranslationKeys = {
  // Navigation
  'nav.dashboard': 'Tableau de bord',
  'nav.vehicles': 'Véhicules',
  'nav.inspections': 'Inspections',
  'nav.settings': 'Paramètres',
  'nav.notifications': 'Notifications',
  'nav.reports': 'Rapports',
  'nav.team': 'Équipe',
  
  // Dashboard
  'dashboard.title': 'FleetCore',
  'dashboard.subtitle': 'Tableau de bord de gestion de flotte',
  'dashboard.compliance': 'Score de conformité',
  'dashboard.complianceDesc': 'de votre flotte est conforme aux normes SAAQ',
  'dashboard.overview': 'Vue d\'ensemble',
  'dashboard.quickActions': 'Actions rapides',
  'dashboard.recentActivity': 'Activité récente',
  'dashboard.alerts': 'Alertes',
  'dashboard.noAlerts': 'Aucune alerte',
  'dashboard.viewReport': 'Voir le rapport',
  'dashboard.synced': 'Synchronisé',
  'dashboard.syncPending': 'Synchronisation en attente',
  'dashboard.offline': 'Hors ligne',
  
  // Véhicules
  'vehicles.title': 'Véhicules',
  'vehicles.add': 'Ajouter un véhicule',
  'vehicles.search': 'Rechercher un véhicule...',
  'vehicles.noVehicles': 'Aucun véhicule',
  'vehicles.noVehiclesDesc': 'Ajoutez votre premier véhicule pour commencer',
  'vehicles.active': 'Actif',
  'vehicles.maintenance': 'En maintenance',
  'vehicles.inactive': 'Inactif',
  'vehicles.blocked': 'Bloqué',
  'vehicles.all': 'Tous',
  'vehicles.details': 'Détails du véhicule',
  'vehicles.edit': 'Modifier',
  'vehicles.delete': 'Supprimer',
  'vehicles.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
  'vehicles.plate': 'Plaque',
  'vehicles.vin': 'NIV',
  'vehicles.make': 'Marque',
  'vehicles.model': 'Modèle',
  'vehicles.year': 'Année',
  'vehicles.mileage': 'Kilométrage',
  'vehicles.lastInspection': 'Dernière inspection',
  'vehicles.nextInspection': 'Prochaine inspection',
  'vehicles.documents': 'Documents',
  'vehicles.history': 'Historique',
  
  // Inspections
  'inspections.title': 'Inspections',
  'inspections.new': 'Nouvelle inspection',
  'inspections.search': 'Rechercher une inspection...',
  'inspections.noInspections': 'Aucune inspection',
  'inspections.noInspectionsDesc': 'Créez votre première inspection',
  'inspections.draft': 'Brouillon',
  'inspections.inProgress': 'En cours',
  'inspections.completed': 'Terminée',
  'inspections.blocked': 'Bloquée',
  'inspections.all': 'Toutes',
  'inspections.details': 'Détails de l\'inspection',
  'inspections.continue': 'Continuer',
  'inspections.generatePdf': 'Générer PDF',
  'inspections.defects': 'Défauts',
  'inspections.noDefects': 'Aucun défaut',
  'inspections.majorDefects': 'Défauts majeurs',
  'inspections.minorDefects': 'Défauts mineurs',
  'inspections.photos': 'Photos',
  'inspections.notes': 'Notes',
  'inspections.signature': 'Signature',
  'inspections.complete': 'Terminer',
  'inspections.checklist': 'Liste de contrôle',
  'inspections.section': 'Section',
  'inspections.pass': 'Conforme',
  'inspections.fail': 'Non conforme',
  'inspections.na': 'N/A',
  
  // Équipe
  'team.title': 'Équipe',
  'team.add': 'Ajouter un membre',
  'team.noMembers': 'Aucun membre',
  'team.noMembersDesc': 'Ajoutez des membres à votre équipe',
  'team.technician': 'Technicien',
  'team.driver': 'Chauffeur',
  'team.manager': 'Gestionnaire',
  'team.admin': 'Administrateur',
  'team.inspections': 'Inspections',
  'team.avgTime': 'Temps moyen',
  'team.defectsFound': 'Défauts trouvés',
  
  // Paramètres
  'settings.title': 'Paramètres',
  'settings.profile': 'Profil',
  'settings.company': 'Entreprise',
  'settings.notifications': 'Notifications',
  'settings.appearance': 'Apparence',
  'settings.language': 'Langue',
  'settings.dateFormat': 'Format de date',
  'settings.units': 'Unités',
  'settings.darkMode': 'Mode sombre',
  'settings.primaryColor': 'Couleur principale',
  'settings.subscription': 'Abonnement',
  'settings.logout': 'Déconnexion',
  'settings.about': 'À propos',
  'settings.version': 'Version',
  'settings.support': 'Support',
  'settings.privacy': 'Confidentialité',
  'settings.terms': 'Conditions d\'utilisation',
  
  // Notifications
  'notifications.title': 'Notifications',
  'notifications.empty': 'Aucune notification',
  'notifications.emptyDesc': 'Vous n\'avez pas de nouvelles notifications',
  'notifications.markAllRead': 'Tout marquer comme lu',
  'notifications.settings': 'Paramètres de notification',
  'notifications.enabled': 'Notifications activées',
  'notifications.inspectionReminders': 'Rappels d\'inspection',
  'notifications.defectAlerts': 'Alertes de défauts',
  'notifications.maintenanceAlerts': 'Alertes de maintenance',
  'notifications.paymentAlerts': 'Alertes de paiement',
  'notifications.teamUpdates': 'Mises à jour d\'équipe',
  'notifications.quietHours': 'Heures calmes',
  
  // Rapports
  'reports.title': 'Rapports',
  'reports.compliance': 'Conformité',
  'reports.costs': 'Coûts',
  'reports.trends': 'Tendances',
  'reports.export': 'Exporter',
  'reports.exportPdf': 'Exporter en PDF',
  'reports.exportCsv': 'Exporter en CSV',
  'reports.period': 'Période',
  'reports.lastMonth': 'Dernier mois',
  'reports.last3Months': '3 derniers mois',
  'reports.last6Months': '6 derniers mois',
  'reports.lastYear': 'Dernière année',
  
  // Actions communes
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.add': 'Ajouter',
  'common.search': 'Rechercher',
  'common.filter': 'Filtrer',
  'common.sort': 'Trier',
  'common.refresh': 'Actualiser',
  'common.loading': 'Chargement...',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.confirm': 'Confirmer',
  'common.yes': 'Oui',
  'common.no': 'Non',
  'common.ok': 'OK',
  'common.back': 'Retour',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',
  'common.done': 'Terminé',
  'common.close': 'Fermer',
  'common.retry': 'Réessayer',
  'common.today': 'Aujourd\'hui',
  'common.yesterday': 'Hier',
  'common.thisWeek': 'Cette semaine',
  'common.thisMonth': 'Ce mois',
  'common.all': 'Tout',
  'common.none': 'Aucun',
  'common.km': 'km',
  'common.mi': 'mi',
  
  // Statuts
  'status.active': 'Actif',
  'status.inactive': 'Inactif',
  'status.maintenance': 'En maintenance',
  'status.blocked': 'Bloqué',
  'status.draft': 'Brouillon',
  'status.inProgress': 'En cours',
  'status.completed': 'Terminé',
  'status.pending': 'En attente',
  'status.failed': 'Échoué',
  'status.synced': 'Synchronisé',
  
  // Erreurs
  'error.generic': 'Une erreur est survenue',
  'error.network': 'Erreur de connexion',
  'error.notFound': 'Non trouvé',
  'error.unauthorized': 'Non autorisé',
  'error.validation': 'Erreur de validation',
  'error.required': 'Ce champ est requis',
  'error.invalidFormat': 'Format invalide',
  
  // Temps
  'time.justNow': 'À l\'instant',
  'time.minutesAgo': 'il y a {count} minute(s)',
  'time.hoursAgo': 'il y a {count} heure(s)',
  'time.daysAgo': 'il y a {count} jour(s)',
  'time.weeksAgo': 'il y a {count} semaine(s)',
  'time.monthsAgo': 'il y a {count} mois',
};

// Traductions anglaises
const en: TranslationKeys = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.vehicles': 'Vehicles',
  'nav.inspections': 'Inspections',
  'nav.settings': 'Settings',
  'nav.notifications': 'Notifications',
  'nav.reports': 'Reports',
  'nav.team': 'Team',
  
  // Dashboard
  'dashboard.title': 'FleetCore',
  'dashboard.subtitle': 'Fleet Management Dashboard',
  'dashboard.compliance': 'Compliance Score',
  'dashboard.complianceDesc': 'of your fleet is compliant with SAAQ standards',
  'dashboard.overview': 'Overview',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.alerts': 'Alerts',
  'dashboard.noAlerts': 'No alerts',
  'dashboard.viewReport': 'View Report',
  'dashboard.synced': 'Synced',
  'dashboard.syncPending': 'Sync pending',
  'dashboard.offline': 'Offline',
  
  // Véhicules
  'vehicles.title': 'Vehicles',
  'vehicles.add': 'Add Vehicle',
  'vehicles.search': 'Search vehicles...',
  'vehicles.noVehicles': 'No vehicles',
  'vehicles.noVehiclesDesc': 'Add your first vehicle to get started',
  'vehicles.active': 'Active',
  'vehicles.maintenance': 'In Maintenance',
  'vehicles.inactive': 'Inactive',
  'vehicles.blocked': 'Blocked',
  'vehicles.all': 'All',
  'vehicles.details': 'Vehicle Details',
  'vehicles.edit': 'Edit',
  'vehicles.delete': 'Delete',
  'vehicles.deleteConfirm': 'Are you sure you want to delete this vehicle?',
  'vehicles.plate': 'Plate',
  'vehicles.vin': 'VIN',
  'vehicles.make': 'Make',
  'vehicles.model': 'Model',
  'vehicles.year': 'Year',
  'vehicles.mileage': 'Mileage',
  'vehicles.lastInspection': 'Last Inspection',
  'vehicles.nextInspection': 'Next Inspection',
  'vehicles.documents': 'Documents',
  'vehicles.history': 'History',
  
  // Inspections
  'inspections.title': 'Inspections',
  'inspections.new': 'New Inspection',
  'inspections.search': 'Search inspections...',
  'inspections.noInspections': 'No inspections',
  'inspections.noInspectionsDesc': 'Create your first inspection',
  'inspections.draft': 'Draft',
  'inspections.inProgress': 'In Progress',
  'inspections.completed': 'Completed',
  'inspections.blocked': 'Blocked',
  'inspections.all': 'All',
  'inspections.details': 'Inspection Details',
  'inspections.continue': 'Continue',
  'inspections.generatePdf': 'Generate PDF',
  'inspections.defects': 'Defects',
  'inspections.noDefects': 'No defects',
  'inspections.majorDefects': 'Major Defects',
  'inspections.minorDefects': 'Minor Defects',
  'inspections.photos': 'Photos',
  'inspections.notes': 'Notes',
  'inspections.signature': 'Signature',
  'inspections.complete': 'Complete',
  'inspections.checklist': 'Checklist',
  'inspections.section': 'Section',
  'inspections.pass': 'Pass',
  'inspections.fail': 'Fail',
  'inspections.na': 'N/A',
  
  // Équipe
  'team.title': 'Team',
  'team.add': 'Add Member',
  'team.noMembers': 'No members',
  'team.noMembersDesc': 'Add members to your team',
  'team.technician': 'Technician',
  'team.driver': 'Driver',
  'team.manager': 'Manager',
  'team.admin': 'Administrator',
  'team.inspections': 'Inspections',
  'team.avgTime': 'Avg. Time',
  'team.defectsFound': 'Defects Found',
  
  // Paramètres
  'settings.title': 'Settings',
  'settings.profile': 'Profile',
  'settings.company': 'Company',
  'settings.notifications': 'Notifications',
  'settings.appearance': 'Appearance',
  'settings.language': 'Language',
  'settings.dateFormat': 'Date Format',
  'settings.units': 'Units',
  'settings.darkMode': 'Dark Mode',
  'settings.primaryColor': 'Primary Color',
  'settings.subscription': 'Subscription',
  'settings.logout': 'Logout',
  'settings.about': 'About',
  'settings.version': 'Version',
  'settings.support': 'Support',
  'settings.privacy': 'Privacy',
  'settings.terms': 'Terms of Service',
  
  // Notifications
  'notifications.title': 'Notifications',
  'notifications.empty': 'No notifications',
  'notifications.emptyDesc': 'You have no new notifications',
  'notifications.markAllRead': 'Mark all as read',
  'notifications.settings': 'Notification Settings',
  'notifications.enabled': 'Notifications enabled',
  'notifications.inspectionReminders': 'Inspection reminders',
  'notifications.defectAlerts': 'Defect alerts',
  'notifications.maintenanceAlerts': 'Maintenance alerts',
  'notifications.paymentAlerts': 'Payment alerts',
  'notifications.teamUpdates': 'Team updates',
  'notifications.quietHours': 'Quiet hours',
  
  // Rapports
  'reports.title': 'Reports',
  'reports.compliance': 'Compliance',
  'reports.costs': 'Costs',
  'reports.trends': 'Trends',
  'reports.export': 'Export',
  'reports.exportPdf': 'Export as PDF',
  'reports.exportCsv': 'Export as CSV',
  'reports.period': 'Period',
  'reports.lastMonth': 'Last month',
  'reports.last3Months': 'Last 3 months',
  'reports.last6Months': 'Last 6 months',
  'reports.lastYear': 'Last year',
  
  // Actions communes
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.refresh': 'Refresh',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.done': 'Done',
  'common.close': 'Close',
  'common.retry': 'Retry',
  'common.today': 'Today',
  'common.yesterday': 'Yesterday',
  'common.thisWeek': 'This week',
  'common.thisMonth': 'This month',
  'common.all': 'All',
  'common.none': 'None',
  'common.km': 'km',
  'common.mi': 'mi',
  
  // Statuts
  'status.active': 'Active',
  'status.inactive': 'Inactive',
  'status.maintenance': 'In Maintenance',
  'status.blocked': 'Blocked',
  'status.draft': 'Draft',
  'status.inProgress': 'In Progress',
  'status.completed': 'Completed',
  'status.pending': 'Pending',
  'status.failed': 'Failed',
  'status.synced': 'Synced',
  
  // Erreurs
  'error.generic': 'An error occurred',
  'error.network': 'Connection error',
  'error.notFound': 'Not found',
  'error.unauthorized': 'Unauthorized',
  'error.validation': 'Validation error',
  'error.required': 'This field is required',
  'error.invalidFormat': 'Invalid format',
  
  // Temps
  'time.justNow': 'Just now',
  'time.minutesAgo': '{count} minute(s) ago',
  'time.hoursAgo': '{count} hour(s) ago',
  'time.daysAgo': '{count} day(s) ago',
  'time.weeksAgo': '{count} week(s) ago',
  'time.monthsAgo': '{count} month(s) ago',
};

// Dictionnaire de traductions
const translations: Record<Language, TranslationKeys> = { fr, en };

// Clé de stockage
const STORAGE_KEY = '@fleetcore_language';

// Langue par défaut
let currentLanguage: Language = 'fr';

/**
 * Initialise le service i18n
 */
export async function initI18n(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'fr' || stored === 'en')) {
      currentLanguage = stored;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
}

/**
 * Obtient la langue actuelle
 */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Définit la langue
 */
export async function setLanguage(lang: Language): Promise<void> {
  currentLanguage = lang;
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}

/**
 * Traduit une clé
 */
export function t(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
  const translation = translations[currentLanguage][key] || translations['fr'][key] || key;
  
  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      translation
    );
  }
  
  return translation;
}

/**
 * Formate une date selon la langue
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return formatRelativeTime(d);
  }
  
  const locale = currentLanguage === 'fr' ? 'fr-CA' : 'en-CA';
  
  if (format === 'short') {
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formate un temps relatif
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMins < 1) return t('time.justNow');
  if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
  if (diffWeeks < 4) return t('time.weeksAgo', { count: diffWeeks });
  return t('time.monthsAgo', { count: diffMonths });
}

/**
 * Formate un nombre selon la langue
 */
export function formatNumber(num: number, decimals: number = 0): string {
  const locale = currentLanguage === 'fr' ? 'fr-CA' : 'en-CA';
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formate une devise
 */
export function formatCurrency(amount: number): string {
  const locale = currentLanguage === 'fr' ? 'fr-CA' : 'en-CA';
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: 'CAD',
  });
}

/**
 * Obtient toutes les langues disponibles
 */
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
  ];
}
