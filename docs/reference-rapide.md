# Référence Rapide FleetCore

**Version 18.0** | **Carte de référence pour tous les utilisateurs**

---

## Navigation principale

| Onglet | Icône | Fonction |
|--------|-------|----------|
| Tableau de bord | 🏠 | Vue d'ensemble, KPIs, alertes |
| Véhicules | 🚛 | Liste et gestion des véhicules |
| Inspections | 📋 | Rondes de sécurité et inspections |
| Paramètres | ⚙️ | Configuration et préférences |

---

## Actions rapides

| Action | Navigation |
|--------|------------|
| Ajouter un véhicule | Véhicules → + Ajouter |
| Nouvelle inspection | Inspections → + Nouvelle |
| Créer un bon de travail | Dashboard → FleetCommand → + Nouveau |
| Gérer l'inventaire | Dashboard → FleetCrew |
| Créer une fiche PEP | Dashboard → Fiches PEP → + Nouvelle |
| Voir les rappels | Dashboard → Rappels |
| Consulter les analytics | Dashboard → Analytics |

---

## Statuts d'inspection

| Statut | Couleur | Signification |
|--------|---------|---------------|
| Brouillon | Gris | Non démarrée |
| En cours | Bleu | En réalisation |
| Complétée | Vert | Terminée, véhicule conforme |
| Bloquée | Rouge | Défaut majeur, circulation interdite |

---

## Évaluation des composants

| Code | Signification | Action |
|------|---------------|--------|
| **S/O** | Sans objet | Composant non applicable |
| **C** | Conforme | Aucun défaut |
| **Min** | Défaut mineur | Documenter, planifier réparation |
| **Maj** | Défaut majeur | Documenter, bloquer véhicule |

---

## Types de défauts

### Défauts mineurs (exemples)
- Fissure mineure rétroviseur
- Ampoule intérieure grillée
- Usure légère balais essuie-glace
- Petit éclat pare-brise (hors vision)

### Défauts majeurs (exemples)
- Feu de freinage non fonctionnel
- Fuite liquide de frein
- Pneu avec hernie/coupure
- Direction avec jeu excessif
- Frein de stationnement inopérant

---

## Priorités des bons de travail

| Priorité | Délai | Couleur |
|----------|-------|---------|
| Urgente | Immédiat | Rouge |
| Haute | 24-48h | Orange |
| Normale | 1 semaine | Bleu |
| Basse | 2+ semaines | Gris |

---

## Fréquences PEP (SAAQ)

| PNBV | Fréquence |
|------|-----------|
| > 4 500 kg | 3 mois |
| ≤ 4 500 kg | 6 mois |

---

## Plans d'abonnement

| Plan | Prix | Véhicules | Fonctionnalités clés |
|------|------|-----------|----------------------|
| Free | 0 $ | 5 | Inspections de base |
| Plus | 29 $/mois | 25 | + Fiches PEP |
| Pro | 79 $/mois | 100 | + FleetCommand, FleetCrew |
| Entreprise | Sur devis | Illimité | + API, Multi-sites |

---

## Rôles et permissions

| Rôle | Véhicules | Inspections | Bons travail | Inventaire | Admin |
|------|-----------|-------------|--------------|------------|-------|
| Admin | CRUD | CRUD | CRUD | CRUD | CRUD |
| Manager | CRUD | CRUD | CRUD | CRUD | R |
| Technician | R | CRU | CRU | RU | - |
| Viewer | R | R | R | R | - |

*C=Créer, R=Lire, U=Modifier, D=Supprimer*

---

## Sections de la ronde de sécurité

| # | Section | Composants clés |
|---|---------|-----------------|
| 1 | Intérieur cabine | Volant, pédales, instruments |
| 2 | Compartiment moteur | Niveaux, courroies, fuites |
| 3 | Extérieur cabine | Rétroviseurs, vitres |
| 4 | Éclairage | Phares, feux, clignotants |
| 5 | Châssis/suspension | Ressorts, amortisseurs |
| 6 | Direction | Biellettes, rotules |
| 7 | Freinage | Disques, plaquettes, ABS |
| 8 | Roues/pneus | Pression, usure, fixations |

---

## Codes VMRS courants

| Code | Système |
|------|---------|
| 013 | Freinage |
| 014 | Direction |
| 015 | Suspension |
| 017 | Roues/pneus |
| 033 | Éclairage |
| 042 | Électrique |
| 045 | Moteur |

---

## Rappels automatiques

| Type | Délais par défaut |
|------|-------------------|
| Inspection | 30, 7, 1 jours |
| Assurance | 60, 30, 7 jours |
| Immatriculation | 60, 30, 7 jours |
| Fiche PEP | 30, 14, 7, 1 jours |
| Maintenance | 14, 7, 1 jours |

---

## Raccourcis clavier (Web)

| Raccourci | Action |
|-----------|--------|
| Ctrl + N | Nouvelle inspection |
| Ctrl + F | Rechercher |
| Ctrl + S | Sauvegarder |
| Esc | Annuler/Fermer |

---

## Indicateurs du Dashboard

| Icône | Signification |
|-------|---------------|
| 🟢 | Synchronisé |
| 🟡 | Synchronisation en cours |
| 🔴 | Hors ligne |
| ⚠️ | Alerte active |
| 🔔 | Notification |

---

## Support

| Canal | Contact |
|-------|---------|
| Email | support@fleetcore.app |
| Documentation | docs.fleetcore.app |
| Statut services | status.fleetcore.app |

---

## Glossaire express

| Terme | Définition |
|-------|------------|
| PNBV | Poids nominal brut du véhicule |
| NIV/VIN | Numéro d'identification véhicule |
| VMRS | Vehicle Maintenance Reporting Standards |
| PEP | Programme d'entretien préventif |
| SAAQ | Société assurance automobile Québec |

---

**FleetCore v18.0** | **Manus AI**
