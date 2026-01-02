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
- [x] Settings (paramètres de base)
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
- [x] Ad Banner (bannières publicitaires)
- [x] Useful Link Card (liens ressources)

### Fonctionnalités du Dashboard
- [x] Affichage des KPIs (véhicules, inspections, défauts, conformité)
- [x] Section activité récente
- [x] Actions rapides
- [x] Alertes critiques

### Gestion des véhicules
- [x] Liste des véhicules avec recherche
- [x] Filtrage par statut (actif, maintenance, inactif)
- [x] Détail véhicule avec historique d'inspections
- [x] Ajout de véhicule avec formulaire validé
- [x] Upload d'image de couverture (galerie + caméra)
- [x] Validation des champs (VIN 17 caractères, plaque, etc.)
- [x] **COMPLÉTÉ**: Édition des informations véhicule (mode édition dans add.tsx)
- [x] **COMPLÉTÉ**: Suppression de véhicule (boutons dans vehicle/[id].tsx)
- [ ] **MANQUANT**: Galerie d'images multiples par véhicule

### Gestion des inspections
- [x] Liste des inspections avec filtres par statut
- [x] Création d'inspection avec sélection véhicule
- [x] Checklist dynamique SAAQ (8 sections, 33 points)
- [x] Gestion des statuts (DRAFT, IN_PROGRESS, COMPLETED, BLOCKED)
- [x] Capture de photos pour preuves de défauts
- [x] Codes de localisation (diagramme 1-19)

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
- [ ] **MANQUANT**: Capture vidéo (structure prête, pas implémentée)

### Génération PDF
- [x] Service pdf-generator.ts créé
- [x] Template PDF conforme au formulaire SAAQ
- [x] Inclure les informations du véhicule et du technicien
- [x] Générer le tableau des défauts avec codes VMRS
- [x] Ajouter les preuves photographiques au rapport
- [x] Section "Preuves de réparation"
- [x] Signatures électroniques
- [x] **COMPLÉTÉ**: Bouton "Générer PDF" dans l'UI (inspection/[id].tsx)

### Synchronisation cloud
- [x] Schémas Drizzle pour véhicules et inspections (drizzle/schema.ts)
- [x] API tRPC pour sync (server/routers.ts)
- [x] Mode hors-ligne avec AsyncStorage
- [ ] **MANQUANT**: Synchronisation automatique lors de la connexion
- [ ] **MANQUANT**: Gestion des conflits de synchronisation
- [x] **COMPLÉTÉ**: Indicateur de statut sync dans l'UI (SyncIndicator component)

## ✅ Fonctionnalités professionnelles implémentées

### Mode sombre et thèmes
- [x] ThemeProvider créé (lib/theme-context.tsx)
- [x] Support auto/light/dark mode
- [x] Couleur primaire personnalisable
- [x] Sauvegarde des préférences (getSettings/saveSettings)
- [x] Application du thème à tous les écrans
- [x] **COMPLÉTÉ**: Toggle mode sombre dans Settings (connecté au ThemeProvider)
- [x] **COMPLÉTÉ**: Sélecteur de couleur primaire dans Settings

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
- [x] **COMPLÉTÉ**: UI pour afficher les métriques (écran analytics avec onglets)
- [x] **COMPLÉTÉ**: UI pour démarrer/arrêter le chrono de travail (WorkTimer component)
- [x] **COMPLÉTÉ**: UI pour ajouter les coûts de maintenance (/maintenance-costs)

### Espaces publicitaires
- [x] Composant AdBanner (banner + card variants)
- [x] Données mock pour publicités locales
- [x] Composant UsefulLinkCard
- [x] Liens vers ressources SAAQ, VMRS, formations
- [x] Catégorisation par type
- [x] **COMPLÉTÉ**: Intégration dans les écrans (AdBanner dans toutes les pages)
- [ ] **MANQUANT**: API publicitaire réelle

### Gestion de documents
- [x] Service documents-service.ts complet
- [x] Upload de documents PDF et images (expo-document-picker)
- [x] Catégorisation (manual, invoice, registration, insurance, inspection, other)
- [x] Recherche par nom, notes, tags
- [x] Statistiques de documents (DocumentStats)
- [x] Suppression avec nettoyage des fichiers
- [x] **COMPLÉTÉ**: UI pour gérer les documents (/documents)
- [ ] **MANQUANT**: Prévisualisation de documents PDF
- [ ] **MANQUANT**: Intégration dans vehicle detail

### Paramètres avancés
- [x] Interface AppSettings dans data-service.ts
- [x] Sauvegarde des préférences (theme, primaryColor, language, dateFormat, distanceUnit, notifications, autoSync)
- [x] Écran Settings de base créé
- [x] **COMPLÉTÉ**: UI pour modifier la langue (fr/en) dans Settings
- [x] **COMPLÉTÉ**: UI pour changer le format de date dans Settings
- [x] **COMPLÉTÉ**: UI pour changer les unités (km/mi) dans Settings
- [ ] **MANQUANT**: Configuration des collecteurs de métriques
- [ ] **MANQUANT**: Personnalisation des champs de formulaire

## ❌ Fonctionnalités non implémentées

### Relations et tables
- [ ] Table de relations véhicule-technicien
- [ ] Historique des affectations
- [ ] Gestion des équipes
- [ ] Permissions par rôle

### Notifications
- [ ] Notifications push pour alertes critiques
- [ ] Rappels d'inspection périodique
- [ ] Notifications de défauts majeurs

### Rapports avancés
- [ ] Rapport mensuel automatique
- [ ] Graphiques de tendances
- [ ] Comparaison inter-véhicules
- [ ] Prédiction de maintenance

### Multi-langue
- [ ] Traductions complètes (fr/en)
- [ ] Sélecteur de langue fonctionnel
- [ ] Formats de date localisés

## 📋 Résumé de l'état actuel

### ✅ Complètement implémenté et fonctionnel
1. **Architecture de base**: Types, services, composants UI
2. **CRUD véhicules**: Ajout avec validation et upload d'images
3. **Système d'inspection**: Checklist SAAQ complète, capture de preuves
4. **Services backend**: Métriques, documents, PDF, synchronisation
5. **Thème**: Provider créé avec support mode sombre

### ⚠️ Partiellement implémenté (logique OK, UI manquante)
1. **Édition/suppression véhicules**: Fonctions existent, pas de boutons
2. **Mode sombre**: ThemeProvider OK, toggle Settings pas connecté
3. **Métriques**: Service complet, pas d'écran analytics
4. **Documents**: Service complet, pas d'UI de gestion
5. **Publicités**: Composants créés, pas intégrés dans les écrans
6. **Paramètres avancés**: Interface existe, UI incomplète

