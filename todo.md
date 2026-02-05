# FleetCore - TODO

## ✅ Fonctionnalités de base (Complétées)

### Gestion des véhicules
- [x] CRUD véhicules (créer, lire, modifier, supprimer)
- [x] Filtres par statut, classe, recherche
- [x] Détail véhicule avec historique
- [x] États avancés (active, maintenance, legally_immobilized, circulation_banned, retired)
- [x] Galerie de photos par véhicule (image-gallery.tsx)
- [x] Documents attachés (document-list.tsx)

### Inspections
- [x] Nouvelle inspection avec sélection véhicule/type
- [x] Checklist SAAQ avec 8 sections réglementaires (305 items, 9 sections)
- [x] 420+ codes de défauts officiels intégrés
- [x] Codes VMRS pour classification des composants
- [x] Capture de photos comme preuves
- [x] Capture vidéo comme preuves (video-capture.tsx)
- [x] Génération de rapports PDF conformes SAAQ
- [x] Statuts d'inspection (DRAFT, IN_PROGRESS, COMPLETED, BLOCKED, INTERRUPTED)

### Tableau de bord
- [x] Score de conformité avec anneau de progression
- [x] KPIs (véhicules, inspections, défauts, bons de travail)
- [x] Actions rapides
- [x] Timeline d'activité récente
- [x] Accès aux espaces de travail par rôle

## ✅ Interfaces utilisateur par rôle (Complétées)

### Dashboards spécialisés
- [x] Dashboard Admin (vue globale, audit, utilisateurs)
- [x] Dashboard Manager (KPIs flotte, approbations)
- [x] Dashboard Dispatcher (calendrier, assignations)
- [x] Dashboard Technician (bons de travail, chronomètre)
- [x] Dashboard Driver (ronde de sécurité, signalement défauts)

### Navigation et rôles
- [x] Service de gestion des rôles (role-service.ts)
- [x] Écran de sélection de rôle (role-select.tsx)
- [x] Composant RoleSwitcher
- [x] Navigation depuis les paramètres

## ✅ Intégrations externes (Complétées)

### Jotform
- [x] Formulaire de ronde de sécurité quotidienne (ID: 260015116962046)
- [x] Formulaire de signalement de défauts avec photos (ID: 260015390984054)
- [x] Formulaire de rapport d'incident (ID: 260015304617042)
- [x] Service d'intégration (jotform-service.ts)
- [x] Intégration dans le Dashboard Chauffeur

### Perplexity AI
- [x] Service de diagnostic (perplexity-service.ts)
- [x] Analyse des défauts avec estimation des coûts
- [x] Suggestions de réparation
- [x] Intégration dans le signalement de défauts

### Stripe
- [x] Plans d'abonnement (Free, Pro, Enterprise)
- [x] Modèles de facturation (pay-per-vehicle, pay-per-employee)
- [x] Webhooks pour paiements
- [x] Service d'abonnement (subscription-service.ts)

## ✅ Vision Produit FleetCore v1.0 (Complétées)

### Traçabilité et preuve légale
- [x] Audit log complet (audit-service.ts)
- [x] Versioning des inspections (types définis)
- [x] Verrouillage après complétion (types définis)

### Mode terrain et résilience
- [x] File d'actions en attente offline-first (sync-service.ts)
- [x] Synchronisation automatique
- [x] Autosave et récupération d'inspections interrompues

### Notifications métier intelligentes
- [x] Service de notifications push (notification-service.ts)
- [x] Service de notifications métier (business-notification-service.ts)
- [x] Inspection en retard
- [x] Défaut bloquant non réparé
- [x] Véhicule utilisé malgré blocage
- [x] Paiement échoué
- [x] Limite de plan atteinte

### Rapports et métriques
- [x] Historique inspections par véhicule (reports-service.ts)
- [x] Taux de conformité (6/12 mois)
- [x] Temps immobilisé cumulé
- [x] Coûts de maintenance
- [x] Exports CSV

## ✅ Composants UI (Complétés)

- [x] StatCard avec animations et tendances
- [x] ActionCard pour actions rapides
- [x] SectionHeader pour titres de sections
- [x] ActivityTimeline pour historique
- [x] ProgressRing pour indicateurs circulaires
- [x] QuickStats pour métriques en ligne
- [x] EmptyState avec illustrations
- [x] StatusBadge (consolidé)
- [x] TrendChart (lignes, barres, camembert)
- [x] ImageGallery avec prévisualisation
- [x] DocumentList pour gestion des documents
- [x] VideoCapture pour capture vidéo
- [x] TutorialOverlay pour tutoriel interactif
- [x] AdBanner pour bannières publicitaires

## ✅ Écrans (Complétés)

### Écrans principaux
- [x] Dashboard principal (index.tsx)
- [x] Liste des véhicules (vehicles.tsx)
- [x] Liste des inspections (inspections.tsx)
- [x] Paramètres (settings.tsx)

### Écrans de détail
- [x] Détail véhicule (vehicle/[id].tsx)
- [x] Détail inspection (inspection/[id].tsx)
- [x] Checklist d'inspection (checklist/[id].tsx)

### Écrans de création
- [x] Nouvelle inspection (new-inspection.tsx)
- [x] Ajout véhicule (vehicle/add.tsx)

