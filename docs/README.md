# Documentation FleetCore

**Version 18.0** | **Janvier 2026**

---

## Présentation

FleetCore est une application mobile de gestion de flotte conforme aux exigences de la SAAQ (Société de l'assurance automobile du Québec). Elle permet de gérer les véhicules lourds, les inspections préventives, les bons de travail et l'inventaire de pièces dans un environnement sécurisé et synchronisé.

Cette documentation est organisée par rôle utilisateur pour faciliter l'accès aux informations pertinentes.

---

## Guides par rôle

| Guide | Public cible | Description |
|-------|--------------|-------------|
| [Guide Administrateur](./guide-administrateur.md) | Administrateurs système | Configuration, gestion des utilisateurs, permissions, abonnements |
| [Guide Gestionnaire](./guide-gestionnaire.md) | Gestionnaires de flotte | Supervision des véhicules, suivi des inspections, rapports |
| [Guide Technicien](./guide-technicien.md) | Techniciens mécaniciens | Inspections, bons de travail, fiches PEP, inventaire |
| [Guide Conducteur](./guide-conducteur.md) | Conducteurs | Rondes de sécurité quotidiennes, signalement des défauts |
| [Référence Rapide](./reference-rapide.md) | Tous | Aide-mémoire, codes, raccourcis |
| [**FAQ**](./faq.md) | Tous | Questions fréquentes, dépannage |

---

## Modules de l'application

### Modules de base (tous les plans)

| Module | Fonction |
|--------|----------|
| **Véhicules** | Gestion de la flotte (ajout, modification, suppression) |
| **Inspections** | Rondes de sécurité et inspections périodiques |
| **Documents** | Stockage des documents véhicules |
| **Rappels** | Alertes et échéances |
| **Analytics** | Statistiques et rapports |

### Modules avancés (plans Plus+)

| Module | Plan requis | Fonction |
|--------|-------------|----------|
| **Fiches PEP** | Plus+ | Entretien préventif SAAQ (formulaire 6609-30) |
| **FleetCommand** | Pro+ | Gestion des bons de travail |
| **FleetCrew** | Pro+ | Gestion de l'inventaire |
| **Synchronisation Google Calendar** | Plus+ | Intégration calendrier |

---

## Architecture technique

### Services principaux

| Service | Fichier | Fonction |
|---------|---------|----------|
| Data Service | `lib/data-service.ts` | Gestion des véhicules et inspections |
| PEP Service | `lib/pep-service.ts` | Fiches d'entretien préventif |
| Work Order Service | `lib/work-order-service.ts` | Bons de travail |
| Inventory Service | `lib/inventory-service.ts` | Gestion du stock |
| Calendar Service | `lib/calendar-service.ts` | Rappels et synchronisation |
| Team Service | `lib/team-service.ts` | Techniciens et équipes |
| Metrics Service | `lib/metrics-service.ts` | Statistiques et KPIs |
| Subscription Service | `lib/subscription-service.ts` | Plans d'abonnement |

### Stockage des données

FleetCore utilise AsyncStorage pour le stockage local des données. Les données sont persistées sur l'appareil et synchronisées avec le serveur lorsqu'une connexion réseau est disponible.

---

## Conformité réglementaire

### SAAQ (Québec)

FleetCore intègre les exigences réglementaires de la SAAQ pour l'entretien préventif des véhicules lourds :

- **Guide de vérification mécanique** : 420 défauts classifiés (mineurs et majeurs)
- **Codes VMRS** : 2 789 codes de composants standardisés
- **Formulaire PEP 6609-30** : Structure conforme aux 12 sections officielles
- **Fréquences d'inspection** : 3 mois (PNBV > 4 500 kg) ou 6 mois

### Références

- [Guide de vérification mécanique SAAQ](https://saaq.gouv.qc.ca/transport-lourd/verification-mecanique/)
- [Programme d'entretien préventif](https://saaq.gouv.qc.ca/transport-lourd/entretien-preventif/)
- [Codes VMRS](https://www.vmrs.org/)

---

## Historique des versions

| Version | Date | Principales nouveautés |
|---------|------|------------------------|
| 20.0 | Jan 2026 | FAQ interactive complète |
| 19.0 | Jan 2026 | Documentation utilisateurs |
| 18.0 | Jan 2026 | Améliorations PEP, KPI Dashboard |
| 17.0 | Jan 2026 | Fiches PEP SAAQ, plans d'abonnement |
| 16.0 | Jan 2026 | Relations et tables (techniciens, équipes) |
| 15.0 | Jan 2026 | Fonctionnalités manquantes complétées |
| 14.0 | Jan 2026 | Espaces publicitaires, nouveau thème |
| 13.0 | Jan 2026 | Notifications push, Google Calendar |
| 12.0 | Jan 2026 | Système de rappels |
| 11.0 | Jan 2026 | Analytics, chrono de travail |
| 10.0 | Jan 2026 | FleetCommand, FleetCrew |

---

## Support

Pour toute question ou problème technique :

- **Email** : support@fleetcore.app
- **Documentation en ligne** : docs.fleetcore.app
- **Statut des services** : status.fleetcore.app

---

**Documentation rédigée par Manus AI pour FleetCore v20.0**
