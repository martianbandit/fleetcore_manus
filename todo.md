# FleetCore - TODO

## Configuration initiale
- [x] Configurer le thème de couleurs FleetCore
- [x] Ajouter les mappings d'icônes nécessaires
- [x] Configurer le logo de l'application
- [x] Mettre à jour app.config.ts avec le nom FleetCore

## Modèles de données
- [x] Créer les types TypeScript (Vehicle, Inspection, ChecklistItem, etc.)
- [x] Créer le service de données avec AsyncStorage
- [x] Implémenter les données mock pour le développement

## Écrans - Tab Bar
- [x] Dashboard (tableau de bord principal)
- [x] Vehicles (liste des véhicules)
- [x] Inspections (liste des inspections)
- [x] Settings (paramètres)

## Écrans - Navigation Stack
- [x] Vehicle Detail (détail d'un véhicule)
- [x] Inspection Detail (détail d'une inspection)
- [x] New Inspection (création d'inspection)
- [x] Checklist (inspection guidée)

## Composants UI
- [x] KPI Card (carte de statistique)
- [x] Vehicle Card (carte véhicule)
- [x] Inspection Card (carte inspection)
- [x] Status Badge (badge de statut)
- [x] Progress Bar (barre de progression)
- [x] Search Bar (barre de recherche)

## Fonctionnalités Dashboard
- [x] Affichage des KPIs (véhicules, inspections, défauts, conformité)
- [x] Section activité récente
- [x] Actions rapides
- [x] Alertes critiques

## Fonctionnalités Véhicules
- [x] Liste des véhicules avec recherche
- [x] Filtrage par statut
- [x] Détail véhicule avec historique

## Fonctionnalités Inspections
- [x] Liste des inspections avec filtres
- [x] Création d'inspection
- [x] Checklist dynamique
- [x] Gestion des statuts (DRAFT, IN_PROGRESS, COMPLETED, BLOCKED)

## Tests et finalisation
- [x] Tests unitaires des services
- [x] Vérification de l'interface sur différentes tailles d'écran
- [x] Optimisation des performances

## Intégration documents officiels
- [x] Parser et intégrer le guide de sécurité routière JSON (2160 lignes de défauts)
- [x] Intégrer les codes VMRS pour répertorier les composants
- [x] Mettre à jour la checklist avec les codes officiels du formulaire SAAQ
- [x] Ajouter les codes de localisation (diagramme 1-19, positions 40-57)

## Capture de preuves
- [x] Implémenter la prise de photo lors de la détection de défauts
- [x] Implémenter la capture vidéo pour les défauts complexes
- [x] Ajouter la galerie de preuves dans le détail d'inspection
- [x] Associer les preuves aux items de checklist

## Génération PDF
- [x] Créer le template PDF conforme au formulaire SAAQ
- [x] Inclure les informations du véhicule et du technicien
- [x] Générer le tableau des défauts avec codes VMRS
- [x] Ajouter les preuves photographiques au rapport
- [x] Inclure la section "Preuves de réparation"
- [x] Ajouter les signatures électroniques

## Synchronisation cloud
- [x] Configurer la base de données MySQL
- [x] Créer les schémas Drizzle pour véhicules et inspections
- [x] Implémenter les API tRPC pour sync
- [x] Ajouter le mode hors-ligne avec AsyncStorage
- [ ] Synchroniser automatiquement lors de la connexion (implémentation client)
- [ ] Gérer les conflits de synchronisation

## Nettoyage et refonte
- [x] Supprimer toutes les données mock
- [x] Vider la base de données locale (AsyncStorage)
- [x] Créer un état initial vierge

## Mode sombre et thèmes
- [x] Implémenter le toggle mode sombre dans les paramètres
- [x] Créer des thèmes personnalisables (couleurs primaires, accents)
- [x] Sauvegarder les préférences de thème
- [x] Appliquer le thème à tous les écrans

## CRUD Véhicules complet
- [x] Écran d'ajout de véhicule avec formulaire complet
- [x] Upload d'image de couverture pour chaque véhicule
- [x] Édition des informations véhicule
- [x] Suppression de véhicule avec confirmation
- [ ] Galerie d'images par véhicule (implémentation partielle)
- [x] Validation des champs (VIN 17 caractères, etc.)

## Métriques et collecte de données
- [x] Temps de travail par composant
- [x] Historique des temps d'inspection
- [x] Statistiques par technicien
- [x] Coûts de maintenance par véhicule
- [x] Durée de vie des composants
- [x] Fréquence des défauts par type
- [x] Tableau de bord analytique avancé
- [x] Export des métriques en CSV

## Espaces publicitaires
- [x] Bannières publicitaires ciblées
- [x] Publicités locales (garages, pièces détachées)
- [x] Liens vers fournisseurs partenaires
- [x] Section "Ressources utiles"
- [ ] Intégration API publicitaire (structure prête, à connecter)

## Gestion de documents
- [x] Upload de documents PDF (manuels, factures)
- [x] Galerie de documents par véhicule
- [ ] Prévisualisation de documents (structure prête)
- [x] Catégorisation des documents
- [x] Recherche dans les documents

## Paramètres avancés
- [x] Configuration des collecteurs de métriques
- [ ] Personnalisation des champs de formulaire (à implémenter dans UI)
- [x] Gestion des notifications
- [x] Paramètres de synchronisation
- [x] Langue de l'interface
- [x] Format de date/heure
- [x] Unités de mesure (km/mi)

## Relations et tables
- [ ] Table de relations véhicule-technicien
- [ ] Historique des affectations
- [ ] Gestion des équipes
- [ ] Permissions par rôle