### Écrans de gestion
- [x] Centre de notifications (notifications.tsx)
- [x] Écran Rapports (reports.tsx)
- [x] Journal d'audit (audit-log.tsx)
- [x] Écran Analytics (analytics.tsx)
- [x] Gestion des équipes (teams/index.tsx)
- [x] Gestion des techniciens (technicians/index.tsx)
- [x] Détail équipe (team-detail/[id].tsx)
- [x] Détail technicien (technician/[id].tsx)

### Écrans de paramètres
- [x] Notifications (settings/notifications.tsx)
- [x] Sélection de langue (settings/language.tsx)
- [x] Ressources utiles (settings/resources.tsx)
- [x] Synchronisation calendrier (settings/calendar-sync.tsx)
- [x] Permissions (settings/permissions.tsx)

### Écrans d'abonnement
- [x] Mise à niveau (subscription/upgrade.tsx)
- [x] Tarification (subscription/pricing.tsx)
- [x] Gestion (subscription/manage.tsx)

## ✅ Services (29 services)

| Service | Description |
|---------|-------------|
| ad-service.ts | Gestion des bannières publicitaires |
| audit-service.ts | Journal d'audit et traçabilité |
| business-notification-service.ts | Notifications métier (stockées localement) |
| calendar-service.ts | Gestion du calendrier et rappels |
| company-service.ts | Profil entreprise |
| data-service.ts | CRUD véhicules et inspections |
| demo-data-service.ts | Données de démonstration |
| documents-service.ts | Gestion des documents |
| i18n-service.ts | Traduction multi-langue (fr/en) |
| inventory-service.ts | Gestion des stocks et pièces |
| jotform-service.ts | Intégration formulaires Jotform |
| metrics-service.ts | Métriques et statistiques |
| mock-data.ts | Données de test |
| notification-service.ts | Notifications push (expo-notifications) |
| onboarding-service.ts | Parcours d'intégration |
| pdf-generator.ts | Génération de rapports PDF |
| pep-service.ts | Programme d'entretien préventif |
| perplexity-service.ts | Diagnostic IA |
| reports-service.ts | Génération de rapports |
| role-service.ts | Gestion des rôles utilisateur |
| stripe-service.ts | Intégration paiements Stripe |
| subscription-service.ts | Gestion des abonnements |
| sync-service.ts | Synchronisation offline-first |
| team-service.ts | Gestion des équipes |
| trpc.ts | Client API tRPC |
| tutorial-service.ts | Tutoriel interactif |
| types.ts | Types TypeScript |
| utils.ts | Utilitaires |
| work-order-service.ts | Bons de travail |

## ✅ Documentation (Complétée)

- [x] README.md - Documentation principale
- [x] USER_GUIDE.md - Guide utilisateur complet
- [x] TECHNICAL.md - Documentation technique
- [x] design.md - Spécifications de design
- [x] todo.md - Suivi des fonctionnalités

## ✅ Nettoyage effectué

### Fichiers supprimés (doublons)
- [x] status-badge-enhanced.tsx (doublon de status-badge.tsx)
- [x] push-notification-service.ts (doublon de notification-service.ts)
- [x] app/team.tsx (doublon de teams/index.tsx)
- [x] app/team/[id].tsx (doublon de technician/[id].tsx)
- [x] app/team/add.tsx (doublon de technician/add.tsx)

### Routes corrigées
- [x] /team → /teams dans settings.tsx
- [x] /team → /teams dans analytics.tsx

## 📊 Statistiques du projet

- **Tests** : 191 passés, 1 ignoré
- **Services** : 29 services métier
- **Composants UI** : 20+ composants réutilisables
- **Écrans** : 50+ écrans
- **Intégrations** : Jotform, Perplexity, Stripe

## 🔄 Améliorations futures (Non prioritaires)

- [ ] Tracking GPS des véhicules
- [ ] Reconnaissance OCR des plaques
- [ ] Intégration calendrier Google/Outlook
- [ ] Mode tablette optimisé
- [ ] Signature électronique avancée
- [ ] Cache intelligent des images
- [ ] Compression vidéo côté client
- [ ] Lazy loading des rapports
- [ ] PWA pour version web
- [ ] Telematics (Geotab, Samsara)
- [ ] ERP (SAP, Oracle)
- [ ] Systèmes de maintenance (Fleetio)


## 🆕 Prochaines étapes en cours

### Données de démonstration
- [x] Ajouter un bouton "Charger données démo" dans les paramètres
- [x] Afficher une confirmation avant le chargement
- [x] Permettre la réinitialisation des données

### Parcours chauffeur
- [x] Vérifier l'accès au Dashboard Chauffeur
- [x] Tester l'intégration des formulaires Jotform
- [x] Améliorer l'UX du signalement de défauts

### Diagnostic IA Perplexity
- [x] Vérifier la configuration de SONAR_API_KEY
- [x] Tester le diagnostic avec des défauts réels (quickDiagnostic local)
- [x] Afficher les résultats de diagnostic dans l'UI


## 🆕 Navigation - Bouton retour

- [x] Créer un composant BackButton réutilisable (back-button.tsx)
- [x] Configurer le header avec bouton retour dans le layout principal (_layout.tsx)
- [x] Ajouter les titres pour tous les écrans (70+ écrans configurés)
- [x] Tester la navigation sur toutes les pages
