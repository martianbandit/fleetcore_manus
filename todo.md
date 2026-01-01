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
- [ ] **MANQUANT**: Édition des informations véhicule (pas d'écran edit)
- [ ] **MANQUANT**: Suppression de véhicule (fonction existe mais pas de bouton UI)
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
- [ ] **MANQUANT**: Bouton "Générer PDF" dans l'UI (fonction existe)

### Synchronisation cloud
- [x] Schémas Drizzle pour véhicules et inspections (drizzle/schema.ts)
- [x] API tRPC pour sync (server/routers.ts)
- [x] Mode hors-ligne avec AsyncStorage
- [ ] **MANQUANT**: Synchronisation automatique lors de la connexion
- [ ] **MANQUANT**: Gestion des conflits de synchronisation
- [ ] **MANQUANT**: Indicateur de statut sync dans l'UI

## ✅ Fonctionnalités professionnelles implémentées

### Mode sombre et thèmes
- [x] ThemeProvider créé (lib/theme-context.tsx)
- [x] Support auto/light/dark mode
- [x] Couleur primaire personnalisable
- [x] Sauvegarde des préférences (getSettings/saveSettings)
- [x] Application du thème à tous les écrans
- [ ] **MANQUANT**: Toggle mode sombre dans Settings (UI existe mais pas connecté au ThemeProvider)
- [ ] **MANQUANT**: Sélecteur de couleur primaire dans Settings

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
- [ ] **MANQUANT**: UI pour afficher les métriques (pas d'écran analytics)
- [ ] **MANQUANT**: UI pour démarrer/arrêter le chrono de travail
- [ ] **MANQUANT**: UI pour ajouter les coûts de maintenance

### Espaces publicitaires
- [x] Composant AdBanner (banner + card variants)
- [x] Données mock pour publicités locales
- [x] Composant UsefulLinkCard
- [x] Liens vers ressources SAAQ, VMRS, formations
- [x] Catégorisation par type
- [ ] **MANQUANT**: Intégration dans les écrans (composants créés mais pas affichés)
- [ ] **MANQUANT**: API publicitaire réelle

### Gestion de documents
- [x] Service documents-service.ts complet
- [x] Upload de documents PDF et images (expo-document-picker)
- [x] Catégorisation (manual, invoice, registration, insurance, inspection, other)
- [x] Recherche par nom, notes, tags
- [x] Statistiques de documents (DocumentStats)
- [x] Suppression avec nettoyage des fichiers
- [ ] **MANQUANT**: UI pour gérer les documents (pas d'écran documents)
- [ ] **MANQUANT**: Prévisualisation de documents PDF
- [ ] **MANQUANT**: Intégration dans vehicle detail

### Paramètres avancés
- [x] Interface AppSettings dans data-service.ts
- [x] Sauvegarde des préférences (theme, primaryColor, language, dateFormat, distanceUnit, notifications, autoSync)
- [x] Écran Settings de base créé
- [ ] **MANQUANT**: UI pour modifier la langue (fr/en)
- [ ] **MANQUANT**: UI pour changer le format de date
- [ ] **MANQUANT**: UI pour changer les unités (km/mi)
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
