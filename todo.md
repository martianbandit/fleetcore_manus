# FleetCore - TODO

## ✅ Fonctionnalités de base implémentées

### Configuration initiale
- [x] Initialisation du projet FleetCore
- [x] Configuration du thème de couleurs FleetCore (bleu #0066CC)
- [x] Ajouter les mappings d'icônes nécessaires
- [x] Configurer le logo de l'application
- [x] Mettre à jour app.config.ts avec le nom FleetCore

### Modèles de données et services
- [x] Créer les types TypeScript (Vehicle, Inspection, ChecklistItem, etc.)
- [x] Créer le service de données avec AsyncStorage (data-service.ts)
- [x] Supprimer les données mock par défaut (application vierge)
- [x] Implémenter les fonctions CRUD pour véhicules
- [x] Implémenter les fonctions CRUD pour inspections
- [x] Créer le service de métriques (metrics-service.ts)
- [x] Créer le service de documents (documents-service.ts)

### Écrans principaux
- [x] Dashboard (tableau de bord principal avec KPIs)
- [x] Vehicles (liste des véhicules avec recherche et filtres)
- [x] Inspections (liste des inspections avec filtres)
- [x] Settings (paramètres complets)
- [x] Vehicle Detail (détail d'un véhicule avec historique)
- [x] Inspection Detail (détail d'une inspection)
- [x] New Inspection (création d'inspection)
- [x] Checklist (inspection guidée avec 8 sections SAAQ)
- [x] Add Vehicle (ajout de véhicule avec formulaire complet)

### Composants UI
- [x] KPI Card (carte de statistique)
- [x] Vehicle Card (carte véhicule)
- [x] Inspection Card (carte inspection)
- [x] Status Badge (badge de statut)
- [x] Search Bar (barre de recherche)
- [x] Alert Card (carte d'alerte)
- [x] Camera Capture (capture photo)
- [x] Proof Gallery (galerie de preuves)
- [x] Ad Banner (bannières publicitaires avec rotation)
- [x] Useful Link Card (liens ressources)
- [x] StatCard (carte de statistique améliorée)
- [x] ActionCard (carte d'action rapide)
- [x] SectionHeader (en-tête de section)
- [x] ActivityTimeline (timeline d'activité)
- [x] ProgressRing (anneau de progression)
- [x] QuickStats (statistiques en ligne)
- [x] EmptyState (état vide avec illustration)
- [x] StatusBadge (badge de statut amélioré)
- [x] TrendChart (graphiques de tendances)
- [x] ImageGallery (galerie d'images avec prévisualisation)
- [x] DocumentList (liste de documents avec gestion)

## ✅ Fonctionnalités avancées implémentées

### Intégration documents officiels
- [x] Parser et intégrer le guide de sécurité routière JSON (420 défauts)
- [x] Intégrer les codes VMRS (2789 codes de composants)
- [x] Mettre à jour la checklist avec les codes officiels SAAQ
- [x] Ajouter les codes de localisation

### Capture de preuves
- [x] Composant CameraCapture avec expo-camera
- [x] Prise de photo lors de la détection de défauts
- [x] Galerie de preuves (ProofGallery component)
- [x] Association des preuves aux items de checklist

### Génération PDF
- [x] Service pdf-generator.ts créé
- [x] Template PDF conforme au formulaire SAAQ
- [x] Inclure les informations du véhicule et du technicien
- [x] Générer le tableau des défauts avec codes VMRS
- [x] Ajouter les preuves photographiques au rapport
- [x] Section "Preuves de réparation"
- [x] Signatures électroniques
- [x] Bouton "Générer PDF" dans l'UI (inspection/[id].tsx)

### Synchronisation cloud
- [x] Schémas Drizzle pour véhicules et inspections (drizzle/schema.ts)
- [x] API tRPC pour sync (server/routers.ts)
- [x] Mode hors-ligne avec AsyncStorage
- [x] Service de synchronisation (sync-service.ts)
- [x] Indicateur de statut sync dans l'UI (SyncIndicator component)
- [x] Synchronisation automatique avec notification

## ✅ Fonctionnalités professionnelles implémentées

### Mode sombre et thèmes
- [x] ThemeProvider créé (lib/theme-context.tsx)
- [x] Support auto/light/dark mode
- [x] Couleur primaire personnalisable
- [x] Sauvegarde des préférences (getSettings/saveSettings)
- [x] Application du thème à tous les écrans
- [x] Toggle mode sombre dans Settings (connecté au ThemeProvider)
- [x] Sélecteur de couleur primaire dans Settings

### Métriques et collecte de données
- [x] Service metrics-service.ts complet
- [x] Temps de travail par composant (ComponentWorkTime)
- [x] Historique des temps d'inspection
- [x] Statistiques par technicien (TechnicianMetrics)
- [x] Coûts de maintenance par véhicule (MaintenanceCost)
- [x] Durée de vie des composants
- [x] Fréquence des défauts par type
- [x] Métriques de flotte (FleetMetrics)
- [x] Export des métriques en CSV
- [x] UI pour afficher les métriques (écran analytics avec onglets)
- [x] UI pour démarrer/arrêter le chrono de travail (WorkTimer component)
- [x] UI pour ajouter les coûts de maintenance (/maintenance-costs)

### Espaces publicitaires
- [x] Composant AdBanner (banner + card variants)
- [x] Données mock pour publicités locales
- [x] Composant UsefulLinkCard
- [x] Liens vers ressources SAAQ, VMRS, formations
- [x] Catégorisation par type
- [x] Intégration dans les écrans (AdBanner dans toutes les pages)

### Gestion de documents
- [x] Service documents-service.ts complet
- [x] Upload de documents PDF et images (expo-document-picker)
- [x] Catégorisation (manual, invoice, registration, insurance, inspection, other)
- [x] Recherche par nom, notes, tags
- [x] Statistiques de documents (DocumentStats)
- [x] Suppression avec nettoyage des fichiers
- [x] UI pour gérer les documents (/documents)
- [x] Composant DocumentList intégré dans vehicle detail
- [x] Composant ImageGallery intégré dans vehicle detail

### Paramètres avancés
- [x] Interface AppSettings dans data-service.ts
- [x] Sauvegarde des préférences (theme, primaryColor, language, dateFormat, distanceUnit, notifications, autoSync)
- [x] Écran Settings complet créé
- [x] UI pour modifier la langue (fr/en) dans Settings
- [x] UI pour changer le format de date dans Settings
- [x] UI pour changer les unités (km/mi) dans Settings
- [x] Écran de sélection de langue (settings/language.tsx)
- [x] Écran de ressources utiles (settings/resources.tsx)

## ✅ Authentification et gestion des utilisateurs

- [x] Écran de connexion/inscription (login screen)
- [x] Intégration avec Manus OAuth
- [x] Gestion de session utilisateur
- [x] Écran de profil utilisateur (dans Settings)
- [x] Déconnexion

## ✅ Onboarding (première connexion)

- [x] Écran de bienvenue
- [x] Collecte du nom de l'entreprise
- [x] Upload du logo de l'entreprise
- [x] Sélection de la taille de l'entreprise (1-5, 6-20, 21-50, 51-200, 200+)
- [x] Estimation du nombre de véhicules
- [x] Sélection du type de flotte (camions lourds, semi-remorques, autobus, mixte)
- [x] Configuration initiale des préférences
- [x] Sauvegarde du profil entreprise

## ✅ Système de plans et limites

- [x] Définir les plans (Free, Pro, Enterprise)
- [x] Limites Free: 3 véhicules, 10 inspections/mois, pas de sync cloud
- [x] Limites Pro: 25 véhicules, inspections illimitées, sync cloud, métriques avancées
- [x] Limites Enterprise: véhicules illimités, toutes fonctionnalités, support prioritaire
- [x] Service de gestion des limites (subscription-service.ts)
- [x] Vérification des limites avant ajout véhicule/inspection
- [x] Écran d'upgrade avec comparaison des plans
- [x] Indicateur du plan actuel dans Settings
- [x] Compteurs d'utilisation (X/Y véhicules, X/Y inspections)

## ✅ Intégration Stripe - Paiement flexible

### Configuration Stripe
- [x] Configurer les clés API Stripe (test et production)
- [x] Créer les produits Stripe (véhicules, employés, fonctionnalités)
- [x] Créer les prix avec tarification basée sur l'usage (metered billing)
- [x] Créer les forfaits pour grandes flottes (60+ véhicules, 15+ employés)

### Modèle de tarification
- [x] Pay-per-vehicle: 15$/mois par véhicule (1-10), 12$/mois (11-30), 10$/mois (31-60), forfait 500$/mois (60+)
- [x] Pay-per-employee: 25$/mois par technicien (1-5), 20$/mois (6-15), forfait 250$/mois (15+)
- [x] Pay-per-feature: Métriques avancées (50$/mois), Export PDF premium (30$/mois), Sync cloud (40$/mois)
- [x] Forfaits grandes flottes: Custom pricing pour 60+ véhicules ou 15+ employés

### Service de paiement
- [x] Créer stripe-service.ts pour gérer les paiements
- [x] Implémenter createCheckoutSession pour paiements one-time
- [x] Implémenter createSubscription pour abonnements (via tRPC)
- [x] Implémenter updateSubscription pour changements de plan
- [x] Implémenter reportUsage pour metered billing (véhicules, employés)
- [x] Implémenter cancelSubscription

### Écrans de paiement
- [x] Écran de sélection de plan avec calculateur de prix dynamique (pricing.tsx)
- [x] Écran de gestion d'abonnement (subscription/manage.tsx)
- [x] Indicateurs d'usage en temps réel (X véhicules actifs, Y employés)

### Webhooks Stripe
- [x] Créer server/webhooks/stripe.ts
- [x] Implémenter la vérification des signatures Stripe
- [x] Gérer l'événement invoice.payment_succeeded
- [x] Gérer l'événement invoice.payment_failed
- [x] Gérer l'événement customer.subscription.updated
- [x] Gérer l'événement customer.subscription.deleted
- [x] Mettre à jour le statut d'abonnement local (AsyncStorage + DB)
- [x] Logger tous les événements webhook pour audit

## ✅ Interfaces utilisateur dédiées par rôle

### Service de gestion des rôles
- [x] Créer role-service.ts avec permissions granulaires
- [x] Définir les 5 rôles: admin, manager, dispatcher, technician, driver
- [x] Implémenter hasPermission pour vérifier les droits
- [x] Sauvegarder le rôle utilisateur courant

### Dashboards spécialisés
- [x] Dashboard Admin (vue globale, audit, gestion utilisateurs)
- [x] Dashboard Manager (KPIs flotte, approbations, rapports)
- [x] Dashboard Dispatcher (calendrier, assignations, planning)
- [x] Dashboard Technicien (bons de travail, chronomètre, pièces)
- [x] Dashboard Chauffeur (ronde de sécurité, signalement défauts)

### Navigation par rôle
- [x] Créer l'écran de sélection de rôle (role-select.tsx)
- [x] Ajouter la navigation depuis les paramètres
- [x] Implémenter le basculement entre dashboards
- [x] Composant RoleSwitcher pour navigation rapide

## ✅ Intégration Jotform et diagnostics

### Formulaires Jotform
- [x] Explorer les outils Jotform MCP disponibles
- [x] Créer le formulaire de ronde de sécurité quotidienne avec upload d'images (ID: 260015116962046)
- [x] Créer le formulaire de signalement de défauts avec photos (ID: 260015390984054)
- [x] Créer le formulaire de rapport d'incident (ID: 260015304617042)
- [x] Intégrer les formulaires dans le Dashboard Chauffeur
- [x] Service jotform-service.ts pour gestion des formulaires

### Service de diagnostic avec Perplexity
- [x] Créer le service perplexity-service.ts
- [x] Implémenter la fonction d'analyse de défauts
- [x] Intégrer les suggestions de diagnostic dans les formulaires
- [x] Créer l'interface de consultation des diagnostics (dans modal signalement)

## ✅ Vision Produit FleetCore v1.0

### Gestion avancée des véhicules
- [x] États avancés (active, maintenance, legally_immobilized, circulation_banned, retired)
- [x] Galerie de photos par véhicule (types définis + composant ImageGallery)
- [x] Documents attachés (immatriculation, assurance, factures) - composant DocumentList

### Traçabilité et preuve légale
- [x] Audit log complet (qui, quoi, quand) - audit-service.ts
- [x] Versioning des inspections (types définis)
- [x] Verrouillage après complétion (types définis)

### Mode terrain et résilience
- [x] File d'actions en attente (offline-first) - sync-service.ts
- [x] Synchronisation automatique
- [x] Autosave et récupération d'inspections interrompues

### Notifications métier intelligentes
- [x] Inspection en retard - business-notification-service.ts
- [x] Défaut bloquant non réparé
- [x] Véhicule utilisé malgré blocage
- [x] Paiement échoué
- [x] Limite de plan atteinte

### Rapports et métriques
- [x] Historique inspections par véhicule - reports-service.ts
- [x] Taux de conformité (6/12 mois)
- [x] Temps immobilisé cumulé
- [x] Coûts de maintenance
- [x] Exports PDF et CSV

## ✅ Refonte Interface Utilisateur

### Dashboard principal
- [x] Nouveau layout avec KPIs visuels et animations
- [x] Composants StatCard, ActionCard, SectionHeader
- [x] Intégration ProgressRing pour conformité
- [x] Timeline d'activité récente
- [x] Accès rapide aux espaces de travail par rôle

### Navigation et menus
- [x] Tab bar avec badges de notification
- [x] Centre de notifications complet (notifications.tsx)
- [x] Filtres et recherche améliorés

### Composants UI réutilisables
- [x] EmptyState avec illustrations
- [x] StatusBadge amélioré
- [x] QuickStats pour métriques en ligne
- [x] ActivityTimeline pour historique

### Écrans de rapports et audit
- [x] Écran Rapports avec visualisations (reports.tsx)
- [x] Écran Journal d'audit (audit-log.tsx)
- [x] Export CSV/PDF

## ✅ Services additionnels implémentés

### Notifications push
- [x] Service notification-service.ts avec expo-notifications
- [x] Planification de rappels d'inspection
- [x] Notifications de défauts critiques
- [x] Alertes de maintenance
- [x] Intégration dans les workflows

### Internationalisation
- [x] Service i18n-service.ts complet
- [x] Traductions français/anglais
- [x] Formatage de dates localisé
- [x] Formatage de nombres et devises
- [x] Écran de sélection de langue

### Graphiques et visualisations
- [x] Composant TrendChart (lignes, barres, camembert)
- [x] Graphiques de conformité
- [x] Graphiques de coûts
- [x] Graphiques de tendances

### Gestion d'équipe
- [x] Écran de gestion des techniciens/équipes (team.tsx)
- [x] Ajout/modification de techniciens
- [x] Gestion des spécialités
- [x] Statistiques par technicien

## 📊 Résumé des tests

- Total: 191 tests passés
- Tests unitaires pour tous les services principaux
- Tests d'intégration pour les workflows critiques

## 🎯 Fonctionnalités futures (non implémentées)

### À implémenter
- [ ] Capture vidéo pour preuves
- [ ] API publicitaire réelle
- [ ] Prévisualisation de documents PDF in-app
- [ ] Prédiction de maintenance avec ML
- [ ] Intégration GPS pour tracking véhicules
- [ ] Mode tablette optimisé
- [ ] Widget iOS/Android pour accès rapide
