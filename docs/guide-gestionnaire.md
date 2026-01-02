# Guide Gestionnaire de Flotte FleetCore

**Version 18.0** | **Dernière mise à jour : Janvier 2026**

---

## Introduction

Ce guide s'adresse aux gestionnaires de flotte responsables de la supervision des véhicules, du suivi des inspections et de l'analyse des performances. En tant que gestionnaire, vous avez accès à l'ensemble des fonctionnalités de gestion sans les privilèges d'administration système.

Votre rôle consiste à maintenir la flotte en conformité avec les exigences réglementaires de la SAAQ, à optimiser les coûts de maintenance et à coordonner les équipes de techniciens. FleetCore vous fournit les outils nécessaires pour atteindre ces objectifs grâce à un tableau de bord centralisé, des rapports détaillés et un système de rappels automatisés.

---

## 1. Tableau de bord principal

### 1.1 Vue d'ensemble

Le tableau de bord (Dashboard) constitue le point d'entrée de FleetCore. Il affiche en temps réel les indicateurs clés de performance (KPIs) de votre flotte ainsi que les alertes nécessitant une attention immédiate.

| KPI | Description | Objectif |
|-----|-------------|----------|
| **Véhicules actifs** | Nombre de véhicules en service | Maximiser la disponibilité |
| **Inspections aujourd'hui** | Inspections réalisées ce jour | Suivre l'activité quotidienne |
| **Défauts actifs** | Défauts non résolus | Minimiser (objectif : 0 majeurs) |
| **Conformité** | Pourcentage de véhicules conformes | Maintenir > 95% |

### 1.2 Alertes critiques

La section des alertes affiche les situations nécessitant une intervention rapide. Les alertes sont classées par niveau de priorité : critique (rouge), haute (orange), moyenne (jaune) et basse (gris).

| Type d'alerte | Priorité | Action requise |
|---------------|----------|----------------|
| Défaut majeur non résolu | Critique | Planifier réparation immédiate |
| Inspection en retard | Haute | Assigner un technicien |
| Document expiré | Haute | Renouveler le document |
| Stock bas (inventaire) | Moyenne | Commander les pièces |
| Rappel à venir | Basse | Planifier l'intervention |

### 1.3 Modules connexes

Le Dashboard donne accès aux modules avancés de FleetCore via la section "Modules connexes".

| Module | Fonction | Plan requis |
|--------|----------|-------------|
| **FleetCommand** | Gestion des bons de travail | Pro+ |
| **FleetCrew** | Gestion de l'inventaire | Pro+ |
| **Fiches PEP** | Entretien préventif SAAQ | Plus+ |
| **Analytics** | Rapports et statistiques | Tous |
| **Coûts maintenance** | Suivi des dépenses | Tous |

---

## 2. Gestion des véhicules

### 2.1 Liste des véhicules

L'onglet **Véhicules** affiche l'ensemble de votre flotte avec des options de recherche et de filtrage. Utilisez la barre de recherche pour trouver un véhicule par son numéro d'unité, sa plaque ou son NIV.

Les filtres disponibles permettent d'afficher les véhicules par statut :

| Statut | Icône | Signification |
|--------|-------|---------------|
| Actif | 🟢 | Véhicule en service, conforme |
| Maintenance | 🟡 | Véhicule en réparation |
| Inactif | 🔴 | Véhicule hors service |

### 2.2 Fiche véhicule

La fiche détaillée d'un véhicule présente toutes les informations pertinentes organisées en sections.

**Informations générales** : Cette section affiche les données d'identification du véhicule (unité, plaque, NIV, marque, modèle, année) ainsi que son statut actuel et l'odomètre. Le PNBV (Poids nominal brut du véhicule) détermine la fréquence des inspections PEP requises.

**Historique des inspections** : La liste chronologique des inspections réalisées sur ce véhicule permet de suivre l'évolution de son état. Chaque inspection affiche son statut (complétée, en cours, bloquée), le nombre de défauts détectés et le technicien responsable.

**Documents associés** : Les documents liés au véhicule (assurance, immatriculation, manuels, factures) sont accessibles depuis cette section. Un indicateur signale les documents expirés ou à renouveler prochainement.

