# FleetCore - Design Document

## Vision

FleetCore est une application mobile de gestion de flotte et d'inspection de véhicules lourds conforme SAAQ. L'application est orientée terrain, capable de guider le technicien pas à pas, garantir la conformité réglementaire et produire des rapports exploitables.

---

## Screen List

### 1. Dashboard (Tableau de bord)
Écran principal affichant une vue d'ensemble de la flotte.

### 2. Vehicles (Véhicules)
Liste des véhicules de la flotte avec recherche et filtres.

### 3. Vehicle Detail (Détail véhicule)
Informations complètes d'un véhicule spécifique.

### 4. Inspections
Liste des inspections avec statuts (DRAFT, IN_PROGRESS, COMPLETED, BLOCKED).

### 5. Inspection Detail
Détail d'une inspection avec checklist et résultats.

### 6. New Inspection
Création d'une nouvelle inspection pour un véhicule.

### 7. Checklist (Inspection guidée)
Écran de checklist dynamique - 1 item = 1 écran.

### 8. Settings (Paramètres)
Configuration de l'application.

---

## Primary Content and Functionality

### Dashboard
- **KPIs Cards**: Nombre total de véhicules, inspections du jour, défauts actifs, score de conformité
- **Quick Actions**: Nouvelle inspection, voir véhicules, voir inspections
- **Recent Activity**: Liste des 5 dernières inspections
- **Fleet Health Chart**: Graphique de santé de la flotte
- **Alerts Section**: Alertes critiques (défauts majeurs, inspections en retard)

### Vehicles Screen
- **Search Bar**: Recherche par VIN, plaque, unité
- **Filter Chips**: Par statut (actif, inactif), classe
- **Vehicle Cards**: Photo, plaque, VIN, dernière inspection, statut
- **FAB**: Ajouter un nouveau véhicule

### Vehicle Detail
- **Header**: Photo, plaque, VIN
- **Info Section**: Classe, unité, entreprise, date d'ajout
- **Inspection History**: Liste des inspections passées
- **Actions**: Lancer inspection, modifier, archiver

### Inspections Screen
- **Tab Bar**: Toutes, En cours, Complétées, Bloquées
- **Inspection Cards**: Véhicule, date, technicien, statut, progression
- **Quick Filters**: Date, technicien

### Inspection Detail
- **Header**: Véhicule, date, technicien, statut
- **Progress Bar**: Avancement de la checklist
- **Results Summary**: OK, Mineure, Majeure counts
- **Checklist Items**: Liste des items avec statuts
- **Actions**: Continuer, Générer rapport, Clôturer

### New Inspection
- **Vehicle Selector**: Recherche et sélection du véhicule
- **Inspection Type**: Type d'inspection (périodique, pré-voyage)
- **Start Button**: Démarrer l'inspection

### Checklist Screen
- **Progress Indicator**: Item X sur Y
- **Item Title**: Nom de l'élément à inspecter
- **Status Buttons**: OK, Défaut mineur, Défaut majeur
- **Note Field**: Champ de note optionnel
- **Media Capture**: Boutons photo/vidéo (obligatoire si défaut)
- **Navigation**: Précédent, Suivant

### Settings
- **User Profile**: Nom, rôle
- **Notifications**: Activer/désactiver
- **Theme**: Clair/Sombre
- **About**: Version, support

---

## Key User Flows

### Flow 1: Lancer une inspection
1. Dashboard → Tap "Nouvelle inspection"
2. New Inspection → Sélectionner véhicule
3. New Inspection → Choisir type d'inspection
4. New Inspection → Tap "Démarrer"
5. Checklist → Parcourir les items un par un
6. Checklist → Marquer statut + ajouter preuve si défaut
7. Checklist → Compléter tous les items
8. Inspection Detail → Voir résumé
9. Inspection Detail → Générer rapport PDF

### Flow 2: Consulter un véhicule
1. Dashboard → Tap "Véhicules" ou Tab Véhicules
2. Vehicles → Rechercher ou parcourir
3. Vehicles → Tap sur une carte véhicule
4. Vehicle Detail → Voir informations et historique

### Flow 3: Reprendre une inspection
1. Dashboard → Section "Activité récente" ou Tab Inspections
2. Inspections → Filtrer par "En cours"
3. Inspections → Tap sur inspection
4. Inspection Detail → Tap "Continuer"
5. Checklist → Reprendre à l'item en cours

---

## Color Choices

### Primary Palette
- **Primary**: `#0066CC` (Bleu FleetCore - confiance, professionnalisme)
- **Primary Dark**: `#004C99`

### Status Colors
- **Success/OK**: `#22C55E` (Vert - élément conforme)
- **Warning/Minor**: `#F59E0B` (Orange - défaut mineur)
- **Error/Major**: `#EF4444` (Rouge - défaut majeur)

### Background Colors
- **Background Light**: `#F8FAFC`
- **Background Dark**: `#0F172A`
- **Surface Light**: `#FFFFFF`
- **Surface Dark**: `#1E293B`

### Text Colors
- **Foreground Light**: `#1E293B`
- **Foreground Dark**: `#F1F5F9`
- **Muted Light**: `#64748B`
- **Muted Dark**: `#94A3B8`

### Border Colors
- **Border Light**: `#E2E8F0`
- **Border Dark**: `#334155`

---

## UI Components

### Cards
- Coins arrondis (12px)
- Ombre légère
- Padding interne 16px
- Espacement entre cartes 12px

### Buttons
- Primary: Fond bleu, texte blanc, coins arrondis 8px
- Secondary: Fond transparent, bordure bleue, texte bleu
- Danger: Fond rouge, texte blanc

### Status Badges
- OK: Fond vert clair, texte vert foncé
- Mineur: Fond orange clair, texte orange foncé
- Majeur: Fond rouge clair, texte rouge foncé

### Tab Bar
- 4 tabs: Dashboard, Véhicules, Inspections, Paramètres
- Icônes SF Symbols / Material Icons
- Indicateur actif avec couleur primaire

---

## Typography

- **Headings**: SF Pro Display / System Bold
- **Body**: SF Pro Text / System Regular
- **Sizes**: 
  - H1: 28px
  - H2: 22px
  - H3: 18px
  - Body: 16px
  - Caption: 14px
  - Small: 12px

---

## Mobile-First Considerations

- Touch targets minimum 44x44px
- Swipe gestures pour navigation
- Pull-to-refresh sur les listes
- Bottom sheet pour actions contextuelles
- Haptic feedback sur actions importantes
- Support mode sombre natif
