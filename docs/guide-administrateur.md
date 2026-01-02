# Guide Administrateur FleetCore

**Version 18.0** | **Dernière mise à jour : Janvier 2026**

---

## Introduction

Ce guide s'adresse aux administrateurs système responsables de la configuration, de la gestion des utilisateurs et de la maintenance de l'application FleetCore. En tant qu'administrateur, vous disposez d'un accès complet à toutes les fonctionnalités de l'application, y compris la gestion des permissions, la configuration des abonnements et la supervision de l'ensemble de la flotte.

FleetCore est une application mobile de gestion de flotte conforme aux exigences de la SAAQ (Société de l'assurance automobile du Québec). Elle permet de gérer les véhicules, les inspections préventives, les bons de travail et l'inventaire de pièces dans un environnement sécurisé et synchronisé.

---

## 1. Configuration initiale

### 1.1 Accès à l'application

L'administrateur accède à FleetCore via l'application mobile disponible sur iOS et Android. Lors de la première connexion, vous devez configurer les paramètres de base de votre organisation.

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| Nom de l'entreprise | Identifiant de votre organisation | FleetCore |
| Langue | Langue de l'interface | Français |
| Format de date | Affichage des dates | DD/MM/YYYY |
| Unité de distance | Kilomètres ou miles | Kilomètres |
| Fuseau horaire | Heure locale | America/Montreal |

### 1.2 Configuration du thème

FleetCore propose un système de thème personnalisable accessible depuis **Paramètres > Apparence**. Vous pouvez configurer le mode d'affichage (clair, sombre ou automatique) ainsi que la couleur primaire de l'application. Le thème par défaut utilise une palette cyan néon (#00D4FF) optimisée pour une utilisation en environnement industriel.

### 1.3 Gestion des abonnements

FleetCore propose quatre niveaux d'abonnement adaptés aux besoins de chaque organisation.

| Plan | Prix mensuel | Véhicules | Fonctionnalités clés |
|------|--------------|-----------|----------------------|
| **Free** | Gratuit | 5 | Inspections de base, Dashboard |
| **Plus** | 29 $/mois | 25 | Fiches PEP SAAQ, Rappels automatiques |
| **Pro** | 79 $/mois | 100 | FleetCommand, FleetCrew, Analytics avancés |
| **Entreprise** | Sur devis | Illimité | API, Support dédié, Multi-sites |

Pour modifier votre abonnement, accédez à **Paramètres > Abonnement** ou contactez l'équipe commerciale pour les plans Entreprise.

---

## 2. Gestion des utilisateurs

### 2.1 Rôles et permissions

FleetCore utilise un système de permissions basé sur quatre rôles distincts. Chaque rôle dispose de droits spécifiques sur les différentes ressources de l'application.

| Rôle | Description | Niveau d'accès |
|------|-------------|----------------|
| **Admin** | Administrateur système | Accès complet à toutes les fonctionnalités |
| **Manager** | Gestionnaire de flotte | Gestion des véhicules, inspections et rapports |
| **Technician** | Technicien mécanicien | Inspections, bons de travail, inventaire |
| **Viewer** | Observateur | Consultation uniquement, aucune modification |

### 2.2 Matrice des permissions

Le tableau suivant détaille les permissions par défaut pour chaque rôle. Ces permissions peuvent être personnalisées depuis **Paramètres > Administration > Permissions**.

| Ressource | Admin | Manager | Technician | Viewer |
|-----------|-------|---------|------------|--------|
| Véhicules | CRUD | CRUD | R | R |
| Inspections | CRUD | CRUD | CRU | R |
| Bons de travail | CRUD | CRUD | CRU | R |
| Inventaire | CRUD | CRUD | RU | R |
| Techniciens | CRUD | CR | R | R |
| Équipes | CRUD | CRU | R | R |
| Rapports | CRUD | CRU | R | R |
| Paramètres | CRUD | R | R | - |

> **Légende** : C = Créer, R = Lire, U = Modifier, D = Supprimer

### 2.3 Création d'un utilisateur

Pour ajouter un nouvel utilisateur, accédez à **Paramètres > Administration > Techniciens** et appuyez sur le bouton **+ Nouveau**. Renseignez les informations suivantes :

1. **Informations personnelles** : Prénom, nom, email, téléphone
2. **Rôle** : Sélectionnez le niveau d'accès approprié
3. **Spécialités** : Cochez les domaines de compétence (moteur, freins, électrique, etc.)
4. **Équipe** : Assignez l'utilisateur à une équipe existante
5. **Certifications** : Ajoutez les certifications professionnelles

### 2.4 Gestion des équipes

Les équipes permettent de regrouper les techniciens par site, spécialité ou projet. Accédez à **Paramètres > Administration > Équipes** pour créer et gérer vos équipes.

Chaque équipe possède un nom, une description, une couleur distinctive et un chef d'équipe optionnel. Les statistiques d'équipe (nombre de membres, inspections réalisées, véhicules assignés) sont affichées sur la fiche de l'équipe.

---

## 3. Configuration des véhicules

### 3.1 Ajout d'un véhicule

L'ajout d'un véhicule s'effectue depuis l'onglet **Véhicules** en appuyant sur le bouton **+ Ajouter**. Les champs obligatoires sont identifiés par un astérisque.

| Champ | Format | Obligatoire | Exemple |
|-------|--------|-------------|---------|
| Numéro d'unité | Texte libre | Oui | UNIT-001 |
| Plaque d'immatriculation | Texte | Oui | ABC 123 |
| NIV (VIN) | 17 caractères | Oui | 1
HGBH41JXMN109186 |
| Marque | Texte | Oui | Freightliner |
| Modèle | Texte | Oui | Cascadia |
| Année | 4 chiffres | Oui | 2024 |
| Type | Liste déroulante | Oui | Tracteur routier |
| PNBV | Nombre (kg) | Non | 36 287 |
| Odomètre | Nombre (km) | Non | 125 000 |

### 3.2 Types de véhicules supportés

FleetCore prend en charge l'ensemble des véhicules lourds soumis à la réglementation SAAQ.

| Type | Code | Fréquence PEP |
|------|------|---------------|
| Tracteur routier | TRACTOR | 3 mois (PNBV > 4 500 kg) |
| Semi-remorque | TRAILER | 6 mois |
| Camion porteur | TRUCK | 3 ou 6 mois selon PNBV |
| Autobus | BUS | 3 mois |
| Véhicule d'urgence | EMERGENCY | 3 mois |

### 3.3 Rappels automatiques

Lors de l'ajout d'un véhicule, FleetCore crée automatiquement quatre rappels dans le calendrier :

1. **Inspection périodique** : Basée sur la fréquence réglementaire
2. **Assurance** : 60 jours avant expiration
3. **Immatriculation** : 60 jours avant expiration
4. **Maintenance préventive** : Selon le kilométrage ou la date

Ces rappels sont synchronisés avec Google Calendar si la fonctionnalité est activée dans **Paramètres > Synchronisation calendrier**.

---

## 4. Synchronisation et sauvegarde

### 4.1 Mode hors-ligne

FleetCore fonctionne en mode hors-ligne grâce au stockage local AsyncStorage. Toutes les données sont conservées sur l'appareil et synchronisées automatiquement lors du retour de la connexion réseau. L'indicateur de synchronisation dans l'en-tête du Dashboard affiche l'état actuel (Synchronisé, En cours, Hors-ligne).

### 4.2 Synchronisation Google Calendar

Pour activer la synchronisation avec Google Calendar, accédez à **Paramètres > Synchronisation calendrier** et connectez votre compte Google. Les rappels FleetCore seront alors créés comme événements dans votre agenda professionnel.

| Paramètre | Description |
|-----------|-------------|
| Synchronisation automatique | Active/désactive la sync automatique |
| Calendrier cible | Sélection du calendrier Google |
| Notifications | Délais de rappel (30, 14, 7, 1 jours) |

### 4.3 Notifications push

Les notifications push alertent les utilisateurs des événements critiques. Configurez les préférences dans **Paramètres > Notifications**.

| Type de notification | Délai par défaut |
|---------------------|------------------|
| Inspection due | 14, 7, 3, 1, 0 jours |
| Défaut majeur | Immédiat |
| Bon de travail urgent | Immédiat |
| Expiration document | 60, 30, 7 jours |
| Fiche PEP due | 30, 14, 7, 1 jours |

---

## 5. Sécurité et conformité

### 5.1 Conformité SAAQ

FleetCore intègre les exigences réglementaires de la SAAQ pour l'entretien préventif des véhicules lourds. L'application utilise les données officielles suivantes :

- **Guide de vérification mécanique** : 420 défauts classifiés (mineurs et majeurs)
- **Codes VMRS** : 2 789 codes de composants standardisés
- **Formulaire PEP 6609-30** : Structure conforme aux 12 sections officielles

### 5.2 Audit et traçabilité

Toutes les actions effectuées dans FleetCore sont horodatées et associées à l'utilisateur connecté. Les rapports d'inspection et les fiches PEP conservent l'historique complet des modifications pour répondre aux exigences d'audit.

### 5.3 Protection des données

Les données sont stockées localement sur l'appareil et chiffrées lors de la synchronisation cloud. L'application ne collecte aucune donnée personnelle au-delà des informations nécessaires au fonctionnement du service.

---

## 6. Maintenance et support

### 6.1 Mise à jour de l'application

FleetCore est mis à jour régulièrement pour intégrer de nouvelles fonctionnalités et corrections. Les mises à jour sont distribuées via l'App Store (iOS) et le Google Play Store (Android).

### 6.2 Support technique

Pour toute question ou problème technique, contactez le support FleetCore :

- **Email** : support@fleetcore.app
- **Documentation** : docs.fleetcore.app
- **Statut des services** : status.fleetcore.app

### 6.3 Sauvegarde des données

Il est recommandé d'exporter régulièrement les données de l'application depuis **Paramètres > Données > Exporter**. Les formats disponibles sont CSV et JSON.

---

## Annexe A : Raccourcis et navigation

| Action | Navigation |
|--------|------------|
| Accueil | Onglet Tableau de bord |
| Ajouter un véhicule | Véhicules > + Ajouter |
| Nouvelle inspection | Inspections > + Nouvelle |
| Créer un bon de travail | Dashboard > FleetCommand |
| Gérer l'inventaire | Dashboard > FleetCrew |
| Créer une fiche PEP | Dashboard > Fiches PEP (plans Plus+) |
| Paramètres système | Onglet Paramètres |
| Gestion des utilisateurs | Paramètres > Administration > Techniciens |
| Permissions | Paramètres > Administration > Permissions |

---

**Document rédigé par Manus AI pour FleetCore v18.0**