### ❌ Non implémenté
1. **Synchronisation automatique**: API prête, logique client manquante
2. **Notifications push**: Pas de système de notifications
3. **Multi-langue**: Pas de traductions
4. **Rapports avancés**: Pas de graphiques ni analytics UI

## 🎯 Prochaines priorités recommandées

### Priorité 1 - Compléter les fonctionnalités existantes
1. Connecter le toggle mode sombre dans Settings au ThemeProvider
2. Ajouter les boutons éditer/supprimer dans vehicle detail
3. Créer l'écran analytics pour afficher les métriques
4. Intégrer la gestion de documents dans vehicle detail
5. Ajouter le bouton "Générer PDF" dans inspection detail

### Priorité 2 - Améliorer l'UX
1. Créer un écran Settings complet avec tous les paramètres
2. Ajouter les bannières publicitaires dans le Dashboard
3. Créer une section "Ressources utiles" dans Settings
4. Implémenter la synchronisation automatique
5. Ajouter des indicateurs de chargement et de statut sync

### Priorité 3 - Fonctionnalités avancées
1. Système de notifications push
2. Traductions complètes (fr/en)
3. Rapports avec graphiques
4. Gestion des équipes et permissions
5. Prédiction de maintenance


## 🆕 Nouvelles fonctionnalités implémentées

### Authentification et gestion des utilisateurs
- [x] Écran de connexion/inscription (login screen)
- [x] Intégration avec Manus OAuth
- [x] Gestion de session utilisateur
- [x] Écran de profil utilisateur (dans Settings)
- [x] Déconnexion

### Onboarding (première connexion)
- [x] Écran de bienvenue
- [x] Collecte du nom de l'entreprise
- [x] Upload du logo de l'entreprise
- [x] Sélection de la taille de l'entreprise (1-5, 6-20, 21-50, 51-200, 200+)
- [x] Estimation du nombre de véhicules
- [x] Sélection du type de flotte (camions lourds, semi-remorques, autobus, mixte)
- [x] Configuration initiale des préférences
- [x] Sauvegarde du profil entreprise

### Système de plans et limites
- [x] Définir les plans (Free, Pro, Enterprise)
- [x] Limites Free: 3 véhicules, 10 inspections/mois, pas de sync cloud
- [x] Limites Pro: 25 véhicules, inspections illimitées, sync cloud, métriques avancées
- [x] Limites Enterprise: véhicules illimités, toutes fonctionnalités, support prioritaire
- [x] Service de gestion des limites (subscription-service.ts)
- [x] Vérification des limites avant ajout véhicule/inspection
- [x] Écran d'upgrade avec comparaison des plans
- [x] Indicateur du plan actuel dans Settings
- [x] Compteurs d'utilisation (X/Y véhicules, X/Y inspections)

### Complétion des fonctionnalités UI manquantes
- [x] Connecter le toggle mode sombre dans Settings au ThemeProvider
- [ ] Ajouter sélecteur de couleur primaire dans Settings (structure prête, UI simplifiée)
- [ ] Ajouter boutons éditer/supprimer dans vehicle detail
- [ ] Créer écran analytics pour afficher les métriques
- [ ] Intégrer gestion de documents dans vehicle detail
- [ ] Ajouter bouton "Générer PDF" dans inspection detail
- [ ] Afficher bannières publicitaires dans Dashboard
- [ ] Créer section "Ressources utiles" dans Settings (liens présents, à connecter)
- [ ] Ajouter UI pour langue, format date, unités dans Settings (affiché mais pas interactif)
- [ ] Créer écran de gestion des techniciens


## 💳 Intégration Stripe - Paiement flexible

### Configuration Stripe
- [x] Configurer les clés API Stripe (test et production) - structure prête
- [x] Créer les produits Stripe (véhicules, employés, fonctionnalités) - définis dans stripe-service.ts
- [x] Créer les prix avec tarification basée sur l'usage (metered billing) - logique implémentée
- [ ] Configurer les meters pour tracking d'usage - à faire dans Stripe Dashboard
- [x] Créer les forfaits pour grandes flottes (60+ véhicules, 15+ employés) - calculs implémentés

### Modèle de tarification
- [x] **Pay-per-vehicle**: 15$/mois par véhicule (1-10), 12$/mois (11-30), 10$/mois (31-60), forfait 500$/mois (60+)
- [x] **Pay-per-employee**: 25$/mois par technicien (1-5), 20$/mois (6-15), forfait 250$/mois (15+)
- [x] **Pay-per-feature**: Métriques avancées (50$/mois), Export PDF premium (30$/mois), Sync cloud (40$/mois)
- [x] **Forfaits grandes flottes**: Custom pricing pour 60+ véhicules ou 15+ employés

### Service de paiement
- [x] Créer stripe-service.ts pour gérer les paiements
- [x] Implémenter createCheckoutSession pour paiements one-time
- [x] Implémenter createSubscription pour abonnements (via tRPC)
- [x] Implémenter updateSubscription pour changements de plan
- [x] Implémenter reportUsage pour metered billing (véhicules, employés)
- [x] Implémenter cancelSubscription
- [ ] Gérer les webhooks Stripe (payment_intent.succeeded, subscription.updated, etc.) - à implémenter

### Écrans de paiement
- [x] Écran de sélection de plan avec calculateur de prix dynamique (pricing.tsx)
- [ ] Écran de checkout Stripe intégré - utilise Stripe Checkout Session
- [ ] Écran de gestion d'abonnement (voir factures, changer plan, annuler) - à créer
- [ ] Écran d'historique de paiements - API prête (getInvoices)
- [x] Indicateurs d'usage en temps réel (X véhicules actifs, Y employés) - dans pricing.tsx

### Logique métier
- [x] Vérifier les limites avant ajout véhicule/employé (déjà implémenté avec subscription-service)
- [x] Reporter automatiquement l'usage à Stripe chaque mois (reportUsageToStripe)
- [x] Calculer le prix total basé sur l'usage actuel (calculateTotalPrice)
- [x] Afficher les prévisions de facturation (dans pricing.tsx)
- [x] Gérer les périodes d'essai (14 jours gratuits) - implémenté dans createCheckoutSession
- [x] Implémenter les downgrades/upgrades avec prorata (updateSubscription avec proration_behavior)

### Webhooks et sécurité
- [ ] Créer endpoint /api/webhooks/stripe - à implémenter
- [ ] Vérifier les signatures Stripe - à implémenter
- [ ] Gérer les événements: invoice.payment_succeeded, subscription.deleted, etc. - à implémenter
- [ ] Mettre à jour le statut d'abonnement local - à implémenter
- [ ] Envoyer notifications aux utilisateurs (paiement réussi, échec, etc.) - à implémenter