**Techniciens assignés** : Cette section liste les techniciens responsables du véhicule avec leurs dates d'affectation. Vous pouvez modifier les assignations en appuyant sur le bouton "Gérer".

**Fiches PEP** : L'historique des fiches d'entretien préventif SAAQ est affiché avec l'indicateur de conformité et la date du prochain entretien requis. Cette fonctionnalité est disponible pour les plans Plus et supérieurs.

### 2.3 Ajout et modification

Pour ajouter un nouveau véhicule, appuyez sur le bouton **+ Ajouter** depuis la liste des véhicules. Le formulaire guide la saisie des informations obligatoires avec validation automatique (format du NIV, plaque, etc.).

La modification d'un véhicule existant s'effectue depuis sa fiche détaillée en appuyant sur le bouton **Modifier**. La suppression d'un véhicule nécessite une confirmation et archive l'historique associé.

---

## 3. Suivi des inspections

### 3.1 Types d'inspections

FleetCore prend en charge plusieurs types d'inspections conformes aux exigences SAAQ.

| Type | Fréquence | Sections | Durée moyenne |
|------|-----------|----------|---------------|
| Ronde de sécurité | Quotidienne | 8 | 15-20 min |
| Inspection périodique | Mensuelle | 12 | 45-60 min |
| Fiche PEP | 3 ou 6 mois | 12 | 60-90 min |
| Inspection complète | Annuelle | 12+ | 2-3 heures |

### 3.2 Création d'une inspection

Pour créer une nouvelle inspection, accédez à l'onglet **Inspections** et appuyez sur **+ Nouvelle**. Sélectionnez le véhicule concerné puis le type d'inspection à réaliser.

L'inspection se déroule selon une checklist structurée en sections correspondant aux systèmes du véhicule. Chaque composant peut être marqué comme conforme, avec défaut mineur ou avec défaut majeur. Les défauts détectés peuvent être documentés par des photos prises directement depuis l'application.

### 3.3 Statuts d'inspection

| Statut | Description | Action gestionnaire |
|--------|-------------|---------------------|
| **Brouillon** | Inspection créée, non démarrée | Assigner un technicien |
| **En cours** | Inspection en cours de réalisation | Suivre la progression |
| **Complétée** | Inspection terminée | Valider et archiver |
| **Bloquée** | Défaut majeur empêchant la circulation | Planifier réparation urgente |

### 3.4 Rapport d'inspection

Une fois l'inspection complétée, un rapport PDF peut être généré depuis la fiche de l'inspection. Ce rapport conforme au format SAAQ inclut les informations du véhicule, la liste des composants vérifiés, les défauts détectés avec leurs codes VMRS et les photos de preuve.

---

## 4. FleetCommand : Bons de travail

### 4.1 Présentation

FleetCommand est le module de gestion des bons de travail (work orders). Il permet de planifier, assigner et suivre les interventions de maintenance sur les véhicules de la flotte.

### 4.2 Création d'un bon de travail

Un bon de travail peut être créé manuellement ou automatiquement suite à la détection d'un défaut lors d'une inspection. Les informations requises sont :

| Champ | Description |
|-------|-------------|
| Véhicule | Véhicule concerné par l'intervention |
| Type | Réparation, maintenance préventive, rappel |
| Priorité | Basse, normale, haute, urgente |
| Description | Détail du travail à effectuer |
| Technicien assigné | Responsable de l'intervention |
| Date limite | Échéance de réalisation |
| Coût estimé | Budget prévu pour l'intervention |

### 4.3 Suivi des interventions

Le tableau de bord FleetCommand affiche les statistiques des bons de travail : en attente, en cours, complétés ce mois, coûts totaux. Chaque bon de travail dispose d'un chronomètre de temps de travail permettant de mesurer la durée réelle de l'intervention.

### 4.4 Consommation de pièces

Lors de la réalisation d'un bon de travail, le technicien peut sélectionner les pièces utilisées depuis l'inventaire FleetCrew. Le stock est automatiquement mis à jour et le coût des pièces ajouté au bon de travail.

---

## 5. FleetCrew : Inventaire

### 5.1 Gestion du stock

