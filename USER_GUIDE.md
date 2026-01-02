# Guide Utilisateur FleetCore

Ce guide vous accompagne dans l'utilisation de FleetCore pour gérer les inspections de votre flotte de véhicules lourds.

## Table des matières

1. [Premiers pas](#premiers-pas)
2. [Tableau de bord](#tableau-de-bord)
3. [Gestion des véhicules](#gestion-des-véhicules)
4. [Inspections](#inspections)
5. [Rapports](#rapports)
6. [Paramètres](#paramètres)

## Premiers pas

### Connexion

Au premier lancement, vous serez invité à vous connecter ou créer un compte. Vous pouvez également utiliser l'application en mode hors-ligne pour les fonctionnalités de base.

### Configuration initiale

Lors de la première utilisation, complétez les informations de votre entreprise dans les paramètres. Ces informations apparaîtront sur vos rapports d'inspection.

### Données de démonstration

Pour découvrir l'application, vous pouvez charger des données de démonstration depuis **Paramètres > Données > Charger données démo**. Cela ajoutera 5 véhicules et plusieurs inspections exemples.

## Tableau de bord

Le tableau de bord affiche un aperçu de l'état de votre flotte.

### Score de conformité

L'anneau de conformité indique le pourcentage de véhicules conformes aux normes SAAQ. Un score de 100% signifie que tous vos véhicules ont passé leur dernière inspection sans défaut majeur.

### Indicateurs clés

| Indicateur | Description |
|------------|-------------|
| Véhicules | Nombre total de véhicules actifs |
| Inspections | Inspections effectuées aujourd'hui |
| Défauts actifs | Défauts non résolus |
| Bons de travail | Travaux en attente |

### Actions rapides

Accédez rapidement aux fonctions principales depuis les cartes d'action en bas du tableau de bord.

## Gestion des véhicules

### Ajouter un véhicule

1. Accédez à l'onglet **Véhicules**
2. Appuyez sur le bouton **+**
3. Remplissez les informations obligatoires :
   - Numéro d'unité (ex: CAM-001)
   - Plaque d'immatriculation
   - NIV (numéro d'identification du véhicule)
   - Marque et modèle
   - Année
4. Appuyez sur **Enregistrer**

### États des véhicules

| État | Description | Icône |
|------|-------------|-------|
| Actif | Véhicule en service | 🟢 |
| Maintenance | En réparation | 🟡 |
| Immobilisé | Interdit de circulation | 🔴 |
| Retiré | Hors service | ⚫ |

### Documents et photos

Chaque véhicule peut avoir des documents et photos associés. Accédez au détail d'un véhicule pour :
- Ajouter des photos (galerie)
- Joindre des documents (immatriculation, assurance, factures)

## Inspections

### Types d'inspection

| Type | Fréquence | Description |
|------|-----------|-------------|
| Périodique | Annuelle | Inspection complète obligatoire |
| Pré-départ | Quotidienne | Vérification avant chaque trajet |
| Post-trajet | Quotidienne | Vérification après le trajet |

### Effectuer une inspection

1. Accédez à l'onglet **Inspections**
2. Appuyez sur **Nouvelle inspection**
3. Sélectionnez le véhicule
4. Choisissez le type d'inspection
5. Appuyez sur **Démarrer**

### Checklist SAAQ

L'inspection suit les 8 sections réglementaires de la SAAQ :

1. **Freins** - Système de freinage complet
2. **Direction** - Volant, colonne, timonerie
3. **Éclairage** - Phares, feux, clignotants
4. **Pneus** - État et pression
5. **Suspension** - Ressorts, amortisseurs
6. **Châssis** - Structure, fixations
7. **Attelage** - Sellette, crochets
8. **Accessoires** - Miroirs, essuie-glaces

### Signaler un défaut

Pour chaque item de la checklist :
1. Appuyez sur ✓ si conforme
2. Appuyez sur ✗ si défaut détecté
3. En cas de défaut :
   - Sélectionnez la gravité (mineur/majeur)
   - Ajoutez une description
   - Prenez une photo comme preuve

### Défauts majeurs

Un défaut majeur immobilise automatiquement le véhicule jusqu'à réparation. Les défauts majeurs incluent :
- Freins défaillants
- Direction compromise
- Éclairage non fonctionnel
- Pneus dangereux

## Rapports

### Générer un rapport PDF

1. Accédez au détail d'une inspection complétée
2. Appuyez sur **Générer le rapport PDF**
3. Le rapport conforme SAAQ sera créé avec :
   - Informations du véhicule
   - Résultats de l'inspection
   - Liste des défauts avec codes VMRS
   - Photos des preuves
   - Signature du technicien

### Consulter les statistiques

Accédez à **Paramètres > Rapports** pour voir :
- Taux de conformité sur 6/12 mois
- Temps d'immobilisation cumulé
- Coûts de maintenance par véhicule
- Historique des inspections

### Exporter les données

Exportez vos données en format CSV depuis l'écran Rapports pour analyse externe.

## Paramètres

### Profil entreprise

Configurez les informations de votre entreprise :
- Nom de l'entreprise
- Logo
- Coordonnées

### Notifications

Activez les notifications pour recevoir des alertes :
- Inspections en retard
- Défauts non résolus
- Rappels de maintenance

### Langue

FleetCore est disponible en français et en anglais. Changez la langue depuis **Paramètres > Langue**.

### Mode sombre

Activez le mode sombre pour réduire la fatigue oculaire dans les environnements peu éclairés.

### Synchronisation

L'application fonctionne hors-ligne. Vos données sont synchronisées automatiquement lorsque vous retrouvez une connexion internet.

## Rôles utilisateur

Selon votre rôle dans l'organisation, vous avez accès à différentes fonctionnalités.

### Chauffeur

- Effectuer les rondes de sécurité quotidiennes
- Signaler les défauts via formulaire
- Consulter l'historique de ses véhicules assignés

### Technicien

- Compléter les bons de travail
- Enregistrer les temps de réparation
- Documenter les pièces utilisées

### Dispatcher

- Planifier les inspections
- Assigner les véhicules aux chauffeurs
- Gérer le calendrier de la flotte

### Gestionnaire

- Consulter les KPIs de la flotte
- Approuver les réparations
- Générer les rapports de conformité

### Administrateur

- Gérer les utilisateurs et permissions
- Configurer les paramètres globaux
- Accéder au journal d'audit

## Assistance

### Ressources utiles

- [Guide de sécurité routière SAAQ](https://saaq.gouv.qc.ca)
- [Codes VMRS](https://www.vmrs.com)
- [Formations en ligne](https://saaq.gouv.qc.ca/formation)

### Tutoriel intégré

Accédez au tutoriel interactif depuis **Paramètres > Aide > Tutoriel** pour une visite guidée des fonctionnalités.

### Contact support

Pour toute question technique, consultez la documentation ou contactez le support de votre organisation.