## 🔄 Prochaines étapes - Finalisation Stripe

### Étape 1: Configuration des clés API Stripe
- [x] Demander les clés API Stripe via webdev_request_secrets
- [x] Ajouter STRIPE_SECRET_KEY pour le backend
- [x] Ajouter STRIPE_PUBLISHABLE_KEY pour le frontend
- [ ] Tester la connexion Stripe avec les clés configurées (attente clés réelles)
- [ ] Créer les produits dans Stripe Dashboard (véhicules, employés, fonctionnalités)

### Étape 2: Écran de gestion d'abonnement
- [x] Créer app/subscription/manage.tsx
- [x] Afficher le plan actuel et les détails d'abonnement
- [x] Afficher l'historique des factures avec liens de téléchargement PDF
- [x] Bouton pour modifier l'abonnement (changer quantités)
- [x] Bouton pour accéder au portail Stripe (gérer moyens de paiement)
- [x] Bouton pour annuler l'abonnement avec confirmation
- [x] Afficher les compteurs d'usage en temps réel
- [x] Lien vers l'écran de tarification pour upgrade

### Étape 3: Webhooks Stripe
- [x] Créer server/webhooks/stripe.ts
- [x] Implémenter la vérification des signatures Stripe
- [x] Gérer l'événement invoice.payment_succeeded
- [x] Gérer l'événement invoice.payment_failed
- [x] Gérer l'événement customer.subscription.updated
- [x] Gérer l'événement customer.subscription.deleted
- [x] Mettre à jour le statut d'abonnement local (AsyncStorage + DB)
- [ ] Envoyer des notifications push aux utilisateurs (TODO dans le code)
- [x] Logger tous les événements webhook pour audit


## 🎯 Tâches prioritaires complétées

### 1. Connecter le mode sombre au ThemeProvider
- [x] Vérifier que le toggle dans Settings utilise bien useTheme()
- [x] S'assurer que tous les écrans utilisent les couleurs du thème (background, foreground, surface, etc.)
- [x] Appliquer le mode sombre aux arrière-plans de tous les composants
- [x] Tester le changement de thème en temps réel

### 2. Ajouter boutons éditer/supprimer dans vehicle detail
- [x] Ajouter bouton "Éditer" dans l'écran vehicle/[id].tsx
- [x] Créer navigation vers vehicle/add.tsx avec mode édition
- [x] Ajouter bouton "Supprimer" avec confirmation
- [x] Utiliser deleteVehicle() du data-service.ts
- [x] Rediriger vers la liste après suppression

### 3. Créer l'écran analytics
- [x] Créer app/analytics.tsx
- [x] Afficher les métriques de flotte (FleetMetrics)
- [x] Graphique des temps d'inspection par mois
- [x] Graphique des coûts de maintenance par véhicule
- [x] Graphique des défauts les plus fréquents
- [x] Statistiques par technicien
- [x] Bouton d'export CSV

### 4. Intégrer gestion de documents dans vehicle detail
- [x] Ajouter section "Documents" dans vehicle/[id].tsx
- [x] Bouton "Ajouter document" avec expo-document-picker
- [x] Liste des documents avec catégories
- [x] Bouton de suppression par document
- [x] Utiliser documents-service.ts
- [x] Afficher les statistiques de documents

### 5. Ajouter bouton génération PDF dans inspection detail
- [x] Ajouter bouton "Générer rapport PDF" dans inspection/[id].tsx (déjà présent)
- [x] Utiliser generateInspectionPDF() du pdf-generator.ts
- [x] Afficher un indicateur de chargement
- [x] Partager le PDF généré (expo-sharing)
- [x] Gérer les erreurs de génération


## 🚀 Tâches en cours d'implémentation

### 1. Lien vers analytics depuis Dashboard
- [ ] Ajouter bouton "Voir rapports" dans la section Actions rapides
- [ ] Navigation vers /analytics
- [ ] Icône chart/graph appropriée

### 2. Écran de gestion des techniciens
- [ ] Créer app/team.tsx
- [ ] Liste des techniciens avec photos
- [ ] Formulaire d'ajout de technicien (nom, email, téléphone, certifications)
- [ ] Afficher les statistiques par technicien (depuis metrics-service)
- [ ] Boutons éditer/supprimer technicien
- [ ] Intégrer dans la Tab Bar ou Settings

### 3. Notifications push
- [ ] Configurer expo-notifications
- [ ] Demander les permissions de notification
- [ ] Envoyer notification lors d'inspection complétée
- [ ] Envoyer notification pour défauts majeurs détectés
- [ ] Envoyer notification pour échéances de maintenance
- [ ] Intégrer avec webhooks Stripe pour notifications de paiement
- [ ] Paramètres de notifications dans Settings

### 4. Bannières publicitaires dans Dashboard
- [ ] Intégrer AdBanner component dans Dashboard
- [ ] Afficher 1-2 bannières entre les sections
- [ ] Rotation des publicités locales
- [ ] Liens cliquables vers fournisseurs

### 5. Section Ressources utiles dans Settings
- [ ] Créer section "Ressources" dans Settings
- [ ] Afficher les UsefulLinkCard
- [ ] Catégories: Réglementation, Formations, Outils, Support
- [ ] Liens vers SAAQ, VMRS, formations, support FleetCore

### 6. Synchronisation automatique
- [ ] Détecter la connectivité réseau
- [ ] Synchroniser automatiquement au démarrage si connecté
- [ ] Synchroniser après chaque modification (véhicule, inspection)
- [ ] Afficher indicateur de statut sync dans la Tab Bar
- [ ] Gérer les conflits de synchronisation (last-write-wins)


## 🔧 Mise à jour inspection Pré-SAAQ complète
- [ ] Analyser le guide de vérification mécanique SAAQ complet
- [ ] Mettre à jour lib/mock-data.ts avec TOUS les composants officiels
- [ ] Vérifier que les 9 sections SAAQ sont complètes
- [ ] Ajouter tous les points de contrôle manquants
- [ ] Valider la conformité avec le formulaire officiel

## 🚀 Fonctionnalités prioritaires restantes
- [ ] Implémenter l'édition de véhicule (modifier vehicle/add.tsx)
- [ ] Créer l'écran de paramètres de notification (/settings/notifications)
- [ ] Activer les permissions de notification au démarrage (app/_layout.tsx)
- [ ] Intégrer les appels de notification dans les workflows


