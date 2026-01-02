# FleetCore

**Application mobile de gestion des inspections de véhicules lourds conforme aux normes SAAQ**

FleetCore est une solution complète pour la gestion des flottes de véhicules lourds au Québec. L'application permet aux entreprises de transport de gérer leurs véhicules, effectuer des inspections conformes aux normes de la SAAQ, et maintenir une traçabilité complète pour les audits.

## Fonctionnalités principales

### Gestion de flotte
- Inventaire complet des véhicules (tracteurs, remorques, autobus)
- Suivi des états (actif, maintenance, immobilisé légalement)
- Galerie de photos et documents par véhicule
- Historique des inspections et maintenances

### Inspections SAAQ
- Checklists conformes aux 8 sections réglementaires
- 420+ codes de défauts officiels intégrés
- Codes VMRS pour la classification des composants
- Capture de preuves (photos et vidéos)
- Génération de rapports PDF conformes

### Rôles et permissions
- **Administrateur** : gestion complète, audit, utilisateurs
- **Gestionnaire** : KPIs flotte, approbations, rapports
- **Dispatcher** : calendrier, assignations, planning
- **Technicien** : bons de travail, chronomètre, pièces
- **Chauffeur** : ronde de sécurité, signalement défauts

### Intégrations
- **Jotform** : formulaires de ronde de sécurité et signalement
- **Perplexity AI** : diagnostic intelligent des défauts
- **Stripe** : facturation flexible (pay-per-vehicle, pay-per-employee)
- **Notifications push** : alertes en temps réel

## Installation

### Prérequis
- Node.js 18+
- pnpm 9+
- Expo CLI
- iOS Simulator ou appareil Android avec Expo Go

### Démarrage rapide

```bash
# Cloner le projet
git clone <repository-url>
cd fleetcore

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

L'application sera accessible via :
- **Web** : http://localhost:8081
- **Mobile** : Scanner le QR code avec Expo Go

## Structure du projet

```
fleetcore/
├── app/                    # Écrans (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   ├── dashboard/         # Dashboards par rôle
│   ├── settings/          # Paramètres
│   └── ...
├── components/            # Composants réutilisables
│   └── ui/               # Composants UI (StatCard, etc.)
├── lib/                   # Services et logique métier
│   ├── data-service.ts   # Gestion des données
│   ├── role-service.ts   # Gestion des rôles
│   ├── sync-service.ts   # Synchronisation offline
│   └── ...
├── server/               # Backend API (tRPC)
├── drizzle/              # Schémas de base de données
└── assets/               # Images et ressources
```

## Services principaux

| Service | Description |
|---------|-------------|
| `data-service.ts` | CRUD véhicules et inspections |
| `role-service.ts` | Gestion des rôles et permissions |
| `sync-service.ts` | Synchronisation offline-first |
| `audit-service.ts` | Journal d'audit légal |
| `notification-service.ts` | Notifications push |
| `reports-service.ts` | Génération de rapports |
| `i18n-service.ts` | Traduction FR/EN |
| `demo-data-service.ts` | Données de démonstration |
| `tutorial-service.ts` | Tutoriel interactif |

## Configuration

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL=postgresql://...

# Stripe (paiements)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Perplexity (diagnostic IA)
SONAR_API_KEY=pplx-...

# Jotform (formulaires)
JOTFORM_API_KEY=...
```

### Plans d'abonnement

| Plan | Véhicules | Fonctionnalités |
|------|-----------|-----------------|
| Free | 3 max | Inspections de base |
| Pro | 25 max | Sync cloud, métriques |
| Enterprise | Illimité | Toutes fonctionnalités |

## Tests

```bash
# Exécuter tous les tests
pnpm test

# Tests en mode watch
pnpm test --watch
```

## Déploiement

1. Créer un checkpoint : cliquer sur "Save Checkpoint" dans l'interface
2. Publier : cliquer sur "Publish" dans le panneau de gestion

## Documentation

- [Guide utilisateur](./USER_GUIDE.md) - Instructions pour les utilisateurs finaux
- [Documentation technique](./TECHNICAL.md) - Architecture et API
- [Changelog](./CHANGELOG.md) - Historique des versions

## Support

Pour toute question ou assistance :
- Documentation SAAQ : [saaq.gouv.qc.ca](https://saaq.gouv.qc.ca)
- Codes VMRS : [vmrs.com](https://www.vmrs.com)

## Licence

Propriétaire - Tous droits réservés