FleetCrew permet de gérer l'inventaire des pièces, outils et consommables nécessaires à la maintenance de la flotte. Les articles sont organisés par catégorie.

| Catégorie | Exemples |
|-----------|----------|
| Pièces | Filtres, plaquettes, courroies |
| Outils | Clés, crics, équipements de diagnostic |
| Fluides | Huile moteur, liquide de frein, antigel |
| Pneus | Pneus neufs, pneus rechapés |
| Électrique | Batteries, ampoules, fusibles |
| Consommables | Gants, chiffons, produits de nettoyage |

### 5.2 Alertes de stock

FleetCrew génère automatiquement des alertes lorsque le stock d'un article passe sous le seuil minimum défini. Ces alertes apparaissent dans le Dashboard et peuvent déclencher des notifications push.

### 5.3 Historique des transactions

Chaque mouvement de stock (entrée, sortie, ajustement) est enregistré avec la date, la quantité, le motif et l'utilisateur responsable. Cet historique permet de tracer l'utilisation des pièces et d'optimiser les commandes.

---

## 6. Analytics et rapports

### 6.1 Écran Analytics

L'écran Analytics accessible depuis le Dashboard présente les statistiques détaillées de la flotte organisées en trois onglets.

**Onglet Flotte** : Statistiques globales des véhicules et inspections, graphique de tendance des inspections par mois, répartition des défauts par type.

**Onglet FleetCommand** : KPIs des bons de travail (temps moyen de réparation, coûts par véhicule, taux de complétion), graphique des coûts estimés vs réels.

**Onglet FleetCrew** : Valeur totale du stock, articles en stock bas, mouvements récents, répartition par catégorie.

### 6.2 Export des données

Les données peuvent être exportées au format CSV depuis l'écran Analytics pour une analyse approfondie dans un tableur. Les rapports disponibles incluent la liste des véhicules, l'historique des inspections, les coûts de maintenance et l'état de l'inventaire.

---

## 7. Calendrier et rappels

### 7.1 Gestion des rappels

Le système de rappels de FleetCore centralise toutes les échéances liées à la flotte. Accédez à la liste des rappels depuis **Dashboard > Rappels** ou depuis l'écran dédié.

| Type de rappel | Délais par défaut |
|----------------|-------------------|
| Inspection périodique | 30, 7, 1 jours |
| Maintenance préventive | 14, 7, 1 jours |
| Assurance | 60, 30, 7 jours |
| Immatriculation | 60, 30, 7 jours |
| Fiche PEP | 30, 14, 7, 1 jours |

### 7.2 Création de rappels personnalisés

Vous pouvez créer des rappels personnalisés depuis l'écran de gestion des rappels. Sélectionnez le véhicule concerné (optionnel), définissez la date d'échéance, la priorité et les délais de notification.

### 7.3 Synchronisation calendrier

La synchronisation avec Google Calendar permet de visualiser les rappels FleetCore dans votre agenda professionnel. Activez cette fonctionnalité depuis **Paramètres > Synchronisation calendrier**.

---

## 8. Bonnes pratiques

### 8.1 Routine quotidienne

En tant que gestionnaire de flotte, voici les actions recommandées au quotidien :

1. Consulter le Dashboard pour identifier les alertes critiques
2. Vérifier les inspections planifiées et leur avancement
3. Suivre les bons de travail en cours et leurs délais
4. Contrôler les niveaux de stock critiques
5. Valider les rapports d'inspection complétés

### 8.2 Indicateurs à surveiller

| Indicateur | Seuil d'alerte | Action corrective |
|------------|----------------|-------------------|
| Conformité flotte | < 95% | Prioriser les réparations |
| Défauts majeurs | > 0 | Intervention immédiate |
| Inspections en retard | > 5% | Renforcer la planification |
| Stock critique | > 3 articles | Passer commande |
| Bons de travail en retard | > 10% | Réaffecter les ressources |

### 8.3 Préparation aux audits

FleetCore conserve l'historique complet des inspections, bons de travail et fiches PEP. Pour préparer un audit SAAQ, exportez les rapports pertinents et vérifiez que tous les documents des véhicules sont à jour.

---

**Document rédigé par Manus AI pour FleetCore v18.0**