## 🔧 Mise à jour inspection Pré-SAAQ
- [x] Analyser le guide de vérification mécanique SAAQ complet
- [x] Générer la checklist avec TOUS les composants exigés (305 items, 420 défauts)
- [x] Mettre à jour lib/mock-data.ts avec la checklist complète
- [x] Ajouter les propriétés minorDefects et majorDefects au type ChecklistItem

## 🔔 Fonctionnalités restantes

### 1. Édition de véhicule
- [x] Modifier app/vehicle/add.tsx pour accepter vehicleId en paramètre
- [x] Charger les données du véhicule en mode édition
- [x] Appeler updateVehicle() au lieu de addVehicle()
- [x] Modifier le titre de l'écran selon le mode

### 2. Paramètres de notification
- [x] Créer app/settings/notifications.tsx
- [x] Afficher tous les types de notifications avec toggles
- [x] Sauvegarder les préférences avec saveNotificationSettings()
- [ ] Ajouter un lien depuis Settings vers cet écran (TODO)

### 3. Permissions de notification au démarrage
- [x] Ajouter requestNotificationPermissions() dans app/_layout.tsx
- [x] Appeler au premier lancement de l'app
- [x] Gérer les erreurs silencieusement


## 🔗 Modules connexes et intégrations

### Étape 1: Lien vers paramètres de notification
- [ ] Ajouter bouton "Gérer les notifications" dans Settings
- [ ] Navigation vers /settings/notifications

### Étape 2: Écran de détail technicien
- [ ] Créer app/team/[id].tsx
- [ ] Afficher statistiques détaillées (inspections, temps moyen, défauts)
- [ ] Utiliser getTechnicianMetrics() du metrics-service
- [ ] Historique des inspections du technicien

### Étape 3: Notifications dans les workflows
- [ ] Appeler notifyInspectionCompleted() à la fin d'une inspection
- [ ] Appeler notifyMajorDefect() lors de la détection de défauts majeurs
- [ ] Intégrer dans l'écran checklist

### Module FleetCommand - Bons de travail
- [ ] Créer lib/work-order-service.ts
- [ ] Types: WorkOrder, WorkOrderItem, WorkOrderStatus
- [ ] Fonctions CRUD pour bons de travail
- [ ] Créer app/work-orders/index.tsx (liste des bons)
- [ ] Créer app/work-orders/[id].tsx (détail bon de travail)
- [ ] Créer app/work-orders/create.tsx (création)
- [ ] Génération automatique depuis inspection avec défauts
- [ ] Statuts: DRAFT, PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Assignation à un technicien
- [ ] Estimation des coûts et temps
- [ ] Suivi des pièces nécessaires

### Module FleetCrew - Gestion du matériel
- [ ] Créer lib/inventory-service.ts
- [ ] Types: InventoryItem, InventoryCategory, StockMovement
- [ ] Fonctions CRUD pour inventaire
- [ ] Créer app/inventory/index.tsx (liste du matériel)
- [ ] Créer app/inventory/[id].tsx (détail article)
- [ ] Créer app/inventory/add.tsx (ajout article)
- [ ] Catégories: pièces, outils, consommables, équipements
- [ ] Gestion des stocks (quantité, seuil minimum, alertes)
- [ ] Mouvements de stock (entrée, sortie, ajustement)
- [ ] Liaison avec bons de travail (pièces utilisées)
- [ ] Fournisseurs et prix

### Notifications automatiques
- [ ] Notification à la création d'un bon de travail
- [ ] Notification quand stock faible
- [ ] Notification assignation technicien
- [ ] Notification bon de travail complété


## 🆕 FleetCommand et FleetCrew - Modules connexes (v10)

### FleetCommand - Gestion des bons de travail
- [x] Service work-order-service.ts complet
- [x] Types WorkOrder, WorkOrderItem, WorkOrderStatus, WorkOrderPriority
- [x] CRUD complet pour bons de travail
- [x] Création automatique de bon de travail depuis inspection avec défauts
- [x] Écran liste des bons de travail (/work-orders)
- [x] Écran détail bon de travail (/work-orders/[id])
- [x] Écran création bon de travail (/work-orders/create)
- [x] Assignation de technicien aux bons de travail
- [x] Suivi de progression des tâches
- [x] Statuts: DRAFT, PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
- [x] Priorités: LOW, MEDIUM, HIGH, URGENT
- [x] Estimation temps et coûts
- [x] Statistiques des bons de travail

### FleetCrew - Gestion du matériel et inventaire
- [x] Service inventory-service.ts complet
- [x] Types InventoryItem, InventoryTransaction, Supplier, InventoryCategory
- [x] CRUD complet pour articles d'inventaire
- [x] Catégories: Pièces, Outils, Fluides, Consommables, Sécurité, Électrique, Autres
- [x] Écran liste inventaire (/inventory)
- [x] Écran détail article (/inventory/[id])
- [x] Écran ajout article (/inventory/add)
- [x] Gestion des entrées/sorties de stock
- [x] Ajustements manuels de stock
- [x] Historique des transactions
- [x] Alertes stock bas et rupture
- [x] Codes VMRS associés aux articles
- [x] Statistiques inventaire (valeur totale, articles en stock bas)

### Intégration entre modules
- [x] Création automatique de bon de travail lors d'inspection avec défauts
- [x] Notification push lors de création de bon de travail
- [x] Lien depuis Dashboard vers FleetCommand et FleetCrew
- [x] Actions rapides réorganisées avec accès aux modules

### Notifications améliorées
- [x] notifyWorkOrderCreated() - Notification création bon de travail
- [x] Intégration dans workflow d'inspection
- [x] Notification pour défauts majeurs avec détails
- [x] Notification pour défauts mineurs avec bon de travail

### Améliorations UI
- [x] Lien vers paramètres de notification depuis Settings
- [x] Dashboard avec 8 actions rapides (2 lignes)
- [x] Icônes distinctives pour FleetCommand (orange) et FleetCrew (violet)


## 🆕 Analytics et Chrono de travail (v11)

### Écran Analytics avec métriques
- [x] Créer l'écran /analytics avec tableau de bord métriques
- [x] Afficher les KPIs de flotte (véhicules, inspections, défauts)
- [x] Graphiques de tendances (inspections par mois, défauts par type)
- [x] Statistiques FleetCommand (bons de travail, coûts)
- [x] Statistiques FleetCrew (inventaire, valeur stock)
- [x] Statistiques par technicien (inspections, temps moyen)
- [x] Export des métriques en CSV
- [x] Onglets pour navigation (Flotte, FleetCommand, FleetCrew)

### Chrono de travail
- [x] Composant WorkTimer pour démarrer/arrêter le chrono
- [x] Intégration dans l'écran de détail bon de travail
- [x] Sauvegarde automatique du temps de travail (AsyncStorage)
- [x] Historique des sessions de temps
- [x] Calcul du temps total par bon de travail
- [x] Affichage des sessions de temps dans le détail

### Intégration inventaire-bons de travail
- [x] Ajouter section "Pièces utilisées" dans bon de travail
- [x] Composant PartsSelector pour sélection de pièces
- [x] Sélection de pièces depuis l'inventaire FleetCrew
- [x] Mise à jour automatique du stock lors de consommation
- [x] Calcul du coût total des pièces
- [x] Modal de recherche de pièces avec filtres

### KPIs FleetCommand
- [x] Temps moyen de réparation (dans Analytics)
- [x] Coûts estimés vs réels (dans Analytics)
- [x] Taux de complétion des bons de travail
- [x] Bons de travail en attente/en cours (dans Dashboard)
- [x] KPIs FleetCommand et FleetCrew dans le Dashboard principal


## 🆕 Intégration Google Calendar (v12)

### Service Google Calendar
- [x] Explorer les outils MCP Google Calendar disponibles
- [x] Créer calendar-service.ts pour l'intégration
- [x] Fonctions pour créer/modifier/supprimer des rappels
- [x] Fonctions pour récupérer les rappels à venir
- [x] Gestion des rappels et notifications
- [x] Génération automatique de rappels de démo

### Composants visuels
- [x] CalendarMiniWidget - Mini calendrier avec événements et indicateurs
- [x] ReminderCard - Carte de rappel avec actions (compléter, détails)
- [x] UpcomingEventsWidget - Liste des rappels à venir avec stats
- [x] DeadlineAlert - Alerte animée pour dates critiques

### Types de rappels FleetCore
- [x] Rappels d'inspection périodique (SAAQ)
- [x] Rappels de maintenance préventive
- [x] Alertes d'expiration (assurance, immatriculation)
- [x] Rappels de vidange d'huile
- [x] Rappels de rotation des pneus
- [x] Rappels personnalisés

### Intégration dans l'application
- [x] Widget rappels dans le Dashboard (UpcomingEventsWidget)
- [x] Alertes en retard dans le Dashboard (DeadlineAlert)
- [x] Écran de gestion des rappels (/reminders)
- [x] Écran de création de rappel (/reminders/create)
- [x] Écran de détail de rappel (/reminder/[id])
- [x] Filtres par type, période et priorité
- [x] Mini calendrier avec indicateurs d'événements


## 🆕 Notifications et Synchronisation (v13)

### Notifications push
- [x] Service de notifications push avec expo-notifications (push-notification-service.ts)
- [x] Planification des notifications X jours avant échéance (14, 7, 3, 1, 0 jours)
- [x] Écran de paramètres des notifications amélioré
- [x] Gestion des permissions de notification (Android channels)
- [x] Notifications pour rappels en retard (alertes urgentes)

### Synchronisation Google Calendar
- [x] Connexion au compte Google via MCP (calendar-service.ts)
- [x] Création d'événements Google Calendar depuis FleetCore
- [x] Synchronisation automatique des rappels
- [x] Écran de configuration (/settings/calendar-sync)
- [x] Indicateur de statut de synchronisation
- [x] Gestion des erreurs de synchronisation

### Rappels automatiques par véhicule
- [x] Création automatique lors de l'ajout d'un véhicule
- [x] Rappels par défaut: inspection, assurance, immatriculation, maintenance
- [x] Fonction createVehicleDefaultReminders()
- [x] Fonction getVehicleReminders() et deleteVehicleReminders()


## 🆕 Espaces publicitaires et nouveau thème (v14)

### Espaces publicitaires
- [x] Créer le composant AdBanner avec rotation automatique (5 secondes)
- [x] Service de gestion des annonces (ad-service.ts)
- [x] Intégrer les bannières dans toutes les pages principales
- [x] Animation de transition fluide entre les annonces (fade + slide)
- [x] Support des différents formats d'annonces (banner, card, compact)
- [x] Indicateurs de pagination cliquables
- [x] Annonces de démo pour flottes (Michelin, Total, Desjardins, NAPA, etc.)

### Nouveau thème FleetCore
- [x] Analyser l'icône et extraire les couleurs principales (cyan néon #00D4FF)
- [x] Définir la palette de couleurs sobre et épurée
- [x] Mode sombre optimisé (fond #030712, surface #0A1628)
- [x] Mode clair optimisé (fond #F8FAFC, surface #FFFFFF)
- [x] Mettre à jour theme.config.js avec 14 tokens de couleur
- [x] Appliquer le style à tous les composants (KPICard, VehicleCard, InspectionCard, AlertCard, StatusBadge, SearchBar)
- [x] Bordures subtiles avec effet glow
- [x] Icônes avec fond coloré et bordure


## 🆕 Relations et tables (v16)

### Service de gestion des équipes
- [x] Créer team-service.ts avec types Technician, Team, Assignment, RolePermission
- [x] CRUD techniciens (add, update, delete, get, getByTeam)
- [x] CRUD équipes (add, update, delete, get, getStats)
- [x] Gestion des affectations véhicule-technicien (assign, end, getByVehicle)
- [x] Historique des affectations avec dates

### Écran de gestion des techniciens
- [x] Liste des techniciens avec recherche et filtres (/technicians)
- [x] Ajout de technicien (nom, email, téléphone, spécialités) (/technician/add)
- [x] Détail technicien avec statistiques (/technician/[id])
- [x] Modification et suppression de technicien
- [x] Affichage des véhicules assignés et équipe

### Écran de gestion des équipes
- [x] Liste des équipes avec membres (/teams)
- [x] Création d'équipe avec sélection de couleur (/team/add)
- [x] Détail équipe avec membres (/team-detail/[id])
- [x] Modification et suppression d'équipe
- [x] Statistiques par équipe (membres, inspections, véhicules, performance)

### Affectations véhicule-technicien
- [x] Interface d'affectation dans détail véhicule (VehicleAssignmentManager)
- [x] Liste des techniciens assignés avec dates
- [x] Affectation multiple (équipe entière)
- [x] Dates de début/fin d'affectation
- [x] Modal de sélection avec onglets (techniciens/équipes)

### Permissions par rôle
- [x] Définir les rôles (admin, manager, technician, viewer)
- [x] Permissions par fonctionnalité (8 ressources: véhicules, inspections, workOrders, inventory, technicians, teams, reports, settings)
- [x] UI de gestion des rôles (/settings/permissions)
- [x] Toggles CRUD par ressource et par rôle
- [x] Section Administration dans les paramètres


## 🆕 Fiche d'entretien préventif PEP SAAQ (v17)

### Service PEP
- [x] Créer pep-service.ts avec structure JSON complète des 12 sections SAAQ
- [x] Types pour PEPForm, PEPSection, PEPComponent, PEPDefect
- [x] Fonctions CRUD pour les fiches PEP (create, read, update, delete)
- [x] Validation des défauts mineures/majeures avec compteurs
- [x] Calcul automatique de la prochaine date d'entretien selon PNBV

### Formulaire PEP interactif
- [x] Écran principal avec en-tête véhicule (plaque, NIV, PNBV, etc.)
- [x] Navigation par sections (12 sections SAAQ)
- [x] Grille de composants avec colonnes S/O, C, Min, Maj
- [x] Sélection rapide des défauts par composant
- [x] Champ de remarques et notes
- [x] Écran de sélection de véhicule (/pep/select-vehicle)
- [x] Liste des fiches PEP (/pep)

### Diagramme de localisation
- [x] Vue de dessus du véhicule avec positions numérotées (VehicleDiagram)
- [x] Sélection interactive des positions (pneus, freins, essieux)
- [x] Affichage des mesures par position
- [x] Légende des statuts (conforme, mineur, majeur)

### Restriction par plan d'abonnement
- [x] Vérification du plan (Plus, Pro, Entreprise uniquement)
- [x] Écran de mise à niveau pour les plans Free (/subscription/upgrade)
- [x] Badge "Premium" sur la fonctionnalité
- [x] Fonction canAccessPEP() dans subscription-service
- [x] Ajout du plan "Plus" (29$/mois) entre Free et Pro

### Génération PDF
- [x] Export PDF conforme au formulaire SAAQ 6609 30
- [x] Fonction generatePEPPDF() et generatePEPReportData()
- [x] Écran de signature (/pep/sign) avec résumé des défauts
- [x] Historique des fiches PEP par véhicule (getPEPFormsByVehicle)


## 🆕 Améliorations PEP (v18)

### Lien PEP dans le Dashboard
- [x] Ajouter KPI "Fiches PEP" dans la section Modules connexes
- [x] Badge "PRO" pour indiquer la restriction
- [x] Navigation vers /pep
- [x] Stats globales PEP (getGlobalPEPStats)
- [x] KPI "PEP à venir" si des fiches sont dues cette semaine

### Historique PEP par véhicule
- [x] Afficher la liste des fiches PEP dans le détail véhicule
- [x] Indicateur de conformité (conforme, défauts mineurs, défauts majeurs)
- [x] Date du prochain entretien
- [x] Lien vers le détail de chaque fiche PEP
- [x] Bouton "+ Nouvelle" pour créer une fiche PEP
- [x] Message et bouton upgrade pour les plans Free

### Rappels automatiques PEP
- [x] Créer un rappel automatique lors de la complétion d'une fiche PEP (createPEPReminder)
- [x] Date basée sur le calcul PNBV (3 ou 6 mois)
- [x] Type de rappel PEP_DUE ajouté au calendar-service
- [x] Rappels 30, 14, 7, 1 jours avant échéance
- [x] Fonctions getPEPReminders et deletePEPReminders


## 🆕 Documentation utilisateurs (v19)

### Documentation par rôle
- [x] Guide administrateur (docs/guide-administrateur.md)
  - Configuration initiale et thème
  - Gestion des abonnements (Free, Plus, Pro, Entreprise)
  - Gestion des utilisateurs et permissions (4 rôles)
  - Configuration des véhicules et rappels automatiques
  - Synchronisation et sauvegarde
  - Sécurité et conformité SAAQ
- [x] Guide gestionnaire de flotte (docs/guide-gestionnaire.md)
  - Tableau de bord et KPIs
  - Gestion des véhicules et fiches détaillées
  - Suivi des inspections et statuts
  - FleetCommand (bons de travail)
  - FleetCrew (inventaire)
  - Analytics et rapports
  - Calendrier et rappels
  - Bonnes pratiques et indicateurs
- [x] Guide technicien (docs/guide-technicien.md)
  - Prise en main et navigation
  - Réalisation d'inspection (8 sections)
  - Documentation des défauts avec photos
  - Fiches PEP SAAQ (12 sections)
  - Bons de travail et chronomètre
  - Gestion de l'inventaire
  - Codes VMRS courants
- [x] Guide conducteur (docs/guide-conducteur.md)
  - Obligations légales et responsabilités
  - Ronde de sécurité en 8 sections
  - Évaluation des composants (S/O, C, Min, Maj)
  - Signalement des défauts (mineurs vs majeurs)
  - Fonctionnalités utiles et mode hors-ligne
  - Aide-mémoire rapide
- [x] Référence rapide (docs/reference-rapide.md)
  - Navigation et actions rapides
  - Statuts et codes
  - Plans d'abonnement
  - Rôles et permissions
  - Codes VMRS et glossaire
- [x] Index de documentation (docs/README.md)
  - Présentation de FleetCore
  - Liens vers tous les guides
  - Architecture technique
  - Conformité réglementaire SAAQ
  - Historique des versions


## 🆕 FAQ Interactive (v20)

### Section FAQ
- [x] Créer le document FAQ complet (docs/faq.md)
- [x] Questions générales sur FleetCore (5 questions)
- [x] Véhicules et flotte (6 questions)
- [x] Inspections et rondes de sécurité (7 questions)
- [x] Fiches PEP et conformité SAAQ (6 questions)
- [x] FleetCommand - Bons de travail (6 questions)
- [x] FleetCrew - Inventaire (4 questions)
- [x] Techniciens et équipes (5 questions)
- [x] Synchronisation et données (5 questions)
- [x] Notifications et rappels (5 questions)
- [x] Abonnements et facturation (6 questions)
- [x] Dépannage technique (7 questions)
- [x] Mettre à jour l'index de documentation (README.md)


## 🆕 Tutoriel de première utilisation (v21)

### Service Onboarding
- [x] Créer onboarding-service.ts pour gérer l'état du tutoriel
- [x] Stockage AsyncStorage pour savoir si l'utilisateur a terminé l'onboarding
- [x] Gestion des étapes du tutoriel (progression, 6 étapes)
- [x] Fonction resetOnboarding() pour réinitialiser depuis les paramètres
- [x] Fonctions completeOnboarding(), hasCompletedOnboarding()

### Écrans de bienvenue (Welcome Slides)
- [x] Écran 1: Bienvenue dans FleetCore (icône camion)
- [x] Écran 2: Gestion de votre flotte (icône véhicule)
- [x] Écran 3: Inspections et conformité SAAQ (icône clipboard)
- [x] Écran 4: FleetCommand et FleetCrew (icône clé)
- [x] Écran 5: Rappels et notifications (icône cloche)
- [x] Écran 6: Prêt à commencer (icône check)
- [x] Navigation par swipe (FlatList horizontal)
- [x] Indicateurs de progression (dots animés)
- [x] Boutons "Passer" et "Commencer"
- [x] Animations d'entrée (fade + scale)

### Composant Tooltip contextuel
- [x] Composant OnboardingTooltip avec flèche directionnelle
- [x] Overlay semi-transparent avec trou pour l'élément cible
- [x] Animation d'apparition/disparition (fade + slide)
- [x] Boutons "Suivant" et "Passer le guide"
- [x] Positionnement automatique (top/bottom)

### Intégration dans l'application
- [x] Route /onboarding dans _layout.tsx (gestureEnabled: false)
- [x] Section "Aide & Tutoriel" dans les paramètres
- [x] Option "Revoir le tutoriel" avec resetOnboarding()
- [x] Écran FAQ interactif (/help) avec recherche et filtres
- [x] 20 questions FAQ intégrées dans l'app
- [x] Bouton "Contacter le support"
- [ ] Vérification au démarrage si onboarding complété
- [ ] Redirection vers les écrans de bienvenue si premier lancement
- [ ] Guide contextuel sur le Dashboard après les slides
- [ ] Option "Revoir le tutoriel" dans les paramètres


## 🆕 Interfaces par rôle (v22)

### Service de gestion des rôles
- [ ] Étendre role-service.ts avec 5 rôles: admin, manager, dispatcher, technician, driver
- [ ] Permissions granulaires par fonctionnalité et par rôle
- [ ] Fonction getCurrentUserRole() pour déterminer le rôle actif
- [ ] Fonction canAccess(feature) pour vérifier les permissions
- [ ] Redirection automatique vers le dashboard approprié

### Dashboard Administrateur
- [ ] Vue d'ensemble de toute l'organisation
- [ ] Gestion des utilisateurs et des rôles
- [ ] Configuration système et abonnements
- [ ] Statistiques globales et rapports
- [ ] Audit des activités

### Dashboard Gestionnaire
- [ ] KPIs de flotte (véhicules, inspections, conformité)
- [ ] Suivi des coûts et budgets
- [ ] Rapports analytiques
- [ ] Gestion des équipes
- [ ] Approbation des bons de travail

### Dashboard Dispatcher
- [ ] Vue carte des véhicules (simulation)
- [ ] Affectation des missions aux chauffeurs
- [ ] Suivi en temps réel des trajets
- [ ] Gestion des urgences et priorités
- [ ] Communication avec les chauffeurs

### Dashboard Technicien
- [ ] Bons de travail assignés
- [ ] Inspections à effectuer
- [ ] Fiches PEP en cours
- [ ] Historique des interventions
- [ ] Chronomètre de travail

### Dashboard Chauffeur
- [ ] Véhicule assigné du jour
- [ ] Ronde de sécurité quotidienne
- [ ] Signalement de défauts
- [ ] Historique des trajets
- [ ] Documents du véhicule

### Relations inter-rôles
- [ ] Dispatcher → Chauffeur: assignation de missions
- [ ] Chauffeur → Technicien: signalement de défauts → création de bon de travail
- [ ] Technicien → Gestionnaire: complétion de bon de travail → approbation
- [ ] Gestionnaire → Administrateur: rapports et demandes d'approbation
- [ ] Notifications croisées entre rôles
- [ ] Workflow d'escalade des problèmes



## 🆕 Interfaces utilisateurs dédiées par rôle (Janvier 2026)

### Service de gestion des rôles
- [x] Créer le service role-service.ts avec 5 rôles utilisateurs
- [x] Définir les permissions par rôle (admin, manager, dispatcher, technician, driver)
- [x] Créer les types User, Mission, DefectReport, ActivityLog
- [x] Implémenter les fonctions CRUD pour utilisateurs
- [x] Implémenter les fonctions de gestion des missions
- [x] Implémenter les fonctions de signalement de défauts
- [x] Implémenter le journal d'activité
- [x] Créer les données de démonstration

### Dashboard Administrateur
- [x] Vue d'ensemble complète de l'organisation
- [x] Statistiques globales (véhicules, inspections, bons de travail)
- [x] Gestion des utilisateurs par rôle
- [x] Journal d'audit des activités
- [x] Actions rapides (ajouter utilisateur, configuration système)

### Dashboard Gestionnaire de flotte
- [x] KPIs de flotte (véhicules actifs, en maintenance)
- [x] Suivi des coûts de maintenance
- [x] Gestion des équipes
- [x] Approbation des bons de travail complétés
- [x] Taux de conformité

### Dashboard Dispatcher (Répartiteur)
- [x] Vue calendrier des tâches
- [x] Assignation des techniciens aux bons de travail
- [x] Suivi des techniciens actifs
- [x] Alertes urgentes
- [x] Bons de travail non assignés

### Dashboard Technicien
- [x] Bons de travail assignés
- [x] Chronomètre de travail intégré
- [x] Alertes stock bas
- [x] Actions rapides (inspection, PEP, inventaire)
- [x] Démarrer/terminer un bon de travail

### Dashboard Chauffeur
- [x] Véhicule assigné
- [x] Ronde de sécurité quotidienne (8 points de vérification)
- [x] Signalement de défauts avec modal
- [x] Rappels à venir
- [x] Actions rapides

### Composants partagés
- [x] RoleSwitcher - Composant pour basculer entre les rôles/utilisateurs
- [x] Intégration avec le système de navigation Expo Router


## 🆕 Intégration Jotform et Navigation par rôle (Janvier 2026)

### Formulaires Jotform pour chauffeurs
- [x] Explorer les outils Jotform MCP disponibles
- [x] Créer le formulaire de ronde de sécurité quotidienne avec upload d'images (ID: 260015116962046)
- [x] Créer le formulaire de signalement de défauts avec photos (ID: 260015390984054)
- [x] Créer le formulaire de rapport d'incident (ID: 260015304617042)
- [x] Intégrer les formulaires dans le Dashboard Chauffeur
- [x] Configurer la récupération des soumissions

### Navigation entre dashboards par rôle
- [x] Créer un écran de sélection de rôle au démarrage
- [x] Ajouter un menu de navigation vers les dashboards (dans Paramètres)
- [x] Implémenter la redirection automatique selon le rôle utilisateur

### Service de diagnostic avec Perplexity
- [x] Créer le service perplexity-service.ts
- [x] Implémenter la fonction d'analyse de défauts
- [x] Intégrer les suggestions de diagnostic dans les formulaires
- [x] Créer l'interface de consultation des diagnostics (dans modal signalement)


## 🆕 Vision Produit FleetCore v1.0 (Janvier 2026)

### Gestion des véhicules avancée
- [ ] Ajouter les états avancés (Actif, En maintenance, Immobilisé légalement, Interdit de circuler, Retiré de flotte)
- [ ] Implémenter la galerie d'images multiples par véhicule
- [ ] Ajouter la gestion des documents liés (immatriculation, assurance, inspections, factures)
- [ ] Créer l'historique inviolable par véhicule

### Traçabilité et preuve légale (CRITIQUE)
- [ ] Implémenter l'Audit Log immuable (qui, quand, quoi, sur quel objet, offline/online)
- [ ] Ajouter le versioning des inspections (v1/v2/v3)
- [ ] Générer des PDF figés par version avec hash et timestamp
- [ ] Empêcher la modification d'inspection complétée sans nouvelle version

### Mode terrain et résilience
- [ ] Améliorer le mode offline-first (inspections 100% hors ligne)
- [ ] Implémenter la file d'actions en attente
- [ ] Ajouter la synchronisation automatique au retour réseau
- [ ] Implémenter l'autosave et récupération après crash
- [ ] Gérer l'état "inspection interrompue"

### Notifications métier intelligentes
- [ ] Notification inspection en retard
- [ ] Notification défaut bloquant non réparé
- [ ] Notification véhicule utilisé malgré blocage
- [ ] Notification paiement échoué (Stripe)
- [ ] Notification limite de plan atteinte

### Rapports et métriques v1.0
- [ ] Rapport historique inspections par véhicule
- [ ] Rapport taux de conformité (6/12 mois)
- [ ] Rapport temps immobilisé cumulé
- [ ] Rapport coûts de maintenance
- [ ] Export PDF réglementaire
- [ ] Export CSV métriques

### IA - périmètre réaliste v1.0
- [ ] Analyse de récurrence de défauts
- [ ] Alertes de risque simples
- [ ] Estimation de durée basée sur historique
- [ ] Explainability obligatoire (source, historique, niveau de confiance)


## 🆕 Vision Produit FleetCore v1.0 - Implémenté

### Gestion avancée des véhicules
- [x] États avancés (active, maintenance, legally_immobilized, circulation_banned, retired) - types.ts
- [x] Galerie de photos par véhicule (types définis) - VehiclePhoto interface
- [x] Documents attachés (immatriculation, assurance, factures) - VehicleDocument interface

### Traçabilité et preuve légale
- [x] Audit log complet (qui, quoi, quand) - audit-service.ts
- [x] Versioning des inspections - InspectionVersion interface
- [x] Verrouillage après complétion - isLocked, lockedAt, lockedBy

### Mode terrain et résilience
- [x] File d'actions en attente (offline-first) - sync-service.ts
- [x] Synchronisation automatique - startPeriodicSync()
- [x] Autosave et récupération d'inspections interrompues - autosave(), getInterruptedInspections()

### Notifications métier intelligentes
- [x] Inspection en retard - business-notification-service.ts
- [x] Défaut bloquant non réparé - checkUnresolvedBlockingDefects()
- [x] Véhicule utilisé malgré blocage - alertVehicleUsedWhileBlocked()
- [x] Paiement échoué - notifyPaymentFailed()
- [x] Limite de plan atteinte - notifyPlanLimitApproaching()
- [x] Document expirant - notifyDocumentExpiring()

### Rapports et métriques
- [x] Historique inspections par véhicule - reports-service.ts
- [x] Taux de conformité (6/12 mois) - generateComplianceReport()
- [x] Temps immobilisé cumulé - totalDowntimeHours
- [x] Coûts de maintenance - totalMaintenanceCost
- [x] Exports PDF et CSV - exportReportToCSV(), exportFleetMetricsToCSV()
- [x] Analyse de récurrence des défauts - analyzeDefectRecurrence()
- [x] Estimation durée inspection - estimateInspectionDuration()


## 🆕 Refonte Interface Utilisateur - Design Cohérent

### Dashboard principal
- [ ] Refondre le Dashboard avec KPIs visuels animés
- [ ] Ajouter des graphiques de tendances (conformité, défauts)
- [ ] Créer une section "Actions rapides" avec icônes attractives
- [ ] Intégrer un fil d'activité récente avec timeline visuelle
- [ ] Ajouter des indicateurs de statut colorés et badges

### Navigation et structure
- [ ] Améliorer la barre d'onglets avec badges de notification
- [ ] Créer un menu hamburger pour accès aux fonctionnalités avancées
- [ ] Ajouter un header contextuel avec breadcrumb
- [ ] Implémenter une navigation fluide entre les écrans

### Composants UI cohérents
- [ ] Créer un système de cartes unifié (StatCard, ActionCard, InfoCard)
- [ ] Définir une palette de couleurs sémantiques (succès, alerte, danger)
- [ ] Créer des badges et tags réutilisables
- [ ] Implémenter des indicateurs de progression visuels
- [ ] Créer des composants de liste avec avatars et icônes

### Écrans de fonctionnalités
- [ ] Créer l'écran Centre de notifications avec filtres
- [ ] Créer l'écran Rapports avec visualisations
- [ ] Créer l'écran Journal d'audit avec timeline
- [ ] Améliorer l'écran Paramètres avec sections organisées

### Harmonisation visuelle
- [ ] Appliquer le design system à tous les écrans existants
- [ ] Ajouter des animations et transitions subtiles
- [ ] Uniformiser les espacements et typographies
- [ ] Améliorer les états vides avec illustrations


## 🆕 Refonte Interface Utilisateur (UI/UX)

### Refonte Dashboard principal
- [x] Nouveau layout avec KPIs visuels et animations
- [x] Composants StatCard, ActionCard, SectionHeader
- [x] Intégration ProgressRing pour conformité
- [x] Timeline d'activité récente
- [x] Accès rapide aux espaces de travail par rôle

### Navigation et menus
- [x] Tab bar avec badges de notification
- [x] Centre de notifications complet
- [x] Filtres et recherche améliorés

### Composants UI réutilisables
- [x] EmptyState avec illustrations
- [x] StatusBadge amélioré
- [x] QuickStats pour métriques en ligne
- [x] ActivityTimeline pour historique

### Écrans de rapports et audit
- [x] Écran Rapports avec visualisations
- [x] Écran Journal d'audit
- [x] Export CSV/PDF

### Harmonisation des écrans existants
- [x] Écran Véhicules avec QuickStats
- [ ] Écran Inspections avec nouveau design
- [ ] Écran Settings avec sections améliorées
